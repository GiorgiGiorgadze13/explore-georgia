import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  address?: string;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

const USERS_KEY = 'explore_georgia_users';
const SESSION_KEY = 'explore_georgia_auth_session';
const RECOVERY_KEY = 'explore_georgia_recovery_email';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(this.loadSession());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // Seed default admin/demo user if no users exist
    this.seedDefaultUser();
  }

  private seedDefaultUser(): void {
    const users = this.getStoredUsers();
    if (users.length === 0) {
      const demoUser: StoredUser = {
        id: 'user_demo_123',
        firstName: 'გიორგი',
        lastName: 'ბერიძე',
        email: 'g@gmail.com',
        phone: '+995576123456',
        country: 'საქართველო',
        address: 'თბილისი',
        createdAt: new Date().toISOString(),
        passwordHash: '123456'
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
    }
  }

  private getStoredUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private loadSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveSession(user: User | null): void {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    this.currentUser.set(user);
  }

  login(emailOrPhone: string, password: string): { success: boolean; message?: string } {
    const cleanInput = emailOrPhone.trim().toLowerCase();
    const users = this.getStoredUsers();
    
    const user = users.find(u => 
      u.email.toLowerCase() === cleanInput || (u.phone && u.phone.includes(cleanInput))
    );

    if (!user) {
      return { success: false, message: 'მომხმარებელი ამ მონაცემებით ვერ მოიძებნა' };
    }

    if (user.passwordHash !== password) {
      return { success: false, message: 'პაროლი არასწორია' };
    }

    const { passwordHash, ...safeUser } = user;
    this.saveSession(safeUser);
    return { success: true };
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    birthDate?: string;
    country?: string;
    address?: string;
  }): { success: boolean; message?: string } {
    const users = this.getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'მომხმარებელი ამ ელფოსტით უკვე არსებობს' };
    }

    const newUser: StoredUser = {
      id: 'user_' + Date.now(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      phone: data.phone,
      birthDate: data.birthDate,
      country: data.country,
      address: data.address,
      createdAt: new Date().toISOString(),
      passwordHash: data.password
    };

    users.push(newUser);
    this.saveUsers(users);

    const { passwordHash, ...safeUser } = newUser;
    this.saveSession(safeUser);
    return { success: true };
  }

  logout(): void {
    this.saveSession(null);
  }

  setRecoveryEmail(email: string): void {
    localStorage.setItem(RECOVERY_KEY, email.trim().toLowerCase());
  }

  getRecoveryEmail(): string {
    return localStorage.getItem(RECOVERY_KEY) || '';
  }

  verifyCode(code: string): boolean {
    // For demo purposes, accepting any 4-digit code (e.g. 1234) or non-empty string
    return code.trim().length >= 4;
  }

  resetPassword(newPassword: string): boolean {
    const email = this.getRecoveryEmail();
    if (!email) return false;

    const users = this.getStoredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email);
    if (idx !== -1) {
      users[idx].passwordHash = newPassword;
      this.saveUsers(users);
      localStorage.removeItem(RECOVERY_KEY);
      return true;
    }
    return false;
  }
}
