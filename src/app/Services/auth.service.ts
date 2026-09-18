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
  isAdmin?: boolean;
  isBanned?: boolean;
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
  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  constructor() {
    // Seed default admin/demo user if no users exist
    this.seedDefaultUsers();
  }

  private seedDefaultUsers(): void {
    const users = this.getStoredUsers();
    
    // Check if main admin exists
    const hasAdmin = users.some(u => u.email.toLowerCase() === 'admin@exploregeorgia.ge');
    
    let updated = [...users];

    if (!hasAdmin) {
      const adminUser: StoredUser = {
        id: 'admin_root_1',
        firstName: 'ადმინისტრატორი',
        lastName: 'Explore Georgia',
        email: 'admin@exploregeorgia.ge',
        phone: '+995599000000',
        country: 'საქართველო',
        address: 'თბილისი',
        createdAt: new Date().toISOString(),
        passwordHash: 'admin123',
        isAdmin: true,
        isBanned: false
      };
      updated.push(adminUser);
    }

    if (updated.length === 1 && !users.some(u => u.id === 'user_demo_123')) {
      const demoUser: StoredUser = {
        id: 'user_demo_123',
        firstName: 'გიორგი',
        lastName: 'ბერიძე',
        email: 'g@gmail.com',
        phone: '+995576123456',
        country: 'საქართველო',
        address: 'თბილისი',
        createdAt: new Date().toISOString(),
        passwordHash: '123456',
        isAdmin: false,
        isBanned: false
      };
      updated.push(demoUser);
    }

    this.saveUsers(updated);
  }

  public getStoredUsers(): StoredUser[] {
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

    if (user.isBanned) {
      return { success: false, message: 'თქვენი ანგარიში დაბლოკილია ადმინისტრაციის მიერ' };
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
      passwordHash: data.password,
      isAdmin: false,
      isBanned: false
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

  toggleUserAdmin(userId: string): void {
    const users = this.getStoredUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      target.isAdmin = !target.isAdmin;
      this.saveUsers(users);

      // If current user modified themselves
      if (this.currentUser()?.id === userId) {
        const { passwordHash, ...safe } = target;
        this.saveSession(safe);
      }
    }
  }

  toggleBanUser(userId: string): void {
    const users = this.getStoredUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      target.isBanned = !target.isBanned;
      this.saveUsers(users);

      // If current user gets banned, log them out
      if (target.isBanned && this.currentUser()?.id === userId) {
        this.logout();
      }
    }
  }

  deleteUser(userId: string): void {
    const users = this.getStoredUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
    if (this.currentUser()?.id === userId) {
      this.logout();
    }
  }

  setRecoveryEmail(email: string): void {
    localStorage.setItem(RECOVERY_KEY, email.trim().toLowerCase());
  }

  getRecoveryEmail(): string {
    return localStorage.getItem(RECOVERY_KEY) || '';
  }

  verifyCode(code: string): boolean {
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
