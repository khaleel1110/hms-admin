import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideUserFooterComponent } from './aside-user-footer.component';

describe('AsideUserFooterComponent', () => {
  let component: AsideUserFooterComponent;
  let fixture: ComponentFixture<AsideUserFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideUserFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideUserFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
