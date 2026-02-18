import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MerchantSettings } from '../../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Settings</h1><p>Configure your merchant profile and preferences</p></div>
    </div>

    @if (settings()) {
      <div class="settings-layout">
        <!-- General -->
        <div class="card">
          <div class="card-header"><i class="pi pi-building"></i><h3>General Information</h3></div>
          <div class="form-grid">
            <div class="field col-2"><label>Merchant Name</label><input type="text" [(ngModel)]="settings()!.merchantName" /></div>
            <div class="field"><label>Email</label><input type="email" [(ngModel)]="settings()!.email" /></div>
            <div class="field"><label>Phone</label><input type="text" [(ngModel)]="settings()!.phone" /></div>
            <div class="field"><label>Currency</label>
              <select [(ngModel)]="settings()!.currency">
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="USD">USD — US Dollar</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </div>
            <div class="field"><label>Timezone</label>
              <select [(ngModel)]="settings()!.timezone">
                <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div class="field"><label>VAT Rate (%)</label><input type="number" [(ngModel)]="settings()!.taxRate" min="0" max="100" step="0.1" /></div>
            <div class="field"><label>Order Prefix</label><input type="text" [(ngModel)]="settings()!.orderPrefix" placeholder="e.g., ORD" /></div>
          </div>
        </div>

        <!-- Ordering Options -->
        <div class="card">
          <div class="card-header"><i class="pi pi-cog"></i><h3>Ordering Options</h3></div>
          <div class="toggles">
            <div class="toggle-row">
              <div class="toggle-info"><span class="tl">Table Ordering</span><span class="td">Allow customers to order via QR code at the table</span></div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="settings()!.enableTableOrdering" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-row">
              <div class="toggle-info"><span class="tl">Takeaway Orders</span><span class="td">Accept takeaway / counter orders</span></div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="settings()!.enableTakeaway" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-row">
              <div class="toggle-info"><span class="tl">Delivery Orders</span><span class="td">Accept delivery orders to customer address</span></div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="settings()!.enableDelivery" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-row">
              <div class="toggle-info"><span class="tl">Auto-Confirm Orders</span><span class="td">Automatically confirm new orders without manual approval</span></div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="settings()!.autoConfirmOrders" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="save-row">
          <button class="btn-outline" (click)="load()"><i class="pi pi-refresh"></i> Reset</button>
          <button class="btn-primary" (click)="save()" [disabled]="saving()">
            @if (saving()) { <i class="pi pi-spin pi-spinner"></i> }
            Save Changes
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); } p { font-size: 0.875rem; color: var(--text-secondary); } }
    .settings-layout { display: flex; flex-direction: column; gap: 1.25rem; max-width: 720px; }
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; }
    .card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; i { font-size: 1rem; color: var(--geidea-green); } h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; } }
    .field.col-2 { grid-column: span 2; }
    input, select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; background: var(--card-bg); color: var(--text-primary); &:focus { outline: none; border-color: var(--geidea-green); } }
    .toggles { display: flex; flex-direction: column; gap: 0; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color); &:last-child { border-bottom: none; } }
    .toggle-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .tl { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .td { font-size: 0.775rem; color: var(--text-secondary); }
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0;
      input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; inset: 0; background: var(--border-color); border-radius: 24px; cursor: pointer; transition: 0.2s;
        &:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: 0.2s; }
      }
      input:checked + .slider { background: var(--geidea-green); }
      input:checked + .slider:before { transform: translateX(20px); }
    }
    .save-row { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.5rem; background: var(--geidea-green); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; &:disabled { opacity: 0.6; } }
    .btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
  `]
})
export class SettingsComponent implements OnInit {
  settings = signal<MerchantSettings | null>(null);
  saving = signal(false);
  subdomain = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.load();
  }

  load(): void {
    this.api.getSettings(this.subdomain).subscribe(r => { if (r.success) this.settings.set(r.data); });
  }

  save(): void {
    const s = this.settings();
    if (!s) return;
    this.saving.set(true);
    this.api.updateSettings(this.subdomain, s).subscribe(() => {
      this.saving.set(false);
      alert('Settings saved successfully!');
    });
  }
}
