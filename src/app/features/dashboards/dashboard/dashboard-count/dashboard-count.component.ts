import { Component, inject, OnInit } from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {Observable, of} from 'rxjs';
import {BookingService,} from '../../../../services/booking.service';
import {UsersService} from '../../../../services/users.service';


@Component({
  selector: 'app-dashboard-count',
  standalone: true,
  imports: [AsyncPipe, NgIf, DatePipe, NgForOf, SlicePipe],
  templateUrl: './dashboard-count.component.html',
  styleUrl: './dashboard-count.component.scss'
})
export class DashboardCountComponent implements OnInit {
  totalBookings$: Observable<number> = of(0);
  todayBookingCount$: Observable<number> = of(0);
  departmentCount$: Observable<number> = of(0);
  doctorCount$: Observable<number> = of(0);

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.totalBookings$ = this.bookingService.getTotalBookings();
    this.todayBookingCount$ = this.bookingService.getTodayBookingCount();
    this.departmentCount$ = this.bookingService.getDepartmentCount();
    this.doctorCount$ = this.bookingService.getDoctorCount();
  }
}
