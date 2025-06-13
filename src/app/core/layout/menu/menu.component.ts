import {AsideUserFooterComponent} from '../aside-user-footer/aside-user-footer.component';
import {SideBarNavigationItemComponent} from '../side-bar-navigation-item/side-bar-navigation-item.component';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgbDatepickerModule, NgbOffcanvas, OffcanvasDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {Component, inject, Input, TemplateRef} from '@angular/core';
import {SideNavigation, SideNavigationFooter} from '../side-navigation';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgbDatepickerModule, RouterLink, RouterLinkActive, SideBarNavigationItemComponent, AsideUserFooterComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Input({required: true}) areaLogo: string = '';
  @Input({required: true}) sideNavigation: SideNavigation[] = [];

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = '';

  open(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {ariaLabelledBy: 'offcanvas-basic-title'}).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );


  }

  close() {
    this.offcanvasService.dismiss('ghgjjh')
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case OffcanvasDismissReasons.ESC:
        return 'by pressing ESC';
      case OffcanvasDismissReasons.BACKDROP_CLICK:
        return 'by clicking on the backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  protected readonly env = environment;
  protected readonly sideNavigationFooter = SideNavigationFooter;
  showAside = true;
}
