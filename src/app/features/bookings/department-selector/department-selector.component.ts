import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgForOf, NgIf } from '@angular/common';
import { BookingService, Department, Doctor } from '../../../services/booking.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-department-selector',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    NgForOf,
    NgIf,
    FormsModule
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Department</mat-label>
        <mat-select
          [(ngModel)]="selectedDepartmentId"
          (ngModelChange)="onDepartmentChange()"
          required
        >
          <mat-option *ngFor="let department of departments()" [value]="department.id">
            {{ department.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Doctor</mat-label>
        <mat-select
          [(ngModel)]="selectedDoctorName"
          (ngModelChange)="onDoctorChange($event)"
          required
          [disabled]="!selectedDepartmentId"
        >
          <mat-option *ngFor="let doctor of getDoctorsForDepartment(selectedDepartmentId)" [value]="doctor.name">
            {{ doctor.name }} ({{ doctor.specialty }})
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `
})
export class DepartmentSelectorComponent {
  @Input() selectedDepartmentId: string = '';
  @Output() selectedDepartmentIdChange = new EventEmitter<string>();

  @Input() selectedDoctorName: string = '';
  @Output() selectedDoctorNameChange = new EventEmitter<string>();

  @Output() selectionChange = new EventEmitter<void>();
  @Output() doctorChange = new EventEmitter<string>();

  private bookingService = inject(BookingService);
  departments = toSignal(this.bookingService.departments$, { initialValue: [] });

  onDepartmentChange() {
    this.selectedDoctorName = '';
    this.selectedDepartmentIdChange.emit(this.selectedDepartmentId);
    this.selectedDoctorNameChange.emit(this.selectedDoctorName);
    this.selectionChange.emit();
  }

  onDoctorChange(name: string) {
    this.selectedDoctorName = name;
    this.selectedDoctorNameChange.emit(name);
    this.doctorChange.emit(name);
  }

  getDoctorsForDepartment(departmentId: string): Doctor[] {
    const department = this.departments().find(dept => dept.id === departmentId);
    return department ? department.doctors : [];
  }
}
