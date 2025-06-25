import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BookingService, Patient } from '../../../services/booking.service';
import { catchError, tap } from 'rxjs/operators';
import { DashboardListItemComponent } from '../dashboard-list-item/dashboard-list-item.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardListItemComponent,
    AsyncPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  todayPatients$: Observable<Patient[]> = of([]);
  private isLoadingSubject$ = new BehaviorSubject<boolean>(true);
  isLoading$ = this.isLoadingSubject$.asObservable();

  todayPatients: Patient[] | null = null;
  isLoading: boolean = true;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.todayPatients$ = this.bookingService.getPatientsForToday().pipe(
      tap(patients => {
        this.todayPatients = patients;
        this.isLoadingSubject$.next(false);
        this.isLoading = false;
      }),
      catchError(err => {
        console.error('Error loading patients:', err);
        this.isLoadingSubject$.next(false);
        this.isLoading = false;
        return of([]);
      })
    );
  }
}
