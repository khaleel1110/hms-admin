import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, updateDoc,
} from '@angular/fire/firestore';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import {Timestamp} from 'firebase/firestore';
import {BookingService, Department} from './booking.service';


export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: Date | null;
  departmentId: string;
  doctorName: string;
  appointmentType: string;
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private firestore = inject(Firestore);
  private bookingService = inject(BookingService);

  // BehaviorSubject to store and emit the list of patients
  private patientSubject = new BehaviorSubject<Patient[]>([]);
  patients$ = this.patientSubject.asObservable();

  constructor() {
    this.fetchPatients();
  }

  // Fetch patients from Firestore
  fetchPatients(): void {
    const patientsCollection = collection(this.firestore, 'patients');

    collectionData(patientsCollection, { idField: 'id' }).subscribe({
      next: (patients: any[]) => {
        const formattedPatients = patients.map((patient) => ({
          ...patient,
          dob: patient.dob instanceof Timestamp ? patient.dob.toDate() : patient.dob,
          startTime: patient.startTime instanceof Timestamp ? patient.startTime.toDate() : patient.startTime,
          endTime: patient.endTime instanceof Timestamp ? patient.endTime.toDate() : patient.endTime,
          createdAt: patient.createdAt instanceof Timestamp ? patient.createdAt.toDate() : patient.createdAt,
        }));
        this.patientSubject.next(formattedPatients);
      },
      error: (error: any) => {
        console.error('Error fetching patients:', error);
      },
    });
  }

  // Get patients grouped by department
  getPatientsByDepartment(): Observable<{ [key: string]: number }> {
    return combineLatest([this.patients$, this.bookingService.departments$]).pipe(
      map(([patients, departments]) => {
        const departmentCounts: { [key: string]: number } = {};

        // Initialize counts for all departments
        departments.forEach((dept: Department) => {
          departmentCounts[dept.name] = 0;
        });

        // Count patients per department
        patients.forEach((patient) => {
          const department = departments.find((dept: Department) => dept.id === patient.departmentId);
          if (department) {
            departmentCounts[department.name] = (departmentCounts[department.name] || 0) + 1;
          }
        });

        return departmentCounts;
      })
    );
  }
}
