import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  user_fullname: string | null = null;
  bannerHeight = 250; // initial height

  constructor() { }


  ngOnInit() {

    this.user_fullname = localStorage.getItem('user_fullname') ? localStorage.getItem('user_fullname') : '';
  }


  onScroll(ev: any) {
    const scrollTop = ev.detail.scrollTop;
    const maxHeight = 250;
    const minHeight = 56;

    this.bannerHeight = Math.max(maxHeight - scrollTop, minHeight);
  }

}
