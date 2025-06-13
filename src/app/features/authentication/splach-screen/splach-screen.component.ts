import { Component } from '@angular/core';

@Component({
  selector: 'app-splach-screen',
  standalone: true,
  imports: [],
  template: `
    <div class="w-100 d-flex justify-content-center vh-100">
      <div class="d-flex flex-column justify-content-center gap-2">
        <div class="mb-0">
          <img style="height: 8rem; object-fit: cover "src="/assets/5-asilde/logo/myNewLOgo-removebg-preview.png">

        </div>
        <div class=' mt-0 pt-lg-0'>
          <div class="progress"  style="height: 6px;">
            <div class="progress-bar" role="progressbar" [style.width]="initial+'%'" style=" transition: width 1s" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>


        <div class="justify-content-center text-center">
          <p class="text-lg mb-0">MAAUN Clinic Admin Panel</p>
          <p class="text-sm form-select-sm mt-0">Powered by Maryam Abacha American University of Nigeria</p>
        </div>

      </div>

    </div>

  `,
})
export class SplachScreenComponent {
  initial = 0;
  ngOnInit(): void {



    setTimeout(()=>{
      this.initial = 100;
    }, 600)

  }
}
