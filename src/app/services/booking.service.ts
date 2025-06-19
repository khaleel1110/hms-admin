import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, addDoc, query, where, getDocs,
  collectionData, deleteDoc, doc
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Auth, signInAnonymously, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, take, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  photoUrl: string;
  doctors: Doctor[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private refreshDepartments$ = new BehaviorSubject<void>(undefined);

  departments$: Observable<Department[]> = combineLatest([this.refreshDepartments$]).pipe(
    switchMap(() => new Observable<Department[]>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          collectionData(collection(this.firestore, 'departments'), { idField: 'id' })
            .pipe(
              map(departments => departments as Department[]),
              catchError(err => {
                console.error('Error fetching departments:', err);
                return of([]);
              })
            )
            .subscribe(departments => observer.next(departments));
        } else {
          observer.next([]);
        }
      });
    }))
  );

  constructor() {
    // Sign in anonymously for emulator testing
    signInAnonymously(this.auth).catch(error => {
      console.error('Anonymous auth error:', error);
    });
    this.refreshDepartments$.next();
  }

  refreshData(): Promise<void> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.refreshDepartments$.next();
          this.departments$.pipe(take(1)).subscribe(() => resolve());
        } else {
          reject(new Error('User not authenticated'));
        }
      });
    });
  }

  addDoctor(doctor: {
    photoUrl: string;
    specialty: any;
    departmentId: string;
    name: any;
    description: any
  }): Observable<Doctor> {
    return new Observable<Doctor>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          const doctorData: Doctor = {
            ...doctor,
            id: this.generateId('DOC')
          };
          from(addDoc(collection(this.firestore, 'doctors'), doctorData)).pipe(
            map(() => doctorData),
            catchError(err => {
              observer.error(err);
              return of(null as any);
            })
          ).subscribe(doctor => observer.next(doctor));
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }
  addPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Observable<Patient> {
    return new Observable<Patient>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          const patientData: Patient = {
            ...patient,
            id: this.generateId('PT'),
            createdAt: new Date()
          };
          from(addDoc(collection(this.firestore, 'patients'), patientData)).pipe(
            tap(() => {
              this.http.post(`${environment.apiUrl}/send-booking-email`, patientData).subscribe();
            }),
            map(() => patientData),
            catchError(err => {
              observer.error(err);
              return of(null as any);
            })
          ).subscribe(patient => observer.next(patient));
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }

  addDepartment(department: { name: string; description: string; photoUrl: string; doctors: Doctor[] }): Observable<string> {
    return new Observable<string>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          const departmentData: Department = {
            ...department,
            id: this.generateId('DEPT'),
            createdAt: new Date(),
          };
          from(addDoc(collection(this.firestore, 'departments'), departmentData)).pipe(
            map(ref => ref.id),
            tap(() => this.refreshDepartments$.next()),
            catchError(err => {
              observer.error(err);
              return of(null as any);
            })
          ).subscribe(id => observer.next(id));
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }

  deleteDepartment(departmentId: string): Observable<void> {
    return new Observable<void>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          const docRef = doc(this.firestore, `departments/${departmentId}`);
          from(deleteDoc(docRef)).pipe(
            tap(() => this.refreshDepartments$.next()),
            catchError(err => {
              observer.error(err);
              return of(null as any);
            })
          ).subscribe(() => observer.next());
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }

  getDoctorsByDepartment(departmentId: string): Observable<Doctor[]> {
    return this.departments$.pipe(
      map(departments => {
        const department = departments.find(dept => dept.id === departmentId);
        return department ? department.doctors : [];
      })
    );
  }

  checkAvailability(data: { doctorName: string; departmentId: string; startTime: Date; endTime: Date }): Observable<boolean> {
    return new Observable<boolean>(observer => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          const patientsCollection = collection(this.firestore, 'patients');
          const q = query(
            patientsCollection,
            where('doctorName', '==', data.doctorName),
            where('departmentId', '==', data.departmentId),
            where('startTime', '<', data.endTime),
            where('endTime', '>', data.startTime)
          );
          from(getDocs(q)).pipe(
            map(snapshot => snapshot.empty),
            catchError(err => {
              observer.error(err);
              return of(true);
            })
          ).subscribe(isAvailable => observer.next(isAvailable));
        } else {
          observer.error(new Error('User not authenticated'));
        }
      });
    });
  }


  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
