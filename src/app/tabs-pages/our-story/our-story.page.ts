import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-our-story',
  templateUrl: 'our-story.page.html',
  styleUrls: ['our-story.page.scss'],
  standalone: false,
})
export class OurStoryPage implements OnInit {
  loadedImages: boolean[] = [];
  images: string[] = [
    'assets/images/ourstory/1.png',
    'assets/images/ourstory/2.png',
    'assets/images/ourstory/3.png',
    'assets/images/ourstory/4.png',
    'assets/images/ourstory/5.png',
    'assets/images/ourstory/6.png',
    'assets/images/ourstory/7.png',
    'assets/images/ourstory/8.png',
    'assets/images/ourstory/9.png',

  ];

  constructor() { }

  ngOnInit() {
    this.loadedImages = Array(this.images.length).fill(false);
  }

  onImageLoad(index: number) {
      console.log('here')
      this.loadedImages[index] = true;
      // Add a small guard in case you want to toggle a CSS class on the image element:
      // (not required if you use CSS : [class.loaded] binding in template)
      const img = document.querySelector(`img[data-index="${index}"]`);
      if (img) img.classList.add('loaded');

  }

}
