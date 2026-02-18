import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface NavItem { label: string; icon: string; path: string; }

@Component({
  selector: 'app-merchant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sb-header">
          <div class="logo-icon">G</div>
          @if (!collapsed()) { <div class="sb-title"><span class="brand">Geidea</span><span class="merchant-name">{{ merchantName() }}</span></div> }
        </div>
        <nav class="sb-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="'/' + subdomain() + item.path" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.path === ''}" class="nav-item" [title]="item.label">
              <i [class]="item.icon"></i>
              @if (!collapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>
        <div class="sb-footer">
          <button class="nav-item logout-btn" (click)="logout()" title="Logout">
            <i class="pi pi-sign-out"></i>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>
      <div class="main" [class.expanded]="collapsed()">
        <header class="topbar">
          <button class="icon-btn" (click)="collapsed.set(!collapsed())"><i class="pi pi-bars"></i></button>
          <div class="topbar-center">
            <span class="page-title">{{ merchantName() }}</span>
          </div>
          <div class="topbar-right">
            <button class="icon-btn" (click)="theme.toggle()">
              <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            <div class="avatar">{{ initials() }}</div>
          </div>
        </header>
        <main class="content"><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px; background: var(--sidebar-bg); display: flex; flex-direction: column;
      position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transition: width 0.25s;
      &.collapsed { width: 70px; }
    }
    .sb-header {
      padding: 1.2rem; display: flex; align-items: center; gap: 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.08); min-height: 70px;
    }
    .logo-icon {
      width: 38px; height: 38px; min-width: 38px; background: var(--geidea-green);
      color: white; border-radius: 10px; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 1.1rem;
    }
    .sb-title { display: flex; flex-direction: column; overflow: hidden; }
    .brand { font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.2; }
    .merchant-name { font-size: 0.7rem; color: var(--sidebar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-nav { flex: 1; padding: 0.75rem 0.5rem; display: flex; flex-direction: column; gap: 0.2rem; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem;
      border-radius: 8px; color: var(--sidebar-text); font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left;
      i { font-size: 1rem; min-width: 20px; text-align: center; }
      &:hover { background: rgba(255,255,255,0.07); color: white; }
      &.active { background: rgba(59,181,74,0.15); color: var(--geidea-green); i { color: var(--geidea-green); } }
    }
    .sb-footer { padding: 0.75rem 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .logout-btn:hover { background: rgba(239,68,68,0.15) !important; color: #ef4444 !important; }
    .main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; transition: margin-left 0.25s; }
    .main.expanded { margin-left: 70px; }
    .topbar {
      height: 64px; background: var(--header-bg); border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem;
      position: sticky; top: 0; z-index: 50; gap: 1rem;
    }
    .page-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .topbar-center { flex: 1; }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
    .icon-btn {
      width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border-color);
      background: var(--card-bg); color: var(--text-primary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      &:hover { background: color-mix(in srgb, var(--geidea-green) 10%, var(--card-bg)); }
    }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: var(--geidea-green);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
    }
    .content { padding: 1.5rem; flex: 1; overflow-y: auto; }
  `]
})
export class MerchantLayoutComponent {
  collapsed = signal(false);
  subdomain = signal('');
  merchantName = signal('');

  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'pi pi-home',       path: '' },
    { label: 'Stores',     icon: 'pi pi-map-marker', path: '/stores' },
    { label: 'Tables',     icon: 'pi pi-th-large',   path: '/tables' },
    { label: 'Menu',       icon: 'pi pi-book',       path: '/menu' },
    { label: 'Orders',     icon: 'pi pi-list',       path: '/orders' },
    { label: 'Reports',    icon: 'pi pi-chart-bar',  path: '/reports' },
    { label: 'Payouts',    icon: 'pi pi-wallet',     path: '/payouts' },
    { label: 'Staff',      icon: 'pi pi-users',      path: '/staff' },
    { label: 'Settings',   icon: 'pi pi-cog',        path: '/settings' },
  ];

  initials(): string {
    return this.auth.currentUser()?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'M';
  }

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService, public theme: ThemeService) {
    const sd = this.route.snapshot.paramMap.get('subdomain') ?? '';
    this.subdomain.set(sd);
    this.merchantName.set(this.auth.currentUser()?.name ?? sd.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }

  logout(): void { this.auth.logout(); }
}
