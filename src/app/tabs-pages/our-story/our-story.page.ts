import { Component } from '@angular/core';

@Component({
  selector: 'app-our-story',
  templateUrl: 'our-story.page.html',
  styleUrls: ['our-story.page.scss'],
  standalone: false,
})
export class OurStoryPage {

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

}
