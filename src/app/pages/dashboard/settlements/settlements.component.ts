import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

interface Settlement {
  id: number;
  merchant: string;
  mid: string;
  amount: string;
  fee: string;
  net: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  reference: string;
}

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, TagModule, InputTextModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Settlements</h1>
        <p>Track and manage merchant settlement transactions</p>
      </div>
      <button pButton label="Export Report" icon="pi pi-download" class="p-button-success" (click)="exportCSV()"></button>
    </div>

    <div class="stats-grid">
      @for (stat of stats; track stat.label) {
        <div class="stat-card">
          <div class="stat-icon" [style.background]="stat.color + '20'" [style.color]="stat.color">
            <i [class]="stat.icon"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      }
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input type="text" pInputText placeholder="Search settlements..." [(ngModel)]="searchTerm" />
      </div>
      <p-select [(ngModel)]="statusFilter" [options]="statusOptions" placeholder="All Statuses" [showClear]="true" style="min-width:160px" />
    </div>

    <div class="card-container">
      <p-table [value]="filteredSettlements()" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} settlements">
        <ng-template #header>
          <tr>
            <th>Reference</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Net</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </ng-template>
        <ng-template #body let-s>
          <tr>
            <td><code class="ref-code">{{ s.reference }}</code></td>
            <td>
              <div>
                <div class="name-text">{{ s.merchant }}</div>
                <div class="sub-text">{{ s.mid }}</div>
              </div>
            </td>
            <td class="amount">{{ s.amount }}</td>
            <td class="fee">{{ s.fee }}</td>
            <td class="net">{{ s.net }}</td>
            <td><p-tag [value]="s.status" [severity]="getStatusSeverity(s.status)" /></td>
            <td class="date-text">{{ s.date }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
      p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; }
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      i { font-size: 1.25rem; }
    }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); display: block; }
    .stat-label { font-size: 0.75rem; color: var(--text-secondary); }
    .table-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap; }
    .search-box {
      position: relative; max-width: 320px; flex: 1;
      i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
      input { width: 100%; padding-left: 2.5rem; }
    }
    .card-container { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    .ref-code { background: color-mix(in srgb, var(--geidea-green) 10%, var(--card-bg)); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
    .name-text { font-weight: 600; font-size: 0.875rem; }
    .sub-text { font-size: 0.75rem; color: var(--text-secondary); }
    .amount { font-weight: 600; }
    .fee { color: var(--text-secondary); font-size: 0.85rem; }
    .net { font-weight: 700; color: var(--geidea-green); }
    .date-text { font-size: 0.8rem; color: var(--text-secondary); }
  `]
})
export class SettlementsComponent {
  searchTerm = '';
  statusFilter: string | null = null;
  statusOptions = ['Completed', 'Pending', 'Failed'];

  stats = [
    { label: 'Total Settled', value: 'SAR 3.8M', icon: 'pi pi-check-circle', color: '#3bb54a' },
    { label: 'Pending', value: 'SAR 245K', icon: 'pi pi-clock', color: '#f59e0b' },
    { label: 'Failed', value: 'SAR 12K', icon: 'pi pi-times-circle', color: '#ef4444' },
    { label: 'Settlement Count', value: '1,892', icon: 'pi pi-list', color: '#3b82f6' }
  ];

  settlements = signal<Settlement[]>([
    { id: 1, merchant: 'Al Rajhi Markets', mid: 'MID-001234', amount: 'SAR 125,400', fee: 'SAR 2,508', net: 'SAR 122,892', status: 'Completed', date: '2025-06-15', reference: 'STL-20250615-001' },
    { id: 2, merchant: 'Jarir Bookstore', mid: 'MID-001235', amount: 'SAR 89,200', fee: 'SAR 1,784', net: 'SAR 87,416', status: 'Completed', date: '2025-06-15', reference: 'STL-20250615-002' },
    { id: 3, merchant: 'Kudu Restaurant', mid: 'MID-001236', amount: 'SAR 45,600', fee: 'SAR 912', net: 'SAR 44,688', status: 'Pending', date: '2025-06-15', reference: 'STL-20250615-003' },
    { id: 4, merchant: 'Nahdi Pharmacy', mid: 'MID-001237', amount: 'SAR 67,800', fee: 'SAR 1,356', net: 'SAR 66,444', status: 'Completed', date: '2025-06-14', reference: 'STL-20250614-001' },
    { id: 5, merchant: 'Extra Electronics', mid: 'MID-001238', amount: 'SAR 234,500', fee: 'SAR 4,690', net: 'SAR 229,810', status: 'Completed', date: '2025-06-14', reference: 'STL-20250614-002' },
    { id: 6, merchant: 'Tamimi Markets', mid: 'MID-001239', amount: 'SAR 12,300', fee: 'SAR 246', net: 'SAR 12,054', status: 'Failed', date: '2025-06-14', reference: 'STL-20250614-003' },
    { id: 7, merchant: 'Whites Restaurant', mid: 'MID-001240', amount: 'SAR 28,900', fee: 'SAR 578', net: 'SAR 28,322', status: 'Pending', date: '2025-06-13', reference: 'STL-20250613-001' },
    { id: 8, merchant: 'Panda Hypermarket', mid: 'MID-001241', amount: 'SAR 189,700', fee: 'SAR 3,794', net: 'SAR 185,906', status: 'Completed', date: '2025-06-13', reference: 'STL-20250613-002' }
  ]);

  filteredSettlements = computed(() => {
    let list = this.settlements();
    const term = this.searchTerm.toLowerCase();
    if (term) {
      list = list.filter(s => s.merchant.toLowerCase().includes(term) || s.reference.toLowerCase().includes(term));
    }
    if (this.statusFilter) {
      list = list.filter(s => s.status === this.statusFilter);
    }
    return list;
  });

  getStatusSeverity(status: string): "success" | "danger" | "warn" {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed': return 'danger';
      default: return 'warn';
    }
  }

  exportCSV(): void {
    const data = this.filteredSettlements();
    const headers = ['Reference', 'Merchant', 'MID', 'Amount', 'Fee', 'Net', 'Status', 'Date'];
    const rows = data.map(s => [s.reference, s.merchant, s.mid, s.amount, s.fee, s.net, s.status, s.date]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
