import {Component, Input} from '@angular/core';
import {SideNavigation} from '../side-navigation';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-side-bar-navigation-item',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],

  template: `
    @for (item of sideNavData; track item.route) {
      <div class="nav-item">
        <a class="nav-link" [routerLink]="item.route" [routerLinkActive]="'active border'"
           data-placement="left">
                   <span class="nav-icon">
                <img [src]="'/assets/icons/polaris_icons_new/'+item.icon" class=""/>
                 </span>
          <!--   <i class=" nav-icon" [ngClass]="item.icon"></i>-->
          <span class="nav-link-title">{{ item.title }}</span>
        </a>
      </div>
    }
  `,
})
export class SideBarNavigationItemComponent {
  @Input({required: true}) sideNavData: SideNavigation[] = [];
}
