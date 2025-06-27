import { Component, inject } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PaginationComponent } from '../../pagination/pagination.component';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { AppointmentDetails } from '../../../services/users.service';
import { NgbDropdown, NgbDropdownAnchor, NgbDropdownItem, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import {PatientPdfService} from '../../../services/patient-pdf.service';
import {PatientExcelService} from '../../../services/patient-excel.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    PaginationComponent,
    NgIf,
    NgForOf,
    DatePipe,
    NgbDropdown,
    NgbDropdownAnchor,
    NgbDropdownMenu,
    NgbDropdownItem,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent {

  private usersService = inject(UsersService);
  bookings = toSignal(this.usersService.users$, { initialValue: [] });
  isLoading = toSignal(this.usersService.isLoading$, { initialValue: true });
  private patientPdf = inject (PatientPdfService)
  private patientExcel = inject (PatientExcelService)

  itemsPerPage = 10;
  currentPage = 1;
  searchTerm = '';
  selectedBookings: Set<string> = new Set();

  // Add filter object to store all filter values
  filters = {
    role: 'all' as string | null,
    position: '' as string | null,
    status: '' as string | null,
    location: '' as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null
  };

  get bookingsItems() {
    const filteredBookings = this.filterBookings();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  applyFilters(): void {
    this.currentPage = 1;
  }

  filterBookings() {
    let filtered = this.bookings();

    // Apply search term filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (booking: AppointmentDetails) =>
          booking.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          booking.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          booking.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          booking.bookingId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          booking.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          booking.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (this.filters.role !== 'all') {
      // Implement role filtering logic based on your requirements
    }

    // Apply position filter
    if (this.filters.position) {
      filtered = filtered.filter(booking =>
        booking.departmentName.toLowerCase() === this.filters.position?.toLowerCase()
      );
    }

    // Apply status filter
    if (this.filters.status) {
      filtered = filtered.filter(booking =>
        booking.appointmentType.toLowerCase() === this.filters.status?.toLowerCase()
      );
    }

    // Apply date range filter
    if (this.filters.startDate || this.filters.endDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        const startDate = this.filters.startDate ? new Date(this.filters.startDate) : null;
        const endDate = this.filters.endDate ? new Date(this.filters.endDate) : null;

        // Set end date to end of day
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        if (startDate && endDate) {
          return bookingDate >= startDate && bookingDate <= endDate;
        } else if (startDate) {
          return bookingDate >= startDate;
        } else if (endDate) {
          return bookingDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }

  isSelected(bookingId: string): boolean {
    return this.selectedBookings.has(bookingId);
  }

  toggleSelection(bookingId: string): void {
    if (this.selectedBookings.has(bookingId)) {
      this.selectedBookings.delete(bookingId);
    } else {
      this.selectedBookings.add(bookingId);
    }
  }

  selectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.bookingsItems.forEach((booking) => this.selectedBookings.add(booking.id));
    } else {
      this.selectedBookings.clear();
    }
  }

  get selectedCount(): number {
    return this.selectedBookings.size;
  }

  exportAsPdf() {
    this.usersService.setLoading(true); // You should have a setter like this
    this.patientPdf.getDownloadLink().subscribe({
      next: (link) => {
        console.log('Download link:', link);
        window.open(link, '_blank');
        this.usersService.setLoading(false);
      },
      error: (err) => {
        console.error('Error fetching PDF link:', err);
        this.usersService.setLoading(false);
      },
    });
  }

  onGenerateExcel() {
    this.usersService.setLoading(true); // Same setter
    this.patientExcel.getDownloadLink().subscribe({
      next: (link) => {
        console.log('Download link:', link);
        window.open(link, '_blank');
        this.usersService.setLoading(false);
      },
      error: (err) => {
        console.error('Error fetching Excel link:', err);
        this.usersService.setLoading(false);
      },
    });
  }
}
