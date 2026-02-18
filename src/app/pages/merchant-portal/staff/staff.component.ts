import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { StaffMember, Store } from '../../../models';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Staff Management</h1><p>Manage your team members and permissions</p></div>
      <button class="btn-primary" (click)="openCreate()"><i class="pi pi-plus"></i> Add Staff</button>
    </div>

    <div class="role-tabs">
      @for (r of roles; track r) {
        <button class="role-tab" [class.active]="roleFilter() === r" (click)="setRole(r)">{{ r }}</button>
      }
    </div>

    <div class="staff-grid">
      @for (s of filteredStaff(); track s.id) {
        <div class="staff-card">
          <div class="staff-top">
            <div class="avatar">{{ s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) }}</div>
            <div class="staff-info">
              <h3>{{ s.name }}</h3>
              <p>{{ s.storeName }}</p>
            </div>
            <span class="badge" [class.active]="s.status === 'Active'" [class.inactive]="s.status !== 'Active'">{{ s.status }}</span>
          </div>
          <div class="staff-details">
            <div class="detail-row"><i class="pi pi-envelope"></i><span>{{ s.email }}</span></div>
            <div class="detail-row"><i class="pi pi-id-card"></i><span class="role-badge role-{{ s.role.toLowerCase() }}">{{ s.role }}</span></div>
            <div class="detail-row"><i class="pi pi-calendar"></i><span>Joined {{ s.joinedAt }}</span></div>
          </div>
          <div class="staff-actions">
            <button class="btn-outline btn-sm" (click)="openEdit(s)"><i class="pi pi-pencil"></i> Edit</button>
            <button class="btn-danger btn-sm" (click)="deleteStaff(s.id)"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      }
    </div>

    @if (showDialog()) {
      <div class="overlay" (click)="showDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editing() ? 'Edit Staff' : 'Add Staff Member' }}</h2>
            <button class="close-btn" (click)="showDialog.set(false)"><i class="pi pi-times"></i></button>
          </div>
          <div class="dialog-body">
            <div class="form-grid">
              <div class="field col-2"><label>Full Name</label><input type="text" [(ngModel)]="form.name" placeholder="Full name" /></div>
              <div class="field col-2"><label>Email</label><input type="email" [(ngModel)]="form.email" placeholder="email@example.com" /></div>
              <div class="field"><label>Role</label>
                <select [(ngModel)]="form.role">
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
              <div class="field"><label>Store</label>
                <select [(ngModel)]="form.storeId">
                  @for (s of stores(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                </select>
              </div>
              <div class="field"><label>PIN</label><input type="password" [(ngModel)]="form.pin" placeholder="4-digit PIN" maxlength="4" /></div>
              <div class="field"><label>Status</label>
                <select [(ngModel)]="form.status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
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
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: var(--geidea-green); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.7rem; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.8rem; cursor: pointer; &:hover { border-color: var(--geidea-green); } }
    .btn-danger { padding: 0.5rem 0.7rem; background: transparent; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.8rem; cursor: pointer; }
    .btn-sm { padding: 0.35rem 0.6rem !important; font-size: 0.775rem !important; }
    .role-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .role-tab { padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; &.active { background: var(--geidea-green); color: white; border-color: var(--geidea-green); } }
    .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .staff-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .staff-top { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 44px; height: 44px; min-width: 44px; background: var(--geidea-green); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
    .staff-info { flex: 1; h3 { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); } p { font-size: 0.75rem; color: var(--text-secondary); } }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.active { background: #dcfce7; color: #16a34a; }
    .badge.inactive { background: #fee2e2; color: #dc2626; }
    .staff-details { display: flex; flex-direction: column; gap: 0.4rem; }
    .detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); i { font-size: 0.8rem; min-width: 14px; color: var(--geidea-green); } }
    .role-badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
    .role-manager { background: #ede9fe; color: #6d28d9; }
    .role-cashier { background: #dbeafe; color: #1d4ed8; }
    .role-waiter { background: #fef9c3; color: #b45309; }
    .role-kitchen { background: #fee2e2; color: #dc2626; }
    .staff-actions { display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .dialog { background: var(--card-bg); border-radius: 14px; width: 100%; max-width: 520px; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); h2 { font-size: 1rem; font-weight: 600; color: var(--text-primary); } }
    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; }
    .dialog-body { padding: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; } }
    .field.col-2 { grid-column: span 2; }
    input, select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--card-bg); color: var(--text-primary); width: 100%; &:focus { outline: none; border-color: var(--geidea-green); } }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
  `]
})
export class StaffComponent implements OnInit {
  staff = signal<StaffMember[]>([]);
  filteredStaff = signal<StaffMember[]>([]);
  stores = signal<Store[]>([]);
  showDialog = signal(false);
  editing = signal<StaffMember | null>(null);
  roleFilter = signal('All');
  subdomain = '';
  form: Partial<StaffMember> = {};
  roles = ['All', 'Manager', 'Cashier', 'Waiter', 'Kitchen'];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.api.getStores(this.subdomain).subscribe(r => { if (r.success) this.stores.set(r.data); });
    this.api.getStaff(this.subdomain).subscribe(r => { if (r.success) { this.staff.set(r.data); this.applyFilter(); } });
  }

  setRole(r: string): void { this.roleFilter.set(r); this.applyFilter(); }
  applyFilter(): void { this.filteredStaff.set(this.roleFilter() === 'All' ? this.staff() : this.staff().filter(s => s.role === this.roleFilter())); }

  openCreate(): void { this.editing.set(null); this.form = { status: 'Active', role: 'Waiter' }; this.showDialog.set(true); }
  openEdit(s: StaffMember): void { this.editing.set(s); this.form = { ...s }; this.showDialog.set(true); }

  save(): void {
    if (!this.form.name) return;
    const store = this.stores().find(s => s.id === Number(this.form.storeId));
    this.form.storeName = store?.name ?? '';
    const e = this.editing();
    if (e) {
      this.api.updateStaff(this.subdomain, e.id, this.form).subscribe(() => { this.ngOnInit(); this.showDialog.set(false); });
    } else {
      this.api.createStaff(this.subdomain, this.form).subscribe(() => { this.ngOnInit(); this.showDialog.set(false); });
    }
  }

  deleteStaff(id: number): void {
    if (!confirm('Remove this staff member?')) return;
    this.api.deleteStaff(this.subdomain, id).subscribe(() => this.ngOnInit());
  }
}
