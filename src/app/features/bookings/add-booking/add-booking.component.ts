import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TimePickerDialogComponent } from '../../date-picker/time-picker-dialog/time-picker-dialog.component';
import { BookingService, Patient, Doctor } from '../../../services/booking.service';
import { DepartmentSelectorComponent } from '../department-selector/department-selector.component';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgbDropdown, NgbDropdownAnchor, NgbDropdownItem, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../pagination/pagination.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    NgIf,
    ReactiveFormsModule,
    DepartmentSelectorComponent,
    MatSelect,
    MatOption,
    DatePipe,
    NgForOf,
    NgbDropdown,
    NgbDropdownAnchor,
    NgbDropdownItem,
    NgbDropdownMenu,
    PaginationComponent,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.scss']
})
export class AddBookingComponent {
  @Output() bookingSubmitted = new EventEmitter<Patient>();
  @Input() initialDate: Date | null = null;
  @ViewChild('bookingForm') bookingForm!: NgForm;

  selectedDate: Date | null = null;
  selectedDateTimeRange: { start: Date; end: Date } | null = null;
  selectedDuration: number = 30;
  bookingError: string | null = null;
  isLoading = false;

  patient: Patient = {
    id: '',
    name: '',
    email: '',
    phone: '',
    dob: null,
    departmentId: '',
    doctorName: '',
    appointmentType: '',
    startTime: null,
    endTime: null,
    createdAt: new Date()
  };

  constructor(
    private dialog: MatDialog,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    if (this.initialDate) {
      this.selectedDate = this.initialDate;
      this.setInitialDateTime(this.initialDate);
    }
  }

  setInitialDateTime(date: Date) {
    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + this.selectedDuration);
    this.selectedDateTimeRange = { start: date, end: endDate };
    this.patient.startTime = date;
    this.patient.endTime = endDate;
  }

  onDatePickerChange(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      this.openTimePicker(date);
    } else {
      this.selectedDate = null;
      this.selectedDateTimeRange = null;
      this.patient.startTime = null;
      this.patient.endTime = null;
      this.bookingError = null;
    }
  }

  openTimePicker(date: Date | null) {
    if (!date) return;
    const dialogRef = this.dialog.open(TimePickerDialogComponent, {
      width: '400px',
      data: { date: date, maxDuration: this.selectedDuration }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedDuration = result.duration;
        this.selectedDateTimeRange = {
          start: this.combineDateAndTime(result.date, result.timeRange.start),
          end: this.combineDateAndTime(result.date, result.timeRange.end)
        };
        this.patient.startTime = this.selectedDateTimeRange.start;
        this.patient.endTime = this.selectedDateTimeRange.end;
        this.checkAvailability();
      } else {
        this.selectedDateTimeRange = null;
        this.patient.startTime = null;
        this.patient.endTime = null;
        this.bookingError = null;
      }
    });
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  getDateTimeRangeDisplay(): string {
    if (!this.selectedDateTimeRange) return '';
    return `${this.selectedDateTimeRange.start.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })} - ${this.selectedDateTimeRange.end.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
  }

  onDepartmentChange() {
    this.patient.doctorName = '';
    this.bookingError = null;
    if (this.selectedDateTimeRange && this.patient.departmentId) {
      this.checkAvailability();
    }
  }

  onDoctorChange() {
    this.bookingError = null;
    if (this.selectedDateTimeRange && this.patient.doctorName && this.patient.departmentId) {
      this.checkAvailability();
    }
  }

  private async checkAvailability() {
    if (this.selectedDateTimeRange && this.patient.doctorName && this.patient.departmentId) {
      this.isLoading = true;
      this.bookingError = null;

      const availabilityData = {
        doctorName: this.patient.doctorName,
        departmentId: this.patient.departmentId,
        startTime: this.selectedDateTimeRange.start,
        endTime: this.selectedDateTimeRange.end
      };

      try {
        const available = await firstValueFrom(this.bookingService.checkAvailability(availabilityData));
        this.isLoading = false;
        if (!available) {
          this.bookingError = 'This time slot is already booked. Please choose another time.';
        }
      } catch (error) {
        this.isLoading = false;
        this.bookingError = (error instanceof Error) ? error.message : 'Failed to check availability. Please try again.';
      }
    }
  }

  async onSubmit() {
    if (!this.bookingForm.valid || !this.selectedDateTimeRange || !this.patient.doctorName || !this.patient.departmentId || this.bookingError) {
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.controls[key].markAsTouched();
      });
      alert('Please complete all required fields and ensure a valid time slot is selected.');
      return;
    }

    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.bookingService.addPatient(this.patient));
      this.isLoading = false;
      this.bookingSubmitted.emit(this.patient);
      alert('Appointment booked successfully! A confirmation email has been sent.');
      this.resetForm();
    } catch (error) {
      this.isLoading = false;
      alert('Failed to book appointment: ' + ((error instanceof Error) ? error.message : 'Please try again.'));
    }
  }

  resetForm() {
    this.patient = {
      id: '',
      name: '',
      email: '',
      phone: '',
      dob: null,
      departmentId: '',
      doctorName: '',
      appointmentType: '',
      startTime: null,
      endTime: null,
      createdAt: new Date()
    };
    this.selectedDate = null;
    this.selectedDateTimeRange = null;
    this.bookingError = null;
    this.bookingForm.resetForm();
  }
}
