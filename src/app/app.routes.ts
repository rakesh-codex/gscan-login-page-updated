import { Routes } from '@angular/router';
import { authGuard, merchantGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Admin
  { path: '', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/merchants/merchants.component').then(m => m.MerchantsComponent) },
      { path: 'users', loadComponent: () => import('./pages/dashboard/users/users.component').then(m => m.UsersComponent) },
      { path: 'settlements', loadComponent: () => import('./pages/dashboard/settlements/settlements.component').then(m => m.SettlementsComponent) },
      { path: 'reports', loadComponent: () => import('./pages/dashboard/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },
  // Merchant Portal
  { path: ':subdomain/login', loadComponent: () => import('./pages/merchant-portal/login/merchant-login.component').then(m => m.MerchantLoginComponent) },
  {
    path: ':subdomain',
    loadComponent: () => import('./pages/merchant-portal/merchant-layout.component').then(m => m.MerchantLayoutComponent),
    canActivate: [merchantGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/merchant-portal/dashboard/merchant-dashboard.component').then(m => m.MerchantDashboardComponent) },
      { path: 'stores', loadComponent: () => import('./pages/merchant-portal/stores/stores.component').then(m => m.StoresComponent) },
      { path: 'tables', loadComponent: () => import('./pages/merchant-portal/tables/tables.component').then(m => m.TablesComponent) },
      { path: 'menu', loadComponent: () => import('./pages/merchant-portal/menu/menu.component').then(m => m.MenuComponent) },
      { path: 'orders', loadComponent: () => import('./pages/merchant-portal/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'reports', loadComponent: () => import('./pages/merchant-portal/reports/merchant-reports.component').then(m => m.MerchantReportsComponent) },
      { path: 'payouts', loadComponent: () => import('./pages/merchant-portal/payouts/payouts.component').then(m => m.PayoutsComponent) },
      { path: 'staff', loadComponent: () => import('./pages/merchant-portal/staff/staff.component').then(m => m.StaffComponent) },
      { path: 'settings', loadComponent: () => import('./pages/merchant-portal/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
