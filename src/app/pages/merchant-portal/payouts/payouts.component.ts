import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Payout } from '../../../models';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Payouts</h1><p>Track your settlement payouts</p></div>
    </div>

    <div class="stats-grid">
      @for (s of summaryStats; track s.label) {
        <div class="stat-card">
          <div class="stat-icon" [style.background]="s.color + '20'" [style.color]="s.color"><i [class]="s.icon"></i></div>
          <div><span class="stat-val">{{ s.value }}</span><span class="stat-lbl">{{ s.label }}</span></div>
        </div>
      }
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Payout History</h3>
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Reference</th><th>Date</th><th>Amount</th><th>Fee</th><th>Net Amount</th><th>Bank Account</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (p of payouts(); track p.id) {
              <tr>
                <td><code class="ref">{{ p.reference }}</code></td>
                <td>{{ p.date }}</td>
                <td>{{ p.currency }} {{ p.amount | number:'1.0-0' }}</td>
                <td class="fee">{{ p.currency }} {{ p.fee | number:'1.0-0' }}</td>
                <td class="net">{{ p.currency }} {{ p.net | number:'1.0-0' }}</td>
                <td>{{ p.bankAccount }}</td>
                <td><span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); } p { font-size: 0.875rem; color: var(--text-secondary); } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; gap: 1rem; align-items: center; }
    .stat-icon { width: 48px; height: 48px; min-width: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; i { font-size: 1.25rem; } }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); display: block; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-secondary); }
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); } select { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); color: var(--text-primary); font-size: 0.875rem; } }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
    td { padding: 0.875rem 1.25rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--geidea-green) 3%, var(--card-bg)); }
    .ref { background: rgba(59,181,74,0.08); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
    .fee { color: #ef4444; }
    .net { font-weight: 700; color: var(--geidea-green); }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.pending { background: #fef9c3; color: #b45309; }
    .badge.failed { background: #fee2e2; color: #dc2626; }
  `]
})
export class PayoutsComponent implements OnInit {
  payouts = signal<Payout[]>([]);
  statusFilter = '';
  subdomain = '';

  summaryStats = [
    { label: 'Total Paid Out', value: 'SAR 170,716', icon: 'pi pi-check-circle', color: '#16a34a' },
    { label: 'Pending', value: 'SAR 51,058', icon: 'pi pi-clock', color: '#f59e0b' },
    { label: 'This Month', value: 'SAR 82,418', icon: 'pi pi-calendar', color: '#3b82f6' },
    { label: 'Total Fee', value: 'SAR 3,484', icon: 'pi pi-minus-circle', color: '#ef4444' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.load();
  }

  load(): void {
    this.api.getPayouts(this.subdomain, this.statusFilter).subscribe(r => { if (r.success) this.payouts.set(r.data); });
  }
}
