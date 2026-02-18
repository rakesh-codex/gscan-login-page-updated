import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Table, Store } from '../../../models';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Tables & QR Codes</h1><p>Manage dining tables and QR codes for ordering</p></div>
      <button class="btn-primary" (click)="openCreate()"><i class="pi pi-plus"></i> Add Table</button>
    </div>

    <div class="filter-bar">
      <label>Filter by Store:</label>
      <select [(ngModel)]="selectedStore" (ngModelChange)="filterTables()">
        <option value="">All Stores</option>
        @for (s of stores(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
      </select>
    </div>

    <div class="tables-grid">
      @for (table of filteredTables(); track table.id) {
        <div class="table-card" [class.occupied]="table.status === 'Occupied'" [class.reserved]="table.status === 'Reserved'">
          <div class="table-top">
            <div class="table-num">{{ table.number }}</div>
            <span class="badge" [class]="table.status.toLowerCase()">{{ table.status }}</span>
          </div>
          <div class="table-details">
            <div class="td-row"><i class="pi pi-users"></i><span>Capacity: {{ table.capacity }}</span></div>
            <div class="td-row"><i class="pi pi-qrcode"></i><span>{{ table.qrCode }}</span></div>
            @if (table.currentOrderId) {
              <div class="td-row"><i class="pi pi-list"></i><span>Order #{{ table.currentOrderId }}</span></div>
            }
          </div>
          <div class="table-actions">
            <button class="btn-outline btn-sm" (click)="openEdit(table)"><i class="pi pi-pencil"></i></button>
            <button class="btn-outline btn-sm" title="View QR"><i class="pi pi-qrcode"></i></button>
            <button class="btn-danger btn-sm" (click)="deleteTable(table.id)"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      }
    </div>

    @if (showDialog()) {
      <div class="overlay" (click)="showDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editing() ? 'Edit Table' : 'Add Table' }}</h2>
            <button class="close-btn" (click)="showDialog.set(false)"><i class="pi pi-times"></i></button>
          </div>
          <div class="dialog-body">
            <div class="form-grid">
              <div class="field"><label>Table Number</label><input type="text" [(ngModel)]="form.number" placeholder="e.g., T-01" /></div>
              <div class="field"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" placeholder="e.g., 4" /></div>
              <div class="field"><label>Store</label>
                <select [(ngModel)]="form.storeId">
                  @for (s of stores(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                </select>
              </div>
              <div class="field"><label>Status</label>
                <select [(ngModel)]="form.status">
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-outline" (click)="showDialog.set(false)">Cancel</button>
            <button class="btn-primary" (click)="save()">{{ editing() ? 'Update' : 'Create' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
      p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem; }
    }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: var(--geidea-green); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; &:hover { filter: brightness(1.05); } }
    .btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.7rem; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.8rem; cursor: pointer; &:hover { border-color: var(--geidea-green); color: var(--geidea-green); } }
    .btn-danger { padding: 0.5rem 0.7rem; background: transparent; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.8rem; cursor: pointer; }
    .btn-sm { padding: 0.35rem 0.6rem !important; }
    .filter-bar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); } select { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); color: var(--text-primary); font-size: 0.875rem; } }
    .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .table-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s; }
    .table-card.occupied { border-color: #3b82f6; }
    .table-card.reserved { border-color: #f59e0b; }
    .table-top { display: flex; align-items: center; justify-content: space-between; }
    .table-num { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.available { background: #dcfce7; color: #16a34a; }
    .badge.occupied { background: #dbeafe; color: #1d4ed8; }
    .badge.reserved { background: #fef9c3; color: #b45309; }
    .table-details { display: flex; flex-direction: column; gap: 0.35rem; }
    .td-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.775rem; color: var(--text-secondary); i { font-size: 0.75rem; color: var(--geidea-green); min-width: 12px; } }
    .table-actions { display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .dialog { background: var(--card-bg); border-radius: 14px; width: 100%; max-width: 480px; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); h2 { font-size: 1rem; font-weight: 600; color: var(--text-primary); } }
    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; }
    .dialog-body { padding: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; } }
    input, select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--card-bg); color: var(--text-primary); &:focus { outline: none; border-color: var(--geidea-green); } }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
  `]
})
export class TablesComponent implements OnInit {
  tables = signal<Table[]>([]);
  filteredTables = signal<Table[]>([]);
  stores = signal<Store[]>([]);
  showDialog = signal(false);
  editing = signal<Table | null>(null);
  selectedStore = '';
  subdomain = '';
  form: Partial<Table> = {};

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.api.getStores(this.subdomain).subscribe(r => { if (r.success) this.stores.set(r.data); });
    this.api.getTables(this.subdomain).subscribe(r => { if (r.success) { this.tables.set(r.data); this.filteredTables.set(r.data); } });
  }

  filterTables(): void {
    const sid = Number(this.selectedStore);
    this.filteredTables.set(sid ? this.tables().filter(t => t.storeId === sid) : this.tables());
  }

  openCreate(): void { this.editing.set(null); this.form = { status: 'Available', capacity: 4 }; this.showDialog.set(true); }
  openEdit(t: Table): void { this.editing.set(t); this.form = { ...t }; this.showDialog.set(true); }

  save(): void {
    if (!this.form.number) return;
    const t = this.editing();
    if (t) {
      this.api.updateTable(this.subdomain, t.id, this.form).subscribe(() => { this.ngOnInit(); this.showDialog.set(false); });
    } else {
      this.api.createTable(this.subdomain, this.form).subscribe(() => { this.ngOnInit(); this.showDialog.set(false); });
    }
  }

  deleteTable(id: number): void {
    if (!confirm('Delete this table?')) return;
    this.api.deleteTable(this.subdomain, id).subscribe(() => this.ngOnInit());
  }
}
