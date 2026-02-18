import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  currentUser = signal<LoginResponse | null>(null);

  constructor(private router: Router, private api: ApiService) {
    const stored = sessionStorage.getItem('auth_user');
    if (stored) {
      try {
        const user: LoginResponse = JSON.parse(stored);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
      } catch { sessionStorage.clear(); }
    }
  }

  adminLogin(username: string, password: string): Observable<any> {
    return this.api.adminLogin({ username, password } as LoginRequest).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem('auth_user', JSON.stringify(res.data));
          this.isAuthenticated.set(true);
          this.currentUser.set(res.data);
        }
      })
    );
  }

  merchantLogin(subdomain: string, username: string, password: string): Observable<any> {
    return this.api.merchantLogin(subdomain, { username, password } as LoginRequest).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem('auth_user', JSON.stringify(res.data));
          sessionStorage.setItem('merchant_subdomain', subdomain);
          this.isAuthenticated.set(true);
          this.currentUser.set(res.data);
        }
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe();
    sessionStorage.clear();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  get merchantSubdomain(): string {
    return sessionStorage.getItem('merchant_subdomain') ?? '';
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isMerchant(): boolean {
    return this.currentUser()?.role === 'merchant';
  }
}
