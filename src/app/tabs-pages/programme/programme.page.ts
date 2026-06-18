import { Component, OnDestroy, OnInit } from '@angular/core';

export interface ProgrammeItem {
  time: string;
  title: string;
  description: string;
  icon: string;
  hour: number;
  minute: number;
  isNow?: boolean;
  isPast?: boolean;
}

export interface ProgrammeSection {
  label: string;
  icon: string;
  items: ProgrammeItem[];
}

@Component({
  selector: 'app-programme',
  templateUrl: 'programme.page.html',
  styleUrls: ['programme.page.scss'],
  standalone: false,
})
export class ProgrammePage implements OnInit, OnDestroy {

  private readonly WEDDING = new Date('2026-12-18T15:00:00');
  private tickInterval: any;

  isWeddingDay     = false;
  weddingDayPassed = false;
  now              = new Date();

  // ── Edit items to match your actual programme ─────────────────────────────
  sections: ProgrammeSection[] = [
    {
      label: 'Ceremony',
      icon:  'business-outline',
      items: [
        {
          time: '3:00 PM', title: 'Processional',
          description: 'Guests are seated. The wedding party walks down the aisle.',
          icon: 'people-outline', hour: 15, minute: 0,
        },
        {
          time: '3:10 PM', title: 'Bride\'s entrance',
          description: 'The moment we\'ve all been waiting for.',
          icon: 'heart-outline', hour: 15, minute: 10,
        },
        {
          time: '3:15 PM', title: 'Opening prayer & welcome',
          description: 'Officiant welcomes guests and opens the ceremony.',
          icon: 'mic-outline', hour: 15, minute: 15,
        },
        {
          time: '3:25 PM', title: 'First reading',
          description: 'Scripture reading by a member of the wedding party.',
          icon: 'book-outline', hour: 15, minute: 25,
        },
        {
          time: '3:35 PM', title: 'Second reading',
          description: 'A reading on love, chosen by the couple.',
          icon: 'book-outline', hour: 15, minute: 35,
        },
        {
          time: '3:45 PM', title: 'Exchange of vows',
          description: 'Kamille and Vlarix exchange their heartfelt promises.',
          icon: 'ribbon-outline', hour: 15, minute: 45,
        },
        {
          time: '3:55 PM', title: 'Exchange of rings',
          description: 'A symbol of their eternal commitment.',
          icon: 'ellipse-outline', hour: 15, minute: 55,
        },
        {
          time: '4:00 PM', title: 'Lighting of the unity candle',
          description: 'Two flames become one.',
          icon: 'flame-outline', hour: 16, minute: 0,
        },
        {
          time: '4:05 PM', title: 'Declaration of marriage',
          description: 'They are officially married! 💍',
          icon: 'checkmark-circle-outline', hour: 16, minute: 5,
        },
        {
          time: '4:10 PM', title: 'Recessional',
          description: 'The newlyweds walk back down the aisle together.',
          icon: 'walk-outline', hour: 16, minute: 10,
        },
      ],
    },
    {
      label: 'Reception',
      icon:  'wine-outline',
      items: [
        {
          time: '4:30 PM', title: 'Cocktail hour',
          description: 'Drinks and appetisers while the couple takes photos.',
          icon: 'wine-outline', hour: 16, minute: 30,
        },
        {
          time: '6:00 PM', title: 'Grand entrance',
          description: 'Welcome Kamille & Vlarix as husband and wife for the first time!',
          icon: 'star-outline', hour: 18, minute: 0,
        },
        {
          time: '6:10 PM', title: 'First dance',
          description: 'The couple shares their first dance as newlyweds.',
          icon: 'musical-notes-outline', hour: 18, minute: 10,
        },
        {
          time: '6:20 PM', title: 'Welcome toast',
          description: 'A toast to the happy couple from the host.',
          icon: 'mic-outline', hour: 18, minute: 20,
        },
        {
          time: '6:30 PM', title: 'Dinner is served',
          description: 'Enjoy a wonderful dinner with family and friends.',
          icon: 'restaurant-outline', hour: 18, minute: 30,
        },
        {
          time: '7:15 PM', title: 'Speeches',
          description: 'Heartfelt words from the parents, best man, and maid of honour.',
          icon: 'chatbubble-outline', hour: 19, minute: 15,
        },
        {
          time: '7:45 PM', title: 'Cake cutting',
          description: 'A sweet moment to celebrate the newlyweds.',
          icon: 'cut-outline', hour: 19, minute: 45,
        },
        {
          time: '8:00 PM', title: 'Open dancing 🎉',
          description: 'The floor is yours — let\'s celebrate!',
          icon: 'disc-outline', hour: 20, minute: 0,
        },
        {
          time: '10:00 PM', title: 'Last dance & farewell',
          description: 'Thank you for celebrating with us. Safe travels!',
          icon: 'moon-outline', hour: 22, minute: 0,
        },
      ],
    },
  ];

  // Flattened list of all items for live tracking
  private get allItems(): ProgrammeItem[] {
    return this.sections.flatMap(s => s.items);
  }

  ngOnInit() {
    this.tick();
    this.tickInterval = setInterval(() => this.tick(), 30_000); // re-check every 30s
  }

  ngOnDestroy() {
    clearInterval(this.tickInterval);
  }

  private tick(): void {
    this.now = new Date();
    const todayStr   = this.now.toDateString();
    const weddingStr = this.WEDDING.toDateString();

    this.isWeddingDay     = todayStr === weddingStr;
    this.weddingDayPassed = this.now > this.WEDDING && !this.isWeddingDay;

    if (this.isWeddingDay) {
      this.updateLiveState();
    }
  }

  private updateLiveState(): void {
    const currentMins = this.now.getHours() * 60 + this.now.getMinutes();
    const flat = this.allItems;

    flat.forEach((item, i) => {
      const itemMins = item.hour * 60 + item.minute;
      const nextMins = flat[i + 1]
        ? flat[i + 1].hour * 60 + flat[i + 1].minute
        : 24 * 60;

      item.isNow  = currentMins >= itemMins && currentMins < nextMins;
      item.isPast = currentMins >= nextMins;
    });
  }

  get currentItemTitle(): string {
    const current = this.allItems.find(i => i.isNow);
    return current ? current.title : '';
  }

  get weddingDateLabel(): string {
    return 'Friday, December 18, 2026';
  }
}
