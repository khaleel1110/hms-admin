import { Component, Input, OnInit } from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';

import { Observable } from 'rxjs';
import {BookingService, Patient} from '../../../services/booking.service';

@Component({
  selector: 'app-dashboard-list-item',
  standalone: true,
  imports: [NgForOf, NgIf, DatePipe, AsyncPipe],
  template: `
    <div class="    ">
    <!--  <div class="d-flex justify-content-between flex-row align-items-center ps-4 mb-5">
        <div>
          <div class="h3 mt-5 text-dark">{{ listTitle }}</div>
          <div class="mt-1 text-dark">{{ listDescription }}</div>
        </div>
      </div>
-->
      <div class="d-flex flex-column py-2 justify-content-start align-items-start w-100 px-1"
           style="overflow-y: auto; max-height: 36.2rem">
        <ng-container *ngIf="isLoading; else patientList">
          <p>Loading patients...</p>
        </ng-container>

        <ng-template #patientList>
          <div class="d-flex flex-column align-self-stretch row-gap-3">
            <ng-container *ngIf="todayPatients$ | async as patients; else noPatients">
              <ng-container *ngIf="patients.length > 0; else noPatients">


                    <div *ngFor="let patient of patients; trackBy: trackById" class="list-tile p-3 border rounded">
                      <div class="d-flex row row-cols-2 align-items-center">
                      <div class="col-lg-11">
                      <div class="fw-bold">{{ patient.name }}</div>
                      <div class="text-muted">
                        Doctor: {{ patient.doctorName }} | Type: {{ patient.appointmentType }}
                      </div>
                      <div class="text-muted">
                        Time:
                        {{ patient.startTime ? (patient.startTime | date: 'shortTime') : 'N/A' }} -
                        {{ patient.endTime ? (patient.endTime | date: 'shortTime') : 'N/A' }}
                      </div>
                        </div>
                      <!--   <div class="text-muted">
                           Department ID: {{ patient.departmentId }}
                         </div>
                         <div class="text-muted">
                           Last Updated: {{ patient.createdAt | date: 'mediumDate' }}
                         </div>-->
                      <div class="col-lg-1">
                        <div style="width: 20.33px; height: 18.33px; border-radius: 16.37px; background-color: green" ></div>
                      </div>
                      </div>
                    </div>





              </ng-container>
            </ng-container>

            <ng-template #noPatients>
              <p>No patients scheduled for today.</p>
            </ng-template>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: `
    .list-tile {
      background-color: #f8f9fa;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.25rem;
      transition: background-color 0.2s;
    }
    .list-tile:hover {
      background-color: #e9ecef;
    }
    .fw-bold {
      color: #333;
    }
    .text-muted {
      font-size: 0.9rem;
      color: #6c757d;
    }
  `
})
export class DashboardListItemComponent implements OnInit {
  @Input() listTitle: string = "Today's Patient Appointments";
  @Input() listDescription: string = "Patients scheduled for today's appointments.";
  @Input() doctorName: string | undefined;
  @Input() isLoading: boolean = true;

  todayPatients$: Observable<Patient[]>;
  @Input() todayPatients!: any;

  constructor(private bookingService: BookingService) {
    this.todayPatients$ = this.bookingService.getPatientsForToday(this.doctorName);
  }

  ngOnInit(): void {
    this.todayPatients$.subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }

  trackById(index: number, patient: Patient): string {
    return patient.id;
  }
}
