import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BookingService, Department, Doctor } from '../../../services/booking.service';
import { NgForOf, NgIf } from '@angular/common';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view-department',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  templateUrl: './view-department.component.html',
  styleUrl: './view-department.component.scss'
})
export class ViewDepartmentComponent {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);
  private storage = inject(Storage);

  departmentId: string | null = null;
  selectedPhoto: File | null = null;
  selectedDoctorPhotos: (File | null)[] = [];
  isSubmitting = false;
  isLoading = true;
  maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

  departmentForm: FormGroup;
  doctors: FormArray;

  constructor() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      photoUrl: [''],
      doctors: this.fb.array([])
    });

    this.doctors = this.departmentForm.get('doctors') as FormArray;
  }

  @Input()
  set id(departmentId: string) {
    if (departmentId) {
      this.departmentId = departmentId;
      this.getDepartmentDetail(departmentId);
    } else {
      this.router.navigate(['/admin/departments']);
    }
  }

  async getDepartmentDetail(departmentId: string) {
    this.isLoading = true;
    try {
      const departmentDocRef = doc(this.firestore, `departments/${departmentId}`);
      const docSnap = await getDoc(departmentDocRef);

      if (!docSnap.exists()) {
        this.router.navigate(['/admin/departments']);
        return;
      }

      const departmentData = docSnap.data() as Department;
      this.departmentForm.patchValue({
        name: departmentData.name || '',
        description: departmentData.description || '',
        photoUrl: departmentData.photoUrl || ''
      });

      this.bookingService.getDoctorsByDepartment(departmentId).subscribe({
        next: (doctors) => {
          this.setDoctors(doctors);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
          alert('Failed to load doctors. Please try again.');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading department:', error);
      alert('Failed to load department details. Please try again.');
      this.isLoading = false;
    }
  }

  setDoctors(doctors: Doctor[]) {
    this.selectedDoctorPhotos = doctors.map(() => null);
    this.doctors.clear();

    doctors.forEach(doctor => {
      this.doctors.push(this.fb.group({
        id: [doctor.id],
        name: [doctor.name, [Validators.required, Validators.minLength(3)]],
        specialty: [doctor.specialty, [Validators.required, Validators.minLength(3)]],
        description: [doctor.description, [Validators.required, Validators.minLength(10)]],
        photoUrl: ['']
      }));
    });
  }

  createDoctor(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      specialty: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      photoUrl: ['']
    });
  }

  addDoctor(): void {
    this.doctors.push(this.createDoctor());
    this.selectedDoctorPhotos.push(null);
  }

  removeDoctor(index: number): void {
    if (confirm('Are you sure you want to remove this doctor?')) {
      this.doctors.removeAt(index);
      this.selectedDoctorPhotos.splice(index, 1);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.size > this.maxFileSize) {
        alert('Department photo must be less than 5MB.');
        input.value = '';
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        alert('Please select a PNG or JPEG image.');
        input.value = '';
        return;
      }
      this.selectedPhoto = file;
    }
  }

  onDoctorPhotoSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.size > this.maxFileSize) {
        alert('Doctor photo must be less than 5MB.');
        input.value = '';
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        alert('Please select a PNG or JPEG image.');
        input.value = '';
        return;
      }
      this.selectedDoctorPhotos[index] = file;
    }
  }

  isFormValid(): boolean {
    if (this.departmentForm.invalid) {
      return false;
    }
    const doctorsArray = this.departmentForm.get('doctors') as FormArray;
    return doctorsArray.controls.every(doctor => doctor.valid);
  }

  async handleSubmit() {
    if (!this.isFormValid() || !this.departmentId) {
      this.departmentForm.markAllAsTouched();
      alert('Please fill out all required fields correctly.');
      return;
    }

    this.isSubmitting = true;

    try {
      let departmentPhotoUrl = this.departmentForm.value.photoUrl || '';

      if (this.selectedPhoto) {
        if (departmentPhotoUrl) {
          try {
            const oldPhotoRef = ref(this.storage, departmentPhotoUrl);
            await deleteObject(oldPhotoRef);
          } catch (error) {
            console.warn('Could not delete old department photo', error);
          }
        }

        const filePath = `departments/${Date.now()}_${this.selectedPhoto.name}`;
        const fileRef = ref(this.storage, filePath);
        await uploadBytes(fileRef, this.selectedPhoto);
        departmentPhotoUrl = await getDownloadURL(fileRef);
      }

      const departmentDocRef = doc(this.firestore, `departments/${this.departmentId}`);
      await updateDoc(departmentDocRef, {
        name: this.departmentForm.value.name,
        description: this.departmentForm.value.description,
        photoUrl: departmentPhotoUrl
      });

      const doctorUpdates = this.doctors.controls.map(async (doctorGroup, index) => {
        const doctorForm = doctorGroup as FormGroup;
        const doctorData = doctorForm.value;
        let doctorPhotoUrl = doctorData.photoUrl || '';

        if (this.selectedDoctorPhotos[index]) {
          if (doctorPhotoUrl) {
            try {
              const oldPhotoRef = ref(this.storage, doctorPhotoUrl);
              await deleteObject(oldPhotoRef);
            } catch (error) {
              console.warn('Could not delete old doctor photo', error);
            }
          }

          const file = this.selectedDoctorPhotos[index]!;
          const filePath = `doctors/${Date.now()}_${file.name}`;
          const fileRef = ref(this.storage, filePath);
          await uploadBytes(fileRef, file);
          doctorPhotoUrl = await getDownloadURL(fileRef);
        }

        if (doctorData.id) {
          const doctorDocRef = doc(this.firestore, `doctors/${doctorData.id}`);
          await updateDoc(doctorDocRef, {
            name: doctorData.name,
            specialty: doctorData.specialty,
            description: doctorData.description,
            photoUrl: doctorPhotoUrl
          });
        } else {
          await firstValueFrom(this.bookingService.addDoctor({
            name: doctorData.name,
            specialty: doctorData.specialty,
            description: doctorData.description,
            departmentId: this.departmentId!,
            photoUrl: doctorPhotoUrl
          }));
        }
      });

      await Promise.all(doctorUpdates);

      alert('Department updated successfully!');
      this.router.navigate(['/admin/departments']);
    } catch (error) {
      console.error('Error updating department:', error);
      alert(`Failed to update department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.resetForm();
      this.router.navigate(['/admin/departments']);
    }
  }

  private resetForm(): void {
    this.departmentForm.reset();
    this.doctors.clear();
    this.selectedPhoto = null;
    this.selectedDoctorPhotos = [];

    const fileInput = document.getElementById('departmentPhoto') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const doctorFileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    doctorFileInputs.forEach(input => input.value = '');
  }
}
