import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { BookingService } from '../../../services/booking.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss'],
})
export class AddDepartmentComponent {
  departmentForm: FormGroup;
  selectedPhoto: File | null = null;
  isSubmitting = false;

  private storage = inject(Storage);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      doctors: this.fb.array([]),
    });
  }

  get doctors(): FormArray {
    return this.departmentForm.get('doctors') as FormArray;
  }

  createDoctor(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      specialty: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  addDoctor(): void {
    this.doctors.push(this.createDoctor());
  }

  removeDoctor(index: number): void {
    this.doctors.removeAt(index);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB.');
        input.value = '';
        return;
      }
      this.selectedPhoto = file;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.departmentForm.invalid || !this.selectedPhoto) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      // Wait for authentication
      const user = await new Promise((resolve, reject) => {
        onAuthStateChanged(this.auth, user => {
          if (user) resolve(user);
          else reject(new Error('User not authenticated'));
        });
      });

      // Upload department photo
      const filePath = `departments/${Date.now()}_${this.selectedPhoto.name}`;
      const fileRef = ref(this.storage, filePath);
      await uploadBytes(fileRef, this.selectedPhoto);
      const photoUrl = await getDownloadURL(fileRef);

      // Add department with doctors
      const departmentData = {
        name: this.departmentForm.value.name,
        description: this.departmentForm.value.description,
        photoUrl,
        doctors: this.departmentForm.value.doctors.map((doctor: any) => ({
          name: doctor.name,
          specialty: doctor.specialty,
          description: doctor.description,
        })),
      };

      await firstValueFrom(this.bookingService.addDepartment(departmentData));

      // Reset form
      this.resetForm();
      alert('Department added successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to add department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  private resetForm(): void {
    this.departmentForm.reset();
    while (this.doctors.length) this.doctors.removeAt(0);
    this.selectedPhoto = null;

    const fileInput = document.getElementById('departmentPhoto') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
