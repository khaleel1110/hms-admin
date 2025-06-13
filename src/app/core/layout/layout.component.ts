import {Component} from '@angular/core';
import { RouterLink,  RouterOutlet} from "@angular/router";
import { NgClass} from "@angular/common";

import {NgProgressComponent} from 'ngx-progressbar';
import {SideBarNavigationItemComponent} from './side-bar-navigation-item/side-bar-navigation-item.component';
import {SideNavigationData, SideNavigationFooter} from './side-navigation';
import {MenuComponent} from './menu/menu.component';
import {AsideUserFooterComponent} from './aside-user-footer/aside-user-footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    RouterOutlet,
    NgProgressComponent,
    SideBarNavigationItemComponent,
    MenuComponent,
    AsideUserFooterComponent
  ],
  templateUrl: './layout.component.html',

  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  sideNavigation = SideNavigationData;
  sideNavigationFooter = SideNavigationFooter;
  private environment = true;
  env = this.environment;
  dp: any;
  closeResult: any
  showAside: boolean = true;
  protected readonly open = open;
  areaLogo = '/assets/tibet-realty/my-new-logo.png';
  toggleAside() {
    this.showAside = !this.showAside;
  }
}
