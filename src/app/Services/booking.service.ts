import { Injectable, signal } from '@angular/core';

export interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  tourName: string;
  travelerCount: number;
  totalAmount: number;
  cardNumberMasked: string;
  cardHolder: string;
  cardBrand: string;
  bookingDate: string;
  createdAt: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Cancelled';
  servicesIncluded?: string[];
}

const STORAGE_KEY = 'explore_georgia_bookings';

const DEFAULT_BOOKINGS: BookingRecord[] = [
  {
    id: 'BOOK-78901',
    customerName: 'Giorgi Beridze',
    customerEmail: 'giorgi.b@gmail.com',
    customerPhone: '+995 599 123 456',
    tourName: 'ღვინისა და კულტურის ტური კახეთში',
    travelerCount: 4,
    totalAmount: 740,
    cardNumberMasked: '4242 •••• •••• 4242',
    cardHolder: 'Giorgi Beridze',
    cardBrand: 'Visa',
    bookingDate: '2026-10-15',
    createdAt: '2026-09-18 10:30',
    status: 'Completed',
    servicesIncluded: ['20-seat minibus', 'Traditional Georgian Lunch', 'Wine Tasting', 'Guide: Giorgi']
  },
  {
    id: 'BOOK-89124',
    customerName: 'Elena Smirnova',
    customerEmail: 'elena.s@mail.ru',
    customerPhone: '+995 591 987 654',
    tourName: 'ყაზბეგი და გერგეტის სამება',
    travelerCount: 2,
    totalAmount: 480,
    cardNumberMasked: '5412 •••• •••• 1289',
    cardHolder: 'Elena Smirnova',
    cardBrand: 'Mastercard',
    bookingDate: '2026-10-18',
    createdAt: '2026-09-17 16:45',
    status: 'Completed',
    servicesIncluded: ['VIP Mercedes Sprinter', 'Royal Supra Feast', 'Guide: Nino']
  },
  {
    id: 'BOOK-91023',
    customerName: 'David Miller',
    customerEmail: 'david.m@yahoo.com',
    customerPhone: '+1 415 555 0199',
    tourName: 'სვანეთის კოშკები და მყინვარწვერი',
    travelerCount: 3,
    totalAmount: 950,
    cardNumberMasked: '3782 •••• •••• 1005',
    cardHolder: 'David Miller',
    cardBrand: 'Amex',
    bookingDate: '2026-11-02',
    createdAt: '2026-09-16 12:15',
    status: 'Pending',
    servicesIncluded: ['Large bus (50 seats)', 'Vegetarian Georgian Feast', 'Guide: Davit']
  }
];

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  bookings = signal<BookingRecord[]>(this.loadBookings());

  private loadBookings(): BookingRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load bookings from localStorage:', e);
    }
    this.saveBookings(DEFAULT_BOOKINGS);
    return DEFAULT_BOOKINGS;
  }

  private saveBookings(list: BookingRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this.bookings.set(list);
    } catch (e) {
      console.error('Failed to save bookings:', e);
    }
  }

  getBookings(): BookingRecord[] {
    return this.bookings();
  }

  addBooking(booking: Omit<BookingRecord, 'id' | 'createdAt' | 'status'> & { id?: string; status?: BookingRecord['status'] }): BookingRecord {
    const current = this.bookings();
    const newId = booking.id || `BOOK-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const createdAtStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    const newRecord: BookingRecord = {
      ...booking,
      id: newId,
      createdAt: createdAtStr,
      status: booking.status || 'Completed'
    };

    const updated = [newRecord, ...current];
    this.saveBookings(updated);
    return newRecord;
  }

  updateBookingStatus(id: string, status: BookingRecord['status']): void {
    const updated = this.bookings().map(b => b.id === id ? { ...b, status } : b);
    this.saveBookings(updated);
  }

  deleteBooking(id: string): void {
    const updated = this.bookings().filter(b => b.id !== id);
    this.saveBookings(updated);
  }

  getBookingById(id: string): BookingRecord | undefined {
    return this.bookings().find(b => b.id === id);
  }
}
