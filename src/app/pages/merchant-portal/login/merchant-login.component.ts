import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-merchant-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap" [class.dark]="theme.isDark()">
      <button class="theme-toggle" (click)="theme.toggle()">
        <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>
      <div class="login-card">
        <div class="login-head">
          <div class="logo"><div class="logo-icon">G</div><span>Geidea</span></div>
          <h1>{{ merchantName() }}</h1>
          <p>Merchant Portal — Sign in to continue</p>
        </div>
        <form (ngSubmit)="login()" class="form">
          <div class="field">
            <label>Username</label>
            <div class="input-wrap">
              <i class="pi pi-user"></i>
              <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" autocomplete="username" />
            </div>
          </div>
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <i class="pi pi-lock"></i>
              <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter password" autocomplete="current-password" />
              <button type="button" class="eye" (click)="showPwd.set(!showPwd())">
                <i [class]="showPwd() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>
          @if (error()) {
            <div class="error-msg"><i class="pi pi-exclamation-circle"></i> {{ error() }}</div>
          }
          <button type="submit" class="submit-btn" [disabled]="loading()">
            @if (loading()) { <i class="pi pi-spin pi-spinner"></i> } Signing in...
            @if (!loading()) { Sign In }
          </button>
        </form>
        <div class="hint">
          <p>Subdomain: <code>{{ subdomain() }}</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%); padding: 1rem;
    }
    .login-wrap.dark { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); }
    .theme-toggle {
      position: fixed; top: 1.5rem; right: 1.5rem; width: 40px; height: 40px;
      border-radius: 50%; border: 1px solid var(--border-color); background: var(--card-bg);
      color: var(--text-primary); cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 1.1rem; z-index: 10;
      &:hover { transform: scale(1.1); }
    }
    .login-card {
      background: var(--card-bg); border-radius: 16px; padding: 2.5rem;
      width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      border: 1px solid var(--border-color);
    }
    .login-head {
      text-align: center; margin-bottom: 2rem;
      .logo { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
      .logo-icon {
        width: 44px; height: 44px; background: var(--geidea-green); color: white;
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 1.3rem;
      }
      span { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); }
      h1 { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.3rem; }
      p { font-size: 0.8rem; color: var(--text-secondary); }
    }
    .form { display: flex; flex-direction: column; gap: 1.2rem; }
    .field {
      display: flex; flex-direction: column; gap: 0.4rem;
      label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .input-wrap {
      position: relative; display: flex; align-items: center;
      > i:first-child { position: absolute; left: 12px; color: var(--text-secondary); z-index: 1; }
      input {
        width: 100%; padding: 0.7rem 2.5rem; border: 1px solid var(--border-color); border-radius: 8px;
        font-size: 0.9rem; background: var(--card-bg); color: var(--text-primary);
        &:focus { outline: none; border-color: var(--geidea-green); box-shadow: 0 0 0 3px rgba(59,181,74,0.15); }
      }
    }
    .eye { position: absolute; right: 10px; background: none; border: none; color: var(--text-secondary); cursor: pointer; }
    .error-msg {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.75rem;
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 0.85rem;
    }
    .submit-btn {
      width: 100%; padding: 0.75rem; background: var(--geidea-green); color: white;
      border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
      &:hover:not(:disabled) { filter: brightness(1.05); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .hint { margin-top: 1.25rem; text-align: center; font-size: 0.75rem; color: var(--text-secondary); code { font-weight: 600; } }
  `]
})
export class MerchantLoginComponent {
  username = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);
  showPwd = signal(false);
  subdomain = signal('');
  merchantName = signal('Merchant Portal');

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService, public theme: ThemeService) {
    const sd = this.route.snapshot.paramMap.get('subdomain') ?? '';
    this.subdomain.set(sd);
    this.merchantName.set(sd.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    if (this.auth.isAuthenticated() && this.auth.isMerchant() && this.auth.merchantSubdomain === sd) {
      this.router.navigate([`/${sd}`]);
    }
  }

  login(): void {
    this.error.set(null);
    if (!this.username || !this.password) { this.error.set('Please enter both username and password'); return; }
    this.loading.set(true);
    this.auth.merchantLogin(this.subdomain(), this.username, this.password).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) this.router.navigate([`/${this.subdomain()}`]);
        else this.error.set(res.message ?? 'Invalid credentials');
      },
      error: () => { this.loading.set(false); this.error.set('Connection error. Please try again.'); }
    });
  }
}
