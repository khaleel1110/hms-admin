import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SplachScreenComponent} from './features/authentication/splach-screen/splach-screen.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplachScreenComponent],
  template: `
    @if (showSplashScreen) {
      <app-splach-screen></app-splach-screen>
    } @else {
      <router-outlet></router-outlet>
    }
  `
})
export class AppComponent implements OnInit {
  showSplashScreen = true;

  ngOnInit() {
    setTimeout(() => {
      this.showSplashScreen = false;
    }, 1500);
  }
}

