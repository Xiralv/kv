import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AnimationOptions } from 'ngx-lottie';
import { SupabaseService, Guest } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

const RSVP_SUBMITTED_KEY = 'rsvp_submitted_ids';

@Component({
  selector: 'app-verify-rsvp',
  templateUrl: './verify-rsvp.page.html',
  styleUrls: ['./verify-rsvp.page.scss'],
  standalone: false
})
export class VerifyRsvpPage implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  rsvpForm: FormGroup;
  arrGuests: Guest[] = [];

  congratsOptions: AnimationOptions = {
    path: 'assets/lottiefiles/congratulation.json',
    loop: true,
    autoplay: true,
  };


  /** True when the guest re-opens the RSVP and we detected an existing answer in the DB */
  isAlreadyAnswered = false;
  isLoading = false;

  /**
   * Passed by the home page when hasSubmittedRsvp is true.
   * When present, ngOnInit skips the name-input slide and loads the
   * guest's existing answers directly from Supabase.
   */
  @Input() autoLoadName: string | null = null;

  /**
   * The name used to verify this party (typed on slide 1, or passed in via
   * autoLoadName). Sent alongside every write so submit_rsvp_response() can
   * confirm server-side that the guest id being updated actually belongs
   * to this party.
   */
  private verifiedFullname = '';

  constructor(
    private fb: FormBuilder,
    private api: SupabaseService,
    private global: GlobalService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {
    this.rsvpForm = this.fb.group({
      fullname: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    // Home page passed the stored name → skip slide 1 and show summary directly
    if (this.autoLoadName) {
      await this.loadAndShowSummary(this.autoLoadName);
    }
  }

  /**
   * Fetches the guest group by name and jumps to the read-only summary slide.
   * Used both by the auto-load path (View My RSVP) and onSubmit when the DB
   * already has answers for the group.
   */
  private async loadAndShowSummary(fullname: string): Promise<void> {
    this.isLoading = true;
    try {
      const allGuests = await this.api.getGuestWithRelations(fullname);
      this.arrGuests = allGuests;
      this.verifiedFullname = fullname;
      this.isAlreadyAnswered = true;
      // Small delay so the swiper is fully initialised before we slide
      setTimeout(() => this.skipToThankYou(), 150);
    } catch (err) {
      this.global.presentToast(
        `Couldn't load your RSVP — please try again or contact Kamille / Vlarix`,
        'warning',
        'alert-circle-outline'
      );
    } finally {
      this.isLoading = false;
    }
  }

  // ─── localStorage helpers (device-side fast-path only) ──────────────────────

  private getSubmittedIds(): Set<string> {
    try {
      const raw = localStorage.getItem(RSVP_SUBMITTED_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private markAsSubmitted(ids: string[]): void {
    const existing = this.getSubmittedIds();
    ids.forEach(id => existing.add(id));
    localStorage.setItem(RSVP_SUBMITTED_KEY, JSON.stringify([...existing]));
  }

  // ─── slide 1: name lookup + already-answered check ──────────────────────────

  async onSubmit() {
    this.isLoading = true;
    const fullname = this.rsvpForm.value.fullname;

    // Single round trip — verify_guest_party() returns the whole party
    // (primary guest + relations) in one call, so there's no need to
    // look the guest up twice.
    let allGuests: Guest[];
    try {
      allGuests = await this.api.getGuestWithRelations(fullname);
    } catch (err: any) {
      const notFound = err?.message === 'Guest not found';
      this.global.presentToast(
        notFound
          ? `Oh no! We couldn't find your name — please contact Kamille or Vlarix`
          : `Something went wrong — please try again or contact Kamille / Vlarix`,
        'warning',
        'alert-circle-outline'
      );
      this.isLoading = false;
      return;
    }

    this.verifiedFullname = fullname;

    // Save name for personalised home page welcome
    localStorage.setItem('user_fullname', allGuests[0].full_name);

    this.arrGuests = allGuests;

    // ── DB check: has every guest in this group already answered? ────────────
    // attend === true  → confirmed attending
    // attend === false → declined
    // attend === null  → not yet answered  ← the only state that reaches slide 2
    const everyoneAnswered = allGuests.every(g => g.attend !== null && g.attend !== undefined);

    if (everyoneAnswered) {
      // Already answered — show read-only summary, skip slide 2 entirely
      this.isAlreadyAnswered = true;
      this.skipToThankYou();
    } else {
      // First time answering — proceed to slide 2
      this.isAlreadyAnswered = false;
      this.swiperRef.nativeElement.swiper.slideNext();
    }

    this.isLoading = false;
  }

  private skipToThankYou(): void {
    // From slide 0, slideTo(2) jumps over slide 1 straight to the thank-you screen
    this.swiperRef.nativeElement.swiper.slideTo(2);
  }

  // ─── slide 2: accept / decline ──────────────────────────────────────────────

  selectButton(guestData: Guest, button: string) {
    guestData.attend = button === 'yes';
    this.arrGuests = [...this.arrGuests];
  }

  async onConfirmRSVP() {
    for (const guest of this.arrGuests) {
      try {
        // Confirm button is disabled (isConfirmDisabled) until every guest
        // here has attend set to true/false, so the assertion below is safe.
        await this.api.updateAttend(guest.id, guest.attend!, this.verifiedFullname);
      } catch (err) {
        console.error('Error updating attend:', err);
        this.global.presentToast(
          `Something went wrong — please try again or contact Kamille / Vlarix`,
          'warning',
          'alert-circle-outline'
        );
        return; // stop on first failure — do not advance or mark submitted
      }
    }

    // All DB writes succeeded — record on device as fast-path for next open
    this.markAsSubmitted(this.arrGuests.map(g => g.id));
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  // ─── modal ──────────────────────────────────────────────────────────────────

  closeModal() {
    this.modalCtrl.dismiss();
  }

  // ─── computed getters ───────────────────────────────────────────────────────

  get isConfirmDisabled(): boolean {
    return this.arrGuests?.some(g => g.attend === null || g.attend === undefined);
  }

  get guestCount(): number {
    return this.arrGuests?.length || 0;
  }

  get hasDeclined(): boolean {
    return this.arrGuests?.some(g => g.attend === false);
  }

  get hasAccepted(): boolean {
    return this.arrGuests?.some(g => g.attend === true);
  }

  get messageText(): string {
    if (this.guestCount === 1) {
      return this.arrGuests[0].attend
        ? "Thank you for confirming! We're excited to celebrate with you! 💍"
        : "Thanks for letting us know! We're sad you can't make it, but for any changes in the future, please don't hesitate to message us! 💛";
    }
    if (this.hasAccepted && this.hasDeclined) {
      return "Thank you for confirming! We're excited to see those who can come, and we'll miss the ones who can't make it. 💛";
    } else if (this.hasDeclined && !this.hasAccepted) {
      return "Thanks for letting us know! It's sad that you'll not be able to join us, but for any changes please don't hesitate to message us!";
    } else {
      return "See you on our wedding day! 💍";
    }
  }
}