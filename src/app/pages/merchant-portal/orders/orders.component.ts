import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Order } from '../../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Orders</h1><p>Track and manage all incoming orders</p></div>
      <div class="header-actions">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option>
          <option value="Served">Served</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div class="orders-list">
      @for (order of orders(); track order.id) {
        <div class="order-card" [class]="'status-' + order.status.toLowerCase()">
          <div class="order-top">
            <div class="order-id">
              <span class="oid">#{{ order.id }}</span>
              <span class="store-table">{{ order.storeName }} · Table {{ order.tableNumber }}</span>
            </div>
            <div class="order-right">
              <span class="badge" [class]="order.status.toLowerCase()">{{ order.status }}</span>
              <span class="order-time">{{ order.createdAt | date:'HH:mm' }}</span>
            </div>
          </div>
          <div class="order-items">
            @for (item of order.items; track item.id) {
              <div class="oi-row">
                <span class="oi-qty">x{{ item.quantity }}</span>
                <span class="oi-name">{{ item.name }}</span>
                <span class="oi-price">{{ order.currency }} {{ item.total | number:'1.2-2' }}</span>
              </div>
            }
          </div>
          <div class="order-footer">
            <div class="totals">
              <span>Subtotal: {{ order.currency }} {{ order.subtotal | number:'1.2-2' }}</span>
              <span>VAT: {{ order.currency }} {{ order.tax | number:'1.2-2' }}</span>
              <strong>Total: {{ order.currency }} {{ order.total | number:'1.2-2' }}</strong>
            </div>
            <div class="status-actions">
              @if (order.status === 'Pending') {
                <button class="btn-sm btn-primary" (click)="updateStatus(order, 'Confirmed')">Confirm</button>
              }
              @if (order.status === 'Confirmed') {
                <button class="btn-sm btn-primary" (click)="updateStatus(order, 'Preparing')">Start Prep</button>
              }
              @if (order.status === 'Preparing') {
                <button class="btn-sm btn-primary" (click)="updateStatus(order, 'Ready')">Mark Ready</button>
              }
              @if (order.status === 'Ready') {
                <button class="btn-sm btn-primary" (click)="updateStatus(order, 'Served')">Mark Served</button>
              }
              @if (order.status !== 'Served' && order.status !== 'Cancelled') {
                <button class="btn-sm btn-danger" (click)="updateStatus(order, 'Cancelled')">Cancel</button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
      p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem; }
    }
    select { padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); color: var(--text-primary); font-size: 0.875rem; }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; border-left: 4px solid transparent; }
    .order-card.status-pending { border-left-color: #f59e0b; }
    .order-card.status-confirmed { border-left-color: #3b82f6; }
    .order-card.status-preparing { border-left-color: #8b5cf6; }
    .order-card.status-ready { border-left-color: #06b6d4; }
    .order-card.status-served { border-left-color: #16a34a; }
    .order-card.status-cancelled { border-left-color: #dc2626; opacity: 0.7; }
    .order-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .oid { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .store-table { display: block; font-size: 0.775rem; color: var(--text-secondary); margin-top: 0.1rem; }
    .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
    .badge.pending { background: #fef9c3; color: #b45309; }
    .badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .badge.preparing { background: #ede9fe; color: #6d28d9; }
    .badge.ready { background: #cffafe; color: #0e7490; }
    .badge.served { background: #dcfce7; color: #16a34a; }
    .badge.cancelled { background: #fee2e2; color: #dc2626; }
    .order-time { font-size: 0.75rem; color: var(--text-secondary); }
    .order-items { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.75rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem; }
    .oi-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; }
    .oi-qty { background: rgba(59,181,74,0.1); color: var(--geidea-green); padding: 1px 7px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .oi-name { flex: 1; color: var(--text-primary); }
    .oi-price { font-weight: 600; color: var(--text-primary); }
    .order-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
    .totals { display: flex; gap: 1.5rem; font-size: 0.8rem; color: var(--text-secondary); strong { color: var(--text-primary); font-weight: 700; font-size: 0.9rem; } }
    .status-actions { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.775rem; font-weight: 600; cursor: pointer; border: none; }
    .btn-primary { background: var(--geidea-green); color: white; }
    .btn-danger { background: #ef4444; color: white; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  statusFilter = '';
  subdomain = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.load();
  }

  load(): void {
    this.api.getOrders(this.subdomain, this.statusFilter).subscribe(r => { if (r.success) this.orders.set(r.data); });
  }

  updateStatus(order: Order, status: Order['status']): void {
    this.api.updateOrderStatus(this.subdomain, order.id, status).subscribe(() => this.load());
  }
}
