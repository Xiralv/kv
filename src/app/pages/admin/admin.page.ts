import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminService, AdminGuest, AdminStats } from '../../services/admin/admin.service';
import { SupabaseService, PrenupPhoto } from '../../services/api/supabase.service';


const ADMIN_PASSWORD = 'kv2026admin'; // change this before deploying

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  styleUrls: ['admin.page.scss'],
  standalone: false,
})
export class AdminPage implements OnInit {

  // ── Auth ────────────────────────────────────────────────────────────────────
  isAuthenticated = false;
  passwordInput = '';
  authError = false;

  // ── View mode ───────────────────────────────────────────────────────────────
  // 'dashboard' = couple's full admin view
  // 'checkin'   = coordinator's simplified check-in scanner view
  // 'prenup'    = manage the prenup album (upload / caption / delete)
  viewMode: 'dashboard' | 'checkin' | 'prenup' = 'dashboard';

  // ── Data ────────────────────────────────────────────────────────────────────
  allGuests: AdminGuest[] = [];
  filteredGuests: AdminGuest[] = [];
  stats: AdminStats = { total: 0, confirmed: 0, declined: 0, pending: 0, checked_in: 0 };
  isLoading = true;
  isSaving = false;

  // ── Search & filter ─────────────────────────────────────────────────────────
  searchQuery = '';
  filterStatus: 'all' | 'confirmed' | 'declined' | 'pending' | 'checked_in' | 'vip' = 'all';

  // Table picker options — used in both add-form and edit modal
  readonly tableOptions: string[] = [
    'VIP 1', 'VIP 2',
    ...Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`),
  ];

  // ── Edit modal ──────────────────────────────────────────────────────────────
  editingGuest: AdminGuest | null = null;
  editName = '';
  editAttend: boolean | null = null;
  editTable = '';

  // ── Add guest ───────────────────────────────────────────────────────────────
  showAddForm = false;
  newGuestName = '';
  newGuestTable = '';

  // ── Prenup album ────────────────────────────────────────────────────────────
  prenupPhotos: PrenupPhoto[] = [];
  isLoadingPrenup = false;
  isUploadingPrenup = false;
  isSavingPrenup = false;

  readonly MAX_PRENUP_UPLOAD = 10;
  selectedFiles: File[] = [];
  selectedFilePreviews: string[] = [];
  newPrenupCaption = '';
  uploadProgress = { current: 0, total: 0 };

  editingPrenupPhoto: PrenupPhoto | null = null;
  editPrenupCaption = '';
  editPrenupSortOrder = 0;

  constructor(
    private adminService: AdminService,
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() { }

  // ── Auth ─────────────────────────────────────────────────────────────────────

  login() {
    if (this.passwordInput === ADMIN_PASSWORD) {
      this.isAuthenticated = true;
      this.authError = false;
      this.loadData();
    } else {
      this.authError = true;
      this.passwordInput = '';
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.passwordInput = '';
    this.allGuests = [];
    this.prenupPhotos = [];
    this.cancelPrenupUpload();
    this.viewMode = 'dashboard';
  }

  // ── Load ─────────────────────────────────────────────────────────────────────

  async loadData() {
    this.isLoading = true;
    try {
      const [guests, stats] = await Promise.all([
        this.adminService.getAllGuests(),
        this.adminService.getStats(),
      ]);
      this.allGuests = guests;
      this.stats = stats;
      this.applyFilter();
    } catch (err) {
      console.error(err);
      await this.showToast('Failed to load guest data', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // ── Search & filter ──────────────────────────────────────────────────────────

  onSearch(event: any) {
    this.searchQuery = event.detail.value || '';
    this.applyFilter();
  }

  setFilter(status: typeof this.filterStatus) {
    this.filterStatus = status;
    this.applyFilter();
  }

  private applyFilter() {
    let guests = [...this.allGuests];

    // Text search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      guests = guests.filter(g =>
        g.full_name.toLowerCase().includes(q) ||
        (g.table_number || '').toLowerCase().includes(q),
      );
    }

    // Status filter
    switch (this.filterStatus) {
      case 'confirmed': guests = guests.filter(g => g.attend === true); break;
      case 'declined': guests = guests.filter(g => g.attend === false); break;
      case 'pending': guests = guests.filter(g => g.attend === null); break;
      case 'checked_in': guests = guests.filter(g => g.checked_in); break;
      case 'vip': guests = guests.filter(g => g.table_number?.startsWith('VIP')); break;
    }

    this.filteredGuests = guests;
  }

  // ── Check-in toggle ──────────────────────────────────────────────────────────

  async toggleCheckIn(guest: AdminGuest) {
    const newState = !guest.checked_in;
    guest.checked_in = newState; // optimistic update
    try {
      await this.adminService.toggleCheckIn(guest.id, newState);
      this.stats.checked_in += newState ? 1 : -1;
      await this.showToast(
        newState ? `${guest.full_name} checked in ✓` : `${guest.full_name} check-in removed`,
        newState ? 'success' : 'warning',
      );
    } catch (err) {
      guest.checked_in = !newState; // revert on error
      await this.showToast('Failed to update check-in', 'danger');
    }
  }

  // ── Edit guest ───────────────────────────────────────────────────────────────

  openEdit(guest: AdminGuest) {
    this.editingGuest = { ...guest };
    this.editName = guest.full_name;
    this.editAttend = guest.attend;
    this.editTable = guest.table_number || '';
  }

  closeEdit() {
    this.editingGuest = null;
  }

  async saveEdit() {
    if (!this.editingGuest || !this.editName.trim()) return;
    this.isSaving = true;
    try {
      await this.adminService.updateGuest(
        this.editingGuest.id,
        this.editName.trim(),
        this.editAttend,
        this.editTable.trim() || null,
      );
      // Update local list
      const idx = this.allGuests.findIndex(g => g.id === this.editingGuest!.id);
      if (idx > -1) {
        this.allGuests[idx] = {
          ...this.allGuests[idx],
          full_name: this.editName.trim(),
          attend: this.editAttend,
          table_number: this.editTable.trim() || null,
        };
      }
      this.applyFilter();
      await this.loadStats();
      this.closeEdit();
      await this.showToast('Guest updated', 'success');
    } catch (err) {
      await this.showToast('Failed to save changes', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  // ── Delete guest ─────────────────────────────────────────────────────────────

  async confirmDelete(guest: AdminGuest) {
    const alert = await this.alertCtrl.create({
      header: 'Delete guest?',
      message: `This will permanently remove ${guest.full_name} from the guest list.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: () => this.deleteGuest(guest),
        },
      ],
    });
    await alert.present();
  }

  private async deleteGuest(guest: AdminGuest) {
    try {
      await this.adminService.deleteGuest(guest.id);
      this.allGuests = this.allGuests.filter(g => g.id !== guest.id);
      this.applyFilter();
      await this.loadStats();
      this.closeEdit();
      await this.showToast(`${guest.full_name} deleted`, 'warning');
    } catch (err) {
      await this.showToast('Failed to delete guest', 'danger');
    }
  }

  // ── Add guest ────────────────────────────────────────────────────────────────

  async addGuest() {
    if (!this.newGuestName.trim()) return;
    this.isSaving = true;
    try {
      const newId = await this.adminService.addGuest(
        this.newGuestName.trim(),
        this.newGuestTable.trim() || null,
      );
      const newGuest: AdminGuest = {
        id: newId,
        full_name: this.newGuestName.trim(),
        attend: null,
        table_number: this.newGuestTable.trim() || null,
        checked_in: false,
        checked_in_at: null,
        updated_at: new Date().toISOString(),
      };
      this.allGuests = [newGuest, ...this.allGuests];
      this.applyFilter();
      await this.loadStats();
      this.newGuestName = '';
      this.newGuestTable = '';
      this.showAddForm = false;
      await this.showToast(`${newGuest.full_name} added`, 'success');
    } catch (err) {
      await this.showToast('Failed to add guest', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  // ── View switching ───────────────────────────────────────────────────────────

  switchView(mode: 'dashboard' | 'checkin' | 'prenup') {
    this.viewMode = mode;
    if (mode === 'prenup' && this.prenupPhotos.length === 0 && !this.isLoadingPrenup) {
      this.loadPrenupPhotos();
    }
  }

  // ── Prenup album ─────────────────────────────────────────────────────────────

  async loadPrenupPhotos() {
    this.isLoadingPrenup = true;
    try {
      this.prenupPhotos = await this.supabaseService.getPrenupPhotos();
    } catch (err) {
      console.error(err);
      await this.showToast('Failed to load prenup album', 'danger');
    } finally {
      this.isLoadingPrenup = false;
    }
  }

  onPrenupFileSelected(event: any) {
    const files: FileList | undefined = event.target?.files;
    if (!files || files.length === 0) return;

    let chosen = Array.from(files);

    const nonImages = chosen.filter(f => !f.type.startsWith('image/'));
    if (nonImages.length > 0) {
      this.showToast('Skipped non-image files', 'warning');
      chosen = chosen.filter(f => f.type.startsWith('image/'));
    }

    // Add to whatever's already selected, capped at the max.
    const combined = [...this.selectedFiles, ...chosen];
    if (combined.length > this.MAX_PRENUP_UPLOAD) {
      this.showToast(`Max ${this.MAX_PRENUP_UPLOAD} photos at a time — extra ones were skipped`, 'warning');
    }
    this.selectedFiles = combined.slice(0, this.MAX_PRENUP_UPLOAD);
    this.selectedFilePreviews = this.selectedFiles.map(f => URL.createObjectURL(f));

    // Allow re-selecting the same file(s) later.
    event.target.value = '';
  }

  removeSelectedFile(index: number) {
    URL.revokeObjectURL(this.selectedFilePreviews[index]);
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.selectedFilePreviews = this.selectedFilePreviews.filter((_, i) => i !== index);
  }

  cancelPrenupUpload() {
    this.selectedFilePreviews.forEach(url => URL.revokeObjectURL(url));
    this.selectedFiles = [];
    this.selectedFilePreviews = [];
    this.newPrenupCaption = '';
    this.uploadProgress = { current: 0, total: 0 };
  }

  async uploadPrenupPhoto() {
    if (this.selectedFiles.length === 0) return;
    this.isUploadingPrenup = true;
    this.uploadProgress = { current: 0, total: this.selectedFiles.length };

    let nextOrder = this.prenupPhotos.length > 0
      ? Math.max(...this.prenupPhotos.map(p => p.sort_order)) + 1
      : 1;

    const uploaded: PrenupPhoto[] = [];
    const failed: string[] = [];

    for (const file of this.selectedFiles) {
      try {
        const photo = await this.supabaseService.uploadPrenupPhoto(
          file,
          this.newPrenupCaption.trim() || null,
          nextOrder++,
        );
        uploaded.push(photo);
      } catch (err) {
        console.error(err);
        failed.push(file.name);
      }
      this.uploadProgress.current++;
    }

    if (uploaded.length > 0) {
      this.prenupPhotos = [...this.prenupPhotos, ...uploaded];
    }

    this.cancelPrenupUpload();
    this.isUploadingPrenup = false;

    if (failed.length === 0) {
      await this.showToast(
        `${uploaded.length} photo${uploaded.length !== 1 ? 's' : ''} uploaded`, 'success',
      );
    } else {
      await this.showToast(
        `${uploaded.length} uploaded, ${failed.length} failed`, 'danger',
      );
    }
  }

  openEditPrenup(photo: PrenupPhoto) {
    this.editingPrenupPhoto = photo;
    this.editPrenupCaption = photo.caption || '';
    this.editPrenupSortOrder = photo.sort_order;
  }

  closeEditPrenup() {
    this.editingPrenupPhoto = null;
  }

  async saveEditPrenup() {
    if (!this.editingPrenupPhoto) return;
    this.isSavingPrenup = true;
    try {
      await this.supabaseService.updatePrenupPhoto(
        this.editingPrenupPhoto.id,
        this.editPrenupCaption.trim() || null,
        this.editPrenupSortOrder,
      );
      const idx = this.prenupPhotos.findIndex(p => p.id === this.editingPrenupPhoto!.id);
      if (idx > -1) {
        this.prenupPhotos[idx] = {
          ...this.prenupPhotos[idx],
          caption: this.editPrenupCaption.trim() || null,
          sort_order: this.editPrenupSortOrder,
        };
      }
      this.prenupPhotos.sort((a, b) => a.sort_order - b.sort_order);
      this.closeEditPrenup();
      await this.showToast('Photo updated', 'success');
    } catch (err) {
      console.error(err);
      await this.showToast('Failed to save changes', 'danger');
    } finally {
      this.isSavingPrenup = false;
    }
  }

  async confirmDeletePrenup(photo: PrenupPhoto) {
    const alert = await this.alertCtrl.create({
      header: 'Delete photo?',
      message: 'This will permanently remove this photo from the prenup album.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: () => this.deletePrenupPhoto(photo),
        },
      ],
    });
    await alert.present();
  }

  private async deletePrenupPhoto(photo: PrenupPhoto) {
    try {
      await this.supabaseService.deletePrenupPhoto(photo.id, photo.storage_path);
      this.prenupPhotos = this.prenupPhotos.filter(p => p.id !== photo.id);
      this.closeEditPrenup();
      await this.showToast('Photo deleted', 'warning');
    } catch (err) {
      console.error(err);
      await this.showToast('Failed to delete photo', 'danger');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async loadStats() {
    this.stats = await this.adminService.getStats();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, color, duration: 2200, position: 'top',
    });
    await toast.present();
  }

  attendLabel(attend: boolean | null): string {
    if (attend === true) return 'Confirmed';
    if (attend === false) return 'Declined';
    return 'Pending';
  }

  attendColor(attend: boolean | null): string {
    if (attend === true) return 'success';
    if (attend === false) return 'danger';
    return 'warning';
  }

  isVip(guest: AdminGuest): boolean {
    return guest.table_number === 'VIP 1' || guest.table_number === 'VIP 2';
  }

  vipLabel(guest: AdminGuest): string {
    return guest.table_number || '';
  }

  get checkinPercent(): number {
    if (!this.stats.confirmed) return 0;
    return Math.round((this.stats.checked_in / this.stats.confirmed) * 100);
  }
}