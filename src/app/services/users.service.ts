import { inject, Injectable, OnDestroy } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

export interface AppointmentDetails {
  name: any;
  id: string;
  patientName: string;
  email: string;
  phone: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  appointmentType: string;
  appointmentDate: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnDestroy {
  private firestore = inject(Firestore);
  private unsub: Subscription | null = null;

  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.isLoadingSubject.asObservable();

  private usersSubject = new BehaviorSubject<AppointmentDetails[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor() {
    const bookingsCollection = collection(this.firestore, 'patients');

    this.unsub = collectionData(bookingsCollection, { idField: 'id' })
      .pipe(
        map((data: any[]) =>
          data.map((item) => ({
            ...item,
            patientName: item.patientName || 'N/A',
            startTime: item.startTime instanceof Timestamp ? item.startTime.toDate() : new Date(item.startTime),
            endTime: item.endTime instanceof Timestamp ? item.endTime.toDate() : new Date(item.endTime),
            createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : new Date(item.createdAt),
          }))
        )
      )
      .subscribe({
        next: (users: AppointmentDetails[]) => {
          this.usersSubject.next(users);
          this.isLoadingSubject.next(false);
        },
        error: (error: any) => {
          console.error('Error fetching bookings:', error);
          this.isLoadingSubject.next(false);
        },
      });
  }

  setLoading(loading: boolean) {
    this.isLoadingSubject.next(loading);
  }

  getStaffCount(): Observable<number> {
    return this.users$.pipe(map((users) => users.length));
  }

  ngOnDestroy(): void {
    if (this.unsub) {
      this.unsub.unsubscribe();
    }
  }
}
