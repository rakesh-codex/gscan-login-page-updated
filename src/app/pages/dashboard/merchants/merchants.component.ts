import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

interface Merchant {
  id: number;
  name: string;
  mid: string;
  status: 'Active' | 'Inactive' | 'Pending';
  type: string;
  transactions: number;
  volume: string;
  subdomain: string;
}

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Merchants</h1>
        <p>Manage and monitor merchant accounts</p>
      </div>
      <button pButton label="Create Merchant" icon="pi pi-plus" class="p-button-success" (click)="openCreate()"></button>
    </div>

    <!-- Stats Cards -->
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

    <!-- Search -->
    <div class="table-toolbar">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input type="text" pInputText placeholder="Search merchants..." [(ngModel)]="searchTerm" />
      </div>
    </div>

    <!-- Table -->
    <div class="card-container">
      <p-table [value]="filteredMerchants()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} merchants">
        <ng-template #header>
          <tr>
            <th>Merchant Name</th>
            <th>MID</th>
            <th>Status</th>
            <th>Type</th>
            <th>Transactions</th>
            <th>Volume</th>
            <th style="width:100px">Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-m>
          <tr>
            <td>
              <div class="merchant-name">
                <div class="merchant-avatar">{{ m.name.charAt(0) }}</div>
                <div>
                  <div class="name-text">{{ m.name }}</div>
                  <div class="subdomain-text">{{ m.subdomain }}</div>
                </div>
              </div>
            </td>
            <td><code class="mid-code">{{ m.mid }}</code></td>
            <td><p-tag [value]="m.status" [severity]="getStatusSeverity(m.status)" /></td>
            <td>{{ m.type }}</td>
            <td>{{ m.transactions | number }}</td>
            <td>{{ m.volume }}</td>
            <td>
              <div class="action-btns">
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="openEdit(m)"></button>
                <a [href]="'https://' + m.subdomain" target="_blank" rel="noopener">
                  <button pButton icon="pi pi-external-link" class="p-button-text p-button-sm"></button>
                </a>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create/Edit Dialog -->
    <p-dialog [(visible)]="dialogVisible" [header]="editingMerchant ? 'Edit Merchant' : 'Create Merchant'" [modal]="true" [style]="{width: '480px'}" [draggable]="false">
      <div class="dialog-form">
        <div class="field">
          <label>Merchant Name</label>
          <input pInputText [(ngModel)]="form.name" placeholder="Enter merchant name" class="w-full" />
        </div>
        <div class="field">
          <label>MID</label>
          <input pInputText [(ngModel)]="form.mid" placeholder="e.g., MID-001234" class="w-full" />
        </div>
        <div class="field">
          <label>Status</label>
          <p-select [(ngModel)]="form.status" [options]="statusOptions" placeholder="Select status" class="w-full" />
        </div>
        <div class="field">
          <label>Type</label>
          <p-select [(ngModel)]="form.type" [options]="typeOptions" placeholder="Select type" class="w-full" />
        </div>
        <div class="field">
          <label>Subdomain</label>
          <input pInputText [(ngModel)]="form.subdomain" placeholder="e.g., merchant.geidea.net" class="w-full" />
        </div>
      </div>
      <ng-template #footer>
        <button pButton label="Cancel" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton [label]="editingMerchant ? 'Update' : 'Create'" class="p-button-success" (click)="saveMerchant()"></button>
      </ng-template>
    </p-dialog>
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
    .table-toolbar {
      margin-bottom: 1rem;
    }
    .search-box {
      position: relative; max-width: 320px;
      i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
      input { width: 100%; padding-left: 2.5rem; }
    }
    .card-container {
      background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;
    }
    .merchant-name {
      display: flex; align-items: center; gap: 0.75rem;
    }
    .merchant-avatar {
      width: 36px; height: 36px; border-radius: 8px; background: var(--geidea-green);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem;
    }
    .name-text { font-weight: 600; color: var(--text-primary); font-size: 0.875rem; }
    .subdomain-text { font-size: 0.75rem; color: var(--text-secondary); }
    .mid-code {
      background: color-mix(in srgb, var(--geidea-green) 10%, var(--card-bg));
      padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;
    }
    .action-btns { display: flex; gap: 0.25rem; }
    .dialog-form { display: flex; flex-direction: column; gap: 1rem; }
    .field {
      display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
    }
    .w-full { width: 100%; }
  `]
})
export class MerchantsComponent {
  searchTerm = '';
  dialogVisible = false;
  editingMerchant: Merchant | null = null;

  form = { name: '', mid: '', status: 'Active', type: 'Retail', subdomain: '' };
  statusOptions = ['Active', 'Inactive', 'Pending'];
  typeOptions = ['Retail', 'E-commerce', 'F&B', 'Services', 'Healthcare'];

  stats = [
    { label: 'Total Merchants', value: '2,847', icon: 'pi pi-shop', color: '#3bb54a' },
    { label: 'Active Merchants', value: '2,134', icon: 'pi pi-check-circle', color: '#3b82f6' },
    { label: 'Monthly Volume', value: 'SAR 4.2M', icon: 'pi pi-wallet', color: '#8b5cf6' },
    { label: 'Avg. Transactions', value: '1,247', icon: 'pi pi-chart-line', color: '#f59e0b' }
  ];

  merchants = signal<Merchant[]>([
    { id: 1, name: 'Al Rajhi Markets', mid: 'MID-001234', status: 'Active', type: 'Retail', transactions: 15234, volume: 'SAR 1.2M', subdomain: 'alrajhi.geidea.net' },
    { id: 2, name: 'Jarir Bookstore', mid: 'MID-001235', status: 'Active', type: 'Retail', transactions: 8921, volume: 'SAR 890K', subdomain: 'jarir.geidea.net' },
    { id: 3, name: 'Kudu Restaurant', mid: 'MID-001236', status: 'Active', type: 'F&B', transactions: 12456, volume: 'SAR 650K', subdomain: 'kudu.geidea.net' },
    { id: 4, name: 'Nahdi Pharmacy', mid: 'MID-001237', status: 'Pending', type: 'Healthcare', transactions: 0, volume: 'SAR 0', subdomain: 'nahdi.geidea.net' },
    { id: 5, name: 'Extra Electronics', mid: 'MID-001238', status: 'Active', type: 'Retail', transactions: 6543, volume: 'SAR 1.8M', subdomain: 'extra.geidea.net' },
    { id: 6, name: 'Tamimi Markets', mid: 'MID-001239', status: 'Inactive', type: 'Retail', transactions: 3210, volume: 'SAR 420K', subdomain: 'tamimi.geidea.net' },
    { id: 7, name: 'Whites Restaurant', mid: 'MID-001240', status: 'Active', type: 'F&B', transactions: 4567, volume: 'SAR 310K', subdomain: 'whites.geidea.net' },
    { id: 8, name: 'Panda Hypermarket', mid: 'MID-001241', status: 'Active', type: 'Retail', transactions: 19876, volume: 'SAR 2.1M', subdomain: 'panda.geidea.net' }
  ]);

  filteredMerchants = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.merchants();
    return this.merchants().filter(m =>
      m.name.toLowerCase().includes(term) || m.mid.toLowerCase().includes(term) || m.type.toLowerCase().includes(term)
    );
  });

  getStatusSeverity(status: string): "success" | "danger" | "warn" | "info" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'danger';
      case 'Pending': return 'warn';
      default: return 'info';
    }
  }

  openCreate(): void {
    this.editingMerchant = null;
    this.form = { name: '', mid: '', status: 'Active', type: 'Retail', subdomain: '' };
    this.dialogVisible = true;
  }

  openEdit(m: Merchant): void {
    this.editingMerchant = m;
    this.form = { name: m.name, mid: m.mid, status: m.status, type: m.type, subdomain: m.subdomain };
    this.dialogVisible = true;
  }

  saveMerchant(): void {
    if (!this.form.name || !this.form.mid) return;
    if (this.editingMerchant) {
      this.merchants.update(list => list.map(m =>
        m.id === this.editingMerchant!.id
          ? { ...m, name: this.form.name, mid: this.form.mid, status: this.form.status as Merchant['status'], type: this.form.type, subdomain: this.form.subdomain }
          : m
      ));
    } else {
      const newId = Math.max(...this.merchants().map(m => m.id)) + 1;
      this.merchants.update(list => [...list, {
        id: newId, name: this.form.name, mid: this.form.mid, status: this.form.status as Merchant['status'],
        type: this.form.type, transactions: 0, volume: 'SAR 0', subdomain: this.form.subdomain
      }]);
    }
    this.dialogVisible = false;
  }
}
