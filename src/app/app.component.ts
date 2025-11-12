import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { Keyboard } from '@capacitor/keyboard';

document.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const active = document.activeElement as HTMLElement;
    active?.blur();
    await Keyboard.hide();
  }
});

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() { }
}
