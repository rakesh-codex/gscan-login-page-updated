import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { DashboardStats } from '../../../models';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div><h1>Dashboard</h1><p>Welcome back! Here's what's happening today.</p></div>
    </div>

    <div class="stats-grid">
      @for (s of stats(); track s.label) {
        <div class="stat-card">
          <div class="stat-icon" [style.background]="s.color + '20'" [style.color]="s.color"><i [class]="s.icon"></i></div>
          <div class="stat-body">
            <span class="stat-val">{{ s.value }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
            @if (s.change !== undefined) {
              <span class="stat-change" [class.up]="s.change >= 0" [class.down]="s.change < 0">
                <i [class]="s.change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                {{ s.change | number:'1.1-1' }}% vs last month
              </span>
            }
          </div>
        </div>
      }
    </div>

    <div class="bottom-grid">
      <div class="card">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="quick-actions">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="'/' + subdomain() + action.path" class="qa-item">
              <div class="qa-icon" [style.background]="action.color + '20'" [style.color]="action.color"><i [class]="action.icon"></i></div>
              <span>{{ action.label }}</span>
            </a>
          }
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Order Status Overview</h3></div>
        <div class="order-status-list">
          @for (s of orderStatuses; track s.label) {
            <div class="os-item">
              <div class="os-dot" [style.background]="s.color"></div>
              <span class="os-label">{{ s.label }}</span>
              <div class="os-bar-wrap"><div class="os-bar" [style.width]="s.pct + '%'" [style.background]="s.color"></div></div>
              <span class="os-count">{{ s.count }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
      p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem; }
    }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px;
      padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start;
    }
    .stat-icon { width: 50px; height: 50px; min-width: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; i { font-size: 1.3rem; } }
    .stat-body { display: flex; flex-direction: column; gap: 0.2rem; }
    .stat-val { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-secondary); }
    .stat-change { font-size: 0.7rem; display: flex; align-items: center; gap: 0.2rem; margin-top: 0.2rem; i { font-size: 0.65rem; } }
    .stat-change.up { color: #16a34a; }
    .stat-change.down { color: #dc2626; }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 768px) { .bottom-grid { grid-template-columns: 1fr; } }
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; }
    .card-header { margin-bottom: 1rem; h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); } }
    .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .qa-item {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 1rem 0.5rem; border-radius: 10px; border: 1px solid var(--border-color);
      cursor: pointer; transition: all 0.15s; text-align: center;
      span { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); }
      &:hover { border-color: var(--geidea-green); background: rgba(59,181,74,0.05); span { color: var(--geidea-green); } }
    }
    .qa-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; i { font-size: 1rem; } }
    .order-status-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .os-item { display: flex; align-items: center; gap: 0.75rem; }
    .os-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .os-label { font-size: 0.8rem; color: var(--text-secondary); width: 80px; flex-shrink: 0; }
    .os-bar-wrap { flex: 1; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
    .os-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .os-count { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); width: 30px; text-align: right; flex-shrink: 0; }
  `]
})
export class MerchantDashboardComponent implements OnInit {
  subdomain = signal('');
  stats = signal<any[]>([]);

  quickActions = [
    { label: 'New Order', icon: 'pi pi-plus-circle', path: '/orders', color: '#3bb54a' },
    { label: 'Manage Menu', icon: 'pi pi-book', path: '/menu', color: '#3b82f6' },
    { label: 'View Tables', icon: 'pi pi-th-large', path: '/tables', color: '#8b5cf6' },
    { label: 'Staff', icon: 'pi pi-users', path: '/staff', color: '#f59e0b' },
    { label: 'Reports', icon: 'pi pi-chart-bar', path: '/reports', color: '#06b6d4' },
    { label: 'Settings', icon: 'pi pi-cog', path: '/settings', color: '#6b7280' },
  ];

  orderStatuses = [
    { label: 'Pending',   count: 8,  pct: 20, color: '#f59e0b' },
    { label: 'Preparing', count: 12, pct: 30, color: '#3b82f6' },
    { label: 'Ready',     count: 5,  pct: 12, color: '#8b5cf6' },
    { label: 'Served',    count: 15, pct: 38, color: '#16a34a' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const sd = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.subdomain.set(sd);
    this.api.getMerchantDashboardStats(sd).subscribe(res => {
      if (res.success) {
        const d = res.data;
        this.stats.set([
          { label: 'Total Orders',    value: d.totalOrders.toLocaleString(), icon: 'pi pi-list',       color: '#3bb54a', change: d.ordersChange },
          { label: "Today's Revenue", value: `SAR ${d.todayRevenue.toLocaleString()}`, icon: 'pi pi-wallet', color: '#3b82f6', change: d.revenueChange },
          { label: 'Active Stores',   value: d.activeStores,                 icon: 'pi pi-map-marker', color: '#8b5cf6', change: undefined },
          { label: 'Active Tables',   value: d.activeTables,                 icon: 'pi pi-th-large',   color: '#f59e0b', change: undefined },
          { label: 'Pending Orders',  value: d.pendingOrders,                icon: 'pi pi-clock',      color: '#ef4444', change: undefined },
        ]);
      }
    });
  }
}
