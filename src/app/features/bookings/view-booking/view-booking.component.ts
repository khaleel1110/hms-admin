import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { deleteDoc, doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AppointmentDetails } from '../../../services/users.service';

@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './view-booking.component.html',
  styleUrl: './view-booking.component.scss'
})
export class ViewBookingComponent {
  firestore = inject(Firestore);
  router = inject(Router);

  bookingId: string | null = null;
  @Input()
  set id(bookingId: string) {
    if (bookingId) {
      this.bookingId = bookingId;
      this.getBookingDetail(bookingId);
    } else {
      this.router.navigate(['/admin/bookings']);
    }
  }

  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    departmentName: new FormControl('', [Validators.required]),
    doctorName: new FormControl('', [Validators.required]),
    appointmentType: new FormControl('', [Validators.required]),
    appointmentDate: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required])
  });

  getBookingDetail(bookingId: string) {
    const bookingDocRef = doc(this.firestore, `patients/${bookingId}`);
    getDoc(bookingDocRef).then((docSnap) => {
      if (!docSnap.exists()) return;
      const bookingDetail = docSnap.data() as AppointmentDetails;

      const [firstName, ...lastNameParts] = bookingDetail.name.split(' ');
      const lastName = lastNameParts.join(' ');

      this.profileForm.setValue({
        firstName: firstName || '',
        lastName: lastName || '',
        email: bookingDetail.email || '',
        phone: bookingDetail.phone || '',
        departmentName: bookingDetail.departmentName || '',
        doctorName: bookingDetail.doctorName || '',
        appointmentType: bookingDetail.appointmentType || '',
        appointmentDate: bookingDetail.appointmentDate || '',
        startTime: this.formatDateTime(bookingDetail.startTime),
        endTime: this.formatDateTime(bookingDetail.endTime)
      });
    });
  }

  private formatDateTime(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  }

  handleSubmit() {
    if (this.profileForm.valid && this.bookingId) {
      const formValue = this.profileForm.value;
      const formData = {
        ...formValue,
        patientName: `${formValue.firstName} ${formValue.lastName}`.trim(),
        startTime: new Date(formValue.startTime!),
        endTime: new Date(formValue.endTime!)
      };
      delete formData.firstName;
      delete formData.lastName;

      const bookingDocRef = doc(this.firestore, `patients/${this.bookingId}`);
      updateDoc(bookingDocRef, formData)
        .then(() => alert('Booking updated successfully!'))
        .catch((error: any) => {
          console.error('Error updating booking:', error);
          alert('Error updating booking data. Please try again.');
        });
    } else {
      alert('Form is invalid or no booking selected for update. Please check your input.');
    }
  }

  delete() {
    if (this.bookingId) {
      const bookingDocRef = doc(this.firestore, `patients/${this.bookingId}`);
      deleteDoc(bookingDocRef)
        .then(() => {
          alert('Booking deleted successfully!');
          this.profileForm.reset();
          this.bookingId = '';
          this.router.navigate(['/admin/bookings']);
        })
        .catch((error: any) => {
          console.error('Error deleting booking:', error);
          alert('Error deleting booking data. Please try again.');
        });
    } else {
      alert('No booking selected for deletion.');
    }
  }
}
