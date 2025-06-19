
import { Component, inject } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PaginationComponent } from '../../pagination/pagination.component';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { AppointmentDetails } from '../../../services/users.service';
import {NgbDropdown, NgbDropdownAnchor, NgbDropdownItem, NgbDropdownMenu} from '@ng-bootstrap/ng-bootstrap';

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

  itemsPerPage = 10;
  currentPage = 1;
  searchTerm = '';

  selectedBookings: Set<string> = new Set();

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

  filterBookings() {
    if (!this.searchTerm) {
      return this.bookings();
    }
    return this.bookings().filter(
      (booking: AppointmentDetails) =>
        booking.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.bookingId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
}

