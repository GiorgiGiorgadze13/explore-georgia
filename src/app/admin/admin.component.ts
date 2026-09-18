import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, StoredUser } from '../Services/auth.service';
import { PlacesService, CsvPlace } from '../Services/places.service';
import { LanguageService } from '../Services/language.service';
import { CardImageService } from '../Services/card-image.service';
import { BookingService, BookingRecord } from '../Services/booking.service';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  public authService = inject(AuthService);
  public placesService = inject(PlacesService);
  public bookingService = inject(BookingService);
  public langService = inject(LanguageService);
  public imageService = inject(CardImageService);
  private router = inject(Router);

  activeTab = signal<'dashboard' | 'pending' | 'places' | 'users' | 'payments' | 'security'>('dashboard');

  placesList = signal<CsvPlace[]>([]);
  placesSearch = signal<string>('');

  usersList = signal<StoredUser[]>([]);
  usersSearch = signal<string>('');

  bookingsSearch = signal<string>('');
  bookingsStatusFilter = signal<'ALL' | 'Completed' | 'Pending' | 'Refunded' | 'Cancelled'>('ALL');
  
  selectedBooking = signal<BookingRecord | null>(null);

  ngOnInit(): void {
    this.refreshPlaces();
    this.refreshUsers();
  }

  refreshPlaces(): void {
    this.placesService.getPlaces(true).subscribe({
      next: (data) => {
        this.placesList.set(data || []);
      }
    });
  }

  refreshUsers(): void {
    this.usersList.set(this.authService.getStoredUsers());
  }

  pendingPlaces = computed(() => {
    return this.placesList().filter(p => p.isApproved === false);
  });

  approvedPlaces = computed(() => {
    return this.placesList().filter(p => p.isApproved !== false);
  });

  filteredPlaces = computed(() => {
    const q = this.placesSearch().toLowerCase().trim();
    const base = this.approvedPlaces();
    if (!q) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  filteredUsers = computed(() => {
    const q = this.usersSearch().toLowerCase().trim();
    if (!q) return this.usersList();
    return this.usersList().filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  filteredBookings = computed(() => {
    const q = this.bookingsSearch().toLowerCase().trim();
    const status = this.bookingsStatusFilter();
    let list = this.bookingService.bookings();

    if (status !== 'ALL') {
      list = list.filter(b => b.status === status);
    }

    if (!q) return list;

    return list.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerEmail.toLowerCase().includes(q) ||
      b.tourName.toLowerCase().includes(q) ||
      b.cardHolder.toLowerCase().includes(q) ||
      (b.customerPhone && b.customerPhone.includes(q))
    );
  });

  stats = computed(() => {
    const places = this.approvedPlaces();
    const pending = this.pendingPlaces();
    const users = this.usersList();
    const admins = users.filter(u => u.isAdmin).length;
    const banned = users.filter(u => u.isBanned).length;

    const bookings = this.bookingService.bookings();
    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      totalPlaces: places.length,
      totalPending: pending.length,
      totalUsers: users.length,
      totalAdmins: admins,
      totalBanned: banned,
      totalBookings: bookings.length,
      totalRevenue: totalRevenue,
      pendingBookings: bookings.filter(b => b.status === 'Pending').length
    };
  });

  onApprovePlace(place: CsvPlace, event: Event): void {
    event.stopPropagation();
    this.placesService.approvePlace(place.id);
    this.refreshPlaces();
  }

  onRejectPlace(place: CsvPlace, event: Event): void {
    event.stopPropagation();
    const name = this.langService.translate(place.name);
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ ლოკაციის "${name}" უარყოფა და წაშლა?`)) {
      this.placesService.deletePlace(place.id);
      this.refreshPlaces();
    }
  }

  onDeletePlace(place: CsvPlace, event: Event): void {
    event.stopPropagation();
    const name = this.langService.translate(place.name);
    const confirmMsg = this.langService.isGeo()
      ? `დარწმუნებული ხართ, რომ გსურთ ლოკაციის "${name}" წაშლა?`
      : `Are you sure you want to delete the location "${name}"?`;

    if (confirm(confirmMsg)) {
      this.placesService.deletePlace(place.id);
      this.refreshPlaces();
    }
  }

  onToggleAdmin(user: StoredUser, event: Event): void {
    event.stopPropagation();
    const confirmMsg = user.isAdmin
      ? `გსურთ ჩამოართვათ ადმინის უფლება მომხმარებელს: ${user.email}?`
      : `გსურთ მიანიჭოთ ადმინის უფლება მომხმარებელს: ${user.email}?`;

    if (confirm(confirmMsg)) {
      this.authService.toggleUserAdmin(user.id);
      this.refreshUsers();
    }
  }

  onToggleBan(user: StoredUser, event: Event): void {
    event.stopPropagation();
    const confirmMsg = user.isBanned
      ? `გსურთ განბლოკოთ მომხმარებელი: ${user.email}?`
      : `გსურთ დაბლოკოთ (Ban) მომხმარებელი: ${user.email}?`;

    if (confirm(confirmMsg)) {
      this.authService.toggleBanUser(user.id);
      this.refreshUsers();
    }
  }

  onDeleteUser(user: StoredUser, event: Event): void {
    event.stopPropagation();
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ მომხმარებლის წაშლა: ${user.email}?`)) {
      this.authService.deleteUser(user.id);
      this.refreshUsers();
    }
  }

  // Payment & Booking Details Modal
  openBookingDetails(booking: BookingRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedBooking.set(booking);
  }

  closeBookingDetails(): void {
    this.selectedBooking.set(null);
  }

  onUpdateBookingStatus(booking: BookingRecord, newStatus: BookingRecord['status'], event: Event): void {
    event.stopPropagation();
    this.bookingService.updateBookingStatus(booking.id, newStatus);
    if (this.selectedBooking()?.id === booking.id) {
      this.selectedBooking.set({ ...booking, status: newStatus });
    }
  }

  onDeleteBooking(booking: BookingRecord, event: Event): void {
    event.stopPropagation();
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ ტრანზაქციის (${booking.id}) წაშლა?`)) {
      this.bookingService.deleteBooking(booking.id);
      if (this.selectedBooking()?.id === booking.id) {
        this.selectedBooking.set(null);
      }
    }
  }

  printReceipt(): void {
    window.print();
  }

  getPlaceImage(place: CsvPlace): string {
    const imgs = this.imageService.getImagesForItem(place.id, place.name, place.category, place.region);
    return imgs[0] || '/Rectangle1.png';
  }
}
