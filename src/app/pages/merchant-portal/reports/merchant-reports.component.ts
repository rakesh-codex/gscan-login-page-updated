import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MerchantReport } from '../../../models';

@Component({
  selector: 'app-merchant-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Reports & Analytics</h1><p>Monthly performance overview</p></div>
    </div>

    <!-- Summary cards -->
    <div class="stats-grid">
      @for (s of summaryStats; track s.label) {
        <div class="stat-card">
          <div class="stat-icon" [style.background]="s.color + '20'" [style.color]="s.color"><i [class]="s.icon"></i></div>
          <div><span class="stat-val">{{ s.value }}</span><span class="stat-lbl">{{ s.label }}</span></div>
        </div>
      }
    </div>

    <!-- Reports table -->
    <div class="card">
      <div class="card-header">
        <h3>Monthly Reports</h3>
        <button class="btn-primary" (click)="generateReport()"><i class="pi pi-plus"></i> Generate Report</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Period</th><th>Total Orders</th><th>Revenue</th><th>Avg Order Value</th><th>Top Items</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (r of reports(); track r.id) {
              <tr>
                <td><span class="period">{{ r.period }}</span></td>
                <td>{{ r.totalOrders | number }}</td>
                <td class="revenue">{{ r.currency }} {{ r.totalRevenue | number:'1.0-0' }}</td>
                <td>{{ r.currency }} {{ r.avgOrderValue | number:'1.2-2' }}</td>
                <td><div class="top-items">@for (item of r.topItems.slice(0,2); track item) { <span class="tag">{{ item }}</span> }</div></td>
                <td><span class="badge" [class.ready]="r.status === 'Ready'" [class.processing]="r.status === 'Processing'">{{ r.status }}</span></td>
                <td>
                  <button class="btn-icon" title="Download" [disabled]="r.status !== 'Ready'"><i class="pi pi-download"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); } p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; gap: 1rem; align-items: center; }
    .stat-icon { width: 48px; height: 48px; min-width: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; i { font-size: 1.25rem; } }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); display: block; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-secondary); }
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); } }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: var(--geidea-green); color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: var(--card-bg); }
    th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
    td { padding: 0.875rem 1.25rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--geidea-green) 3%, var(--card-bg)); }
    .period { font-weight: 600; }
    .revenue { font-weight: 600; color: var(--geidea-green); }
    .top-items { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .tag { background: rgba(59,181,74,0.1); color: var(--geidea-green); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 500; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.ready { background: #dcfce7; color: #16a34a; }
    .badge.processing { background: #fef9c3; color: #b45309; }
    .btn-icon { background: none; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.35rem 0.5rem; cursor: pointer; color: var(--text-secondary); &:hover:not(:disabled) { color: var(--geidea-green); border-color: var(--geidea-green); } &:disabled { opacity: 0.4; cursor: not-allowed; } }
  `]
})
export class MerchantReportsComponent implements OnInit {
  reports = signal<MerchantReport[]>([]);
  subdomain = '';

  summaryStats = [
    { label: 'Total Orders (YTD)', value: '3,329', icon: 'pi pi-list', color: '#3bb54a' },
    { label: 'Revenue (YTD)', value: 'SAR 260,850', icon: 'pi pi-wallet', color: '#3b82f6' },
    { label: 'Avg Order Value', value: 'SAR 78.2', icon: 'pi pi-chart-line', color: '#8b5cf6' },
    { label: 'Reports Generated', value: '3', icon: 'pi pi-file', color: '#f59e0b' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.api.getMerchantReports(this.subdomain).subscribe(r => { if (r.success) this.reports.set(r.data); });
  }

  generateReport(): void {
    alert('Report generation queued. It will appear here once ready.');
  }
}
