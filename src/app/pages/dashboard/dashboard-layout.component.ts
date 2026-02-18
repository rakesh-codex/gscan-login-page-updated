import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo-icon">G</div>
          @if (!sidebarCollapsed()) {
            <span class="logo-text">Geidea</span>
          }
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.path === '/dashboard'}" class="nav-item" [title]="item.label">
              <i [class]="item.icon"></i>
              @if (!sidebarCollapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="auth.logout()" title="Logout">
            <i class="pi pi-sign-out"></i>
            @if (!sidebarCollapsed()) {
              <span>Logout</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-area">
        <header class="topbar">
          <button class="topbar-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <i class="pi pi-bars"></i>
          </button>
          <div class="topbar-right">
            <button class="topbar-btn" (click)="theme.toggle()">
              <i [class]="theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            <div class="avatar">GA</div>
          </div>
        </header>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      transition: width 0.25s;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      &.collapsed { width: 70px; }
    }
    .sidebar-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .logo-icon {
      width: 38px;
      height: 38px;
      min-width: 38px;
      background: var(--geidea-green);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }
    .logo-text {
      font-size: 1.3rem;
      font-weight: 700;
      color: white;
    }
    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      color: var(--sidebar-text);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      i { font-size: 1.1rem; min-width: 20px; text-align: center; }
      &:hover { background: rgba(255,255,255,0.06); color: white; }
      &.active {
        background: rgba(59, 181, 74, 0.15);
        color: var(--geidea-green);
        i { color: var(--geidea-green); }
      }
    }
    .sidebar-footer {
      padding: 0.75rem 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #ef4444 !important;
    }
    .main-area {
      flex: 1;
      margin-left: 250px;
      transition: margin-left 0.25s;
      display: flex;
      flex-direction: column;
    }
    .sidebar.collapsed ~ .main-area,
    :host:has(.sidebar.collapsed) .main-area {
      margin-left: 70px;
    }
    .topbar {
      height: 60px;
      background: var(--header-bg);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .topbar-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      &:hover { background: color-mix(in srgb, var(--geidea-green) 10%, var(--card-bg)); }
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--geidea-green);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .content {
      padding: 1.5rem;
      flex: 1;
    }
  `]
})
export class DashboardLayoutComponent {
  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Merchants', icon: 'pi pi-shop', path: '/dashboard' },
    { label: 'Users', icon: 'pi pi-users', path: '/dashboard/users' },
    { label: 'Settlements', icon: 'pi pi-wallet', path: '/dashboard/settlements' },
    { label: 'Reports', icon: 'pi pi-chart-bar', path: '/dashboard/reports' }
  ];

  constructor(public auth: AuthService, public theme: ThemeService) {}
}
