import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, MessageModule],
  template: `
    <div class="login-container" [class.dark]="theme.isDark()">
      <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
        <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>

      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">G</div>
            <span class="logo-text">Geidea</span>
          </div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage your merchant operations</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="field">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <i class="pi pi-user"></i>
              <input id="username" type="text" pInputText [(ngModel)]="username" name="username" placeholder="Enter your username" autocomplete="username" />
            </div>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="pi pi-lock"></i>
              <input id="password" [type]="showPassword() ? 'text' : 'password'" pInputText [(ngModel)]="password" name="password" placeholder="Enter your password" autocomplete="current-password" />
              <button type="button" class="eye-btn" (click)="showPassword.set(!showPassword())">
                <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>

          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full" />
          }

          <button pButton type="submit" label="Sign In" class="login-btn" [loading]="loading()"></button>
        </form>

        <div class="login-footer">
          <p>Default credentials: <code>geidea_admin</code> / <code>Geidea&#64;2025!</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f0f9ff 100%);
      padding: 1rem;
      transition: background 0.3s;
    }
    .login-container.dark {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    }
    .theme-toggle {
      position: fixed; top: 1.5rem; right: 1.5rem;
      width: 40px; height: 40px; border-radius: 50%;
      border: 1px solid var(--border-color); background: var(--card-bg);
      color: var(--text-primary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; transition: all 0.2s; z-index: 10;
      &:hover { transform: scale(1.1); }
    }
    .login-card {
      background: var(--card-bg); border-radius: 16px; padding: 2.5rem;
      width: 100%; max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1); border: 1px solid var(--border-color);
    }
    .login-header {
      text-align: center; margin-bottom: 2rem;
      .logo { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; }
      .logo-icon {
        width: 44px; height: 44px; background: var(--geidea-green); color: white;
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 1.3rem;
      }
      .logo-text { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); }
      h1 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
      p { font-size: 0.875rem; color: var(--text-secondary); }
    }
    .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field {
      display: flex; flex-direction: column; gap: 0.4rem;
      label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .input-wrapper {
      position: relative; display: flex; align-items: center;
      > i:first-child { position: absolute; left: 12px; color: var(--text-secondary); font-size: 0.9rem; z-index: 1; }
      input {
        width: 100%; padding: 0.7rem 0.75rem 0.7rem 2.5rem;
        border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem;
        background: var(--card-bg); color: var(--text-primary); transition: border-color 0.2s;
        &:focus { outline: none; border-color: var(--geidea-green); box-shadow: 0 0 0 3px rgba(59, 181, 74, 0.15); }
      }
    }
    .eye-btn { position: absolute; right: 10px; background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; &:hover { color: var(--text-primary); } }
    .login-btn {
      width: 100%; padding: 0.75rem; background: var(--geidea-green) !important;
      border-color: var(--geidea-green) !important; border-radius: 8px !important;
      font-weight: 600 !important; font-size: 0.95rem !important; margin-top: 0.5rem;
      &:hover { filter: brightness(1.05); }
    }
    .login-footer {
      margin-top: 1.5rem; text-align: center;
      p { font-size: 0.75rem; color: var(--text-secondary); }
      code { background: color-mix(in srgb, var(--geidea-green) 10%, var(--card-bg)); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router, public theme: ThemeService) {
    if (this.auth.isAuthenticated() && this.auth.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.error.set(null);
    if (!this.username || !this.password) { this.error.set('Please enter both username and password'); return; }
    this.loading.set(true);
    this.auth.adminLogin(this.username, this.password).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) this.router.navigate(['/dashboard']);
        else this.error.set(res.message ?? 'Invalid credentials. Please try again.');
      },
      error: () => { this.loading.set(false); this.error.set('Connection error. Please try again.'); }
    });
  }
}
