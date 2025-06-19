import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookingService, Department } from '../../../services/booking.service';
import { PaginationComponent } from '../../pagination/pagination.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf, RouterLink, PaginationComponent, DatePipe],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
})
export class DepartmentListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Signals
  allDepartments = toSignal(this.bookingService.departments$, { initialValue: [] });

  // State management
  loading = true;
  itemsPerPage = 6;
  currentPage = signal(1);
  searchTerm = signal('');
  searchTermInput = '';
  placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  // Computed values
  doctorsCountByDepartment = computed(() => {
    const counts: { [key: string]: number } = {};
    this.allDepartments().forEach(department => {
      counts[department.id] = department.doctors?.length || 0;
    });
    return counts;
  });

  filteredDepartments = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allDepartments();

    return this.allDepartments().filter(department => {
      const departmentMatch =
        department.name?.toLowerCase().includes(term) ||
        department.description?.toLowerCase().includes(term);

      const doctorMatch = department.doctors?.some(doctor =>
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term) ||
        doctor.description.toLowerCase().includes(term)
      );

      return departmentMatch || doctorMatch;
    });
  });

  paginatedDepartments = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredDepartments().slice(start, end);
  });

  async ngOnInit() {
    try {
      await this.bookingService.refreshData();
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load departments. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  trackById(index: number, item: Department): string {
    return item.id;
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onSearch(): void {
    this.searchTerm.set(this.searchTermInput);
    this.currentPage.set(1);
  }

  navigateToAddDepartment(): void {
    this.router.navigate(['/admin/add-department']);
  }

  navigateToEditDepartment(departmentId: string): void {
    this.router.navigate(['/admin/view-department', departmentId]);
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this department? This will also delete its associated doctors.')) {
      try {
        await lastValueFrom(this.bookingService.deleteDepartment(departmentId));
        alert('Department deleted successfully!');
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department. Please try again.');
      }
    }
  }
}
