import { Component, OnInit } from '@angular/core';

export interface StoryMoment {
  src: string;
  year: string;
  caption: string;
  detail: string;        // longer text shown in the lightbox
}

@Component({
  selector: 'app-our-story',
  templateUrl: 'our-story.page.html',
  styleUrls: ['our-story.page.scss'],
  standalone: false,
})
export class OurStoryPage implements OnInit {

  loadedImages: boolean[] = [];
  selectedMoment: StoryMoment | null = null;   // drives the lightbox

  // ── Edit captions, years and detail text to match your real story ──────────
  moments: StoryMoment[] = [
    {
      src:     'assets/images/ourstory/1.png',
      year:    '2010',
      caption: 'The beginning 💛',
      detail:  'This girl flew to davao because her moms work got transferred',
    },
    {
      src:     'assets/images/ourstory/2.png',
      year:    '2010',
      caption: 'Growing closer',
      detail:  'She met this snobbish quy',
    },
    {
      src:     'assets/images/ourstory/3.png',
      year:    '2012',
      caption: 'He asked, she said yes',
      detail:  'Finally made it official after months of courting',
    },
    {
      src:     'assets/images/ourstory/4.png',
      year:    '2012',
      caption: 'High school couple',
      detail:  'Went through Life together...',
    },
    {
      src:     'assets/images/ourstory/5.png',
      year:    '2012',
      caption: 'Jejemon days',
      detail:  'Every phase of life especially our jejemon phase!',
    },
    {
      src:     'assets/images/ourstory/6.png',
      year:    '2012',
      caption: 'High school graduation',
      detail:  'Graduated High school together!',
    },
    {
      src:     'assets/images/ourstory/7.png',
      year:    '2013-2017',
      caption: 'College days',
      detail:  'Semi LDR during College (Marikina - Caloocan commutes)',
    },
    {
      src:     'assets/images/ourstory/8.png',
      year:    '2024',
      caption: 'Adventures together 🌏',
      detail:  'Fast forward to our favourite trip, \n Our first real adventure as a couple — proof that the best trips are the ones with the right person.',
    },
    {
      src:     'assets/images/ourstory/9.png',
      year:    '2024',
      caption: 'He asked, she said yes again 💍',
      detail:  'The question that changed everything. Of course she said yes.',
    },
  ];





    //     src:     'assets/images/ourstory/6.png',
    //   year:    '2022',
    //   caption: 'Engagement shoot',
    //   detail:  'Making it official in front of the camera — and in our hearts.',
    // },
    // {
    //   src:     'assets/images/ourstory/7.png',
    //   year:    '2023',
    //   caption: 'Planning the big day 📋',
    //   detail:  'Flowers, venues, guest lists — and somehow still smiling through it all.',
    // },
    // {
    //   src:     'assets/images/ourstory/8.png',
    //   year:    '2024',
    //   caption: 'Pre-wedding moments',
    //   detail:  'The quiet moments before the big day that we\'ll treasure forever.',
    // },
    // {
    //   src:     'assets/images/ourstory/9.png',
    //   year:    '2026',
    //   caption: 'Forever starts here ❤️',
    //   detail:  'December 18, 2026 — the day we say "I do" in front of everyone we love.',
    // },

  ngOnInit() {
    this.loadedImages = Array(this.moments.length).fill(false);
  }

  onImageLoad(index: number) {
    this.loadedImages[index] = true;
  }

  openLightbox(moment: StoryMoment) {
    this.selectedMoment = moment;
  }

  closeLightbox() {
    this.selectedMoment = null;
  }
}