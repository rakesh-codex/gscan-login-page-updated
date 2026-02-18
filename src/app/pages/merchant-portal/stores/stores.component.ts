import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Store } from '../../../models';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Stores</h1><p>Manage your restaurant branches</p></div>
      <button class="btn-primary" (click)="openCreate()"><i class="pi pi-plus"></i> Add Store</button>
    </div>

    <div class="stores-grid">
      @for (store of stores(); track store.id) {
        <div class="store-card">
          <div class="store-top">
            <div class="store-avatar">{{ store.name.charAt(0) }}</div>
            <div class="store-info">
              <h3>{{ store.name }}</h3>
              <p>{{ store.city }}</p>
            </div>
            <span class="badge" [class.open]="store.status === 'Open'" [class.closed]="store.status === 'Closed'">{{ store.status }}</span>
          </div>
          <div class="store-details">
            <div class="detail-row"><i class="pi pi-map-marker"></i><span>{{ store.address }}</span></div>
            <div class="detail-row"><i class="pi pi-phone"></i><span>{{ store.phone }}</span></div>
            <div class="detail-row"><i class="pi pi-th-large"></i><span>{{ store.tablesCount }} Tables</span></div>
            <div class="detail-row"><i class="pi pi-user"></i><span>{{ store.managerName }}</span></div>
          </div>
          <div class="store-actions">
            <button class="btn-outline btn-sm" (click)="openEdit(store)"><i class="pi pi-pencil"></i> Edit</button>
            <button class="btn-danger btn-sm" (click)="deleteStore(store.id)"><i class="pi pi-trash"></i> Delete</button>
          </div>
        </div>
      }
    </div>

    @if (showDialog()) {
      <div class="overlay" (click)="showDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editing() ? 'Edit Store' : 'Add Store' }}</h2>
            <button class="close-btn" (click)="showDialog.set(false)"><i class="pi pi-times"></i></button>
          </div>
          <div class="dialog-body">
            <div class="form-grid">
              <div class="field"><label>Store Name</label><input type="text" [(ngModel)]="form.name" placeholder="e.g., Main Branch" /></div>
              <div class="field"><label>City</label><input type="text" [(ngModel)]="form.city" placeholder="e.g., Riyadh" /></div>
              <div class="field col-2"><label>Address</label><input type="text" [(ngModel)]="form.address" placeholder="Full address" /></div>
              <div class="field"><label>Phone</label><input type="text" [(ngModel)]="form.phone" placeholder="+966..." /></div>
              <div class="field"><label>Status</label>
                <select [(ngModel)]="form.status"><option value="Open">Open</option><option value="Closed">Closed</option></select>
              </div>
              <div class="field"><label>Manager Name</label><input type="text" [(ngModel)]="form.managerName" placeholder="Manager name" /></div>
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
    .btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.8rem; cursor: pointer; &:hover { border-color: var(--geidea-green); color: var(--geidea-green); } }
    .btn-danger { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: transparent; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.8rem; cursor: pointer; &:hover { background: #fef2f2; } }
    .btn-sm { padding: 0.4rem 0.8rem !important; font-size: 0.775rem !important; }
    .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .store-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .store-top { display: flex; align-items: center; gap: 0.75rem; }
    .store-avatar { width: 44px; height: 44px; min-width: 44px; background: var(--geidea-green); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
    .store-info { flex: 1; h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); } p { font-size: 0.75rem; color: var(--text-secondary); } }
    .badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.open { background: #dcfce7; color: #16a34a; }
    .badge.closed { background: #fee2e2; color: #dc2626; }
    .store-details { display: flex; flex-direction: column; gap: 0.4rem; }
    .detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); i { font-size: 0.8rem; min-width: 14px; color: var(--geidea-green); } }
    .store-actions { display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.25rem; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .dialog { background: var(--card-bg); border-radius: 14px; width: 100%; max-width: 520px; box-shadow: 0 25px 60px rgba(0,0,0,0.2); }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); h2 { font-size: 1rem; font-weight: 600; color: var(--text-primary); } }
    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; }
    .dialog-body { padding: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; } }
    .field.col-2 { grid-column: span 2; }
    input, select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--card-bg); color: var(--text-primary); &:focus { outline: none; border-color: var(--geidea-green); } }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
  `]
})
export class StoresComponent implements OnInit {
  stores = signal<Store[]>([]);
  showDialog = signal(false);
  editing = signal<Store | null>(null);
  subdomain = '';
  form: Partial<Store> = {};

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.load();
  }

  load(): void {
    this.api.getStores(this.subdomain).subscribe(r => { if (r.success) this.stores.set(r.data); });
  }

  openCreate(): void { this.editing.set(null); this.form = { status: 'Open' }; this.showDialog.set(true); }
  openEdit(s: Store): void { this.editing.set(s); this.form = { ...s }; this.showDialog.set(true); }

  save(): void {
    if (!this.form.name) return;
    const s = this.editing();
    if (s) {
      this.api.updateStore(this.subdomain, s.id, this.form).subscribe(() => { this.load(); this.showDialog.set(false); });
    } else {
      this.api.createStore(this.subdomain, this.form).subscribe(() => { this.load(); this.showDialog.set(false); });
    }
  }

  deleteStore(id: number): void {
    if (!confirm('Delete this store?')) return;
    this.api.deleteStore(this.subdomain, id).subscribe(() => this.load());
  }
}
