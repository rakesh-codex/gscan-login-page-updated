import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <p>Manage portal users and their permissions</p>
      </div>
      <button pButton label="Add User" icon="pi pi-plus" class="p-button-success" (click)="openCreate()"></button>
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input type="text" pInputText placeholder="Search users..." [(ngModel)]="searchTerm" />
      </div>
    </div>

    <div class="card-container">
      <p-table [value]="filteredUsers()" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users">
        <ng-template #header>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th style="width:120px">Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-u>
          <tr>
            <td>
              <div class="user-name">
                <div class="user-avatar" [style.background]="getAvatarColor(u.name)">{{ u.name.charAt(0) }}</div>
                <span class="name-text">{{ u.name }}</span>
              </div>
            </td>
            <td>{{ u.email }}</td>
            <td><span class="role-badge">{{ u.role }}</span></td>
            <td><p-tag [value]="u.status" [severity]="u.status === 'Active' ? 'success' : 'danger'" /></td>
            <td class="date-text">{{ u.lastLogin }}</td>
            <td>
              <div class="action-btns">
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="openEdit(u)"></button>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteUser(u)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogVisible" [header]="editingUser ? 'Edit User' : 'Add User'" [modal]="true" [style]="{width: '480px'}" [draggable]="false">
      <div class="dialog-form">
        <div class="field">
          <label>Full Name</label>
          <input pInputText [(ngModel)]="form.name" placeholder="Enter full name" class="w-full" />
        </div>
        <div class="field">
          <label>Email</label>
          <input pInputText [(ngModel)]="form.email" placeholder="Enter email" class="w-full" />
        </div>
        <div class="field">
          <label>Role</label>
          <p-select [(ngModel)]="form.role" [options]="roleOptions" placeholder="Select role" class="w-full" />
        </div>
        <div class="field">
          <label>Status</label>
          <p-select [(ngModel)]="form.status" [options]="statusOptions" placeholder="Select status" class="w-full" />
        </div>
      </div>
      <ng-template #footer>
        <button pButton label="Cancel" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton [label]="editingUser ? 'Update' : 'Create'" class="p-button-success" (click)="saveUser()"></button>
      </ng-template>
    </p-dialog>

    <p-confirmDialog />
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
      p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; }
    }
    .table-toolbar { margin-bottom: 1rem; }
    .search-box {
      position: relative; max-width: 320px;
      i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
      input { width: 100%; padding-left: 2.5rem; }
    }
    .card-container {
      background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;
    }
    .user-name { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;
    }
    .name-text { font-weight: 600; font-size: 0.875rem; }
    .role-badge {
      background: color-mix(in srgb, var(--geidea-green) 12%, var(--card-bg));
      color: var(--geidea-green); padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
    }
    .date-text { font-size: 0.8rem; color: var(--text-secondary); }
    .action-btns { display: flex; gap: 0.25rem; }
    .dialog-form { display: flex; flex-direction: column; gap: 1rem; }
    .field {
      display: flex; flex-direction: column; gap: 0.35rem;
      label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
    }
    .w-full { width: 100%; }
  `]
})
export class UsersComponent {
  searchTerm = '';
  dialogVisible = false;
  editingUser: User | null = null;

  form = { name: '', email: '', role: 'Viewer', status: 'Active' };
  roleOptions = ['Super Admin', 'Admin', 'Manager', 'Viewer'];
  statusOptions = ['Active', 'Inactive'];

  users = signal<User[]>([
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@geidea.net', role: 'Super Admin', status: 'Active', lastLogin: '2025-06-15 09:32' },
    { id: 2, name: 'Sara Mohammed', email: 'sara@geidea.net', role: 'Admin', status: 'Active', lastLogin: '2025-06-15 08:15' },
    { id: 3, name: 'Omar Hassan', email: 'omar@geidea.net', role: 'Manager', status: 'Active', lastLogin: '2025-06-14 17:45' },
    { id: 4, name: 'Fatima Al-Zahrani', email: 'fatima@geidea.net', role: 'Viewer', status: 'Active', lastLogin: '2025-06-14 14:20' },
    { id: 5, name: 'Khalid Ibrahim', email: 'khalid@geidea.net', role: 'Manager', status: 'Inactive', lastLogin: '2025-05-28 11:00' },
    { id: 6, name: 'Nora Al-Saud', email: 'nora@geidea.net', role: 'Admin', status: 'Active', lastLogin: '2025-06-15 10:05' }
  ]);

  filteredUsers = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term)
    );
  });

  getAvatarColor(name: string): string {
    const colors = ['#3bb54a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    let hash = 0;
    for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  openCreate(): void {
    this.editingUser = null;
    this.form = { name: '', email: '', role: 'Viewer', status: 'Active' };
    this.dialogVisible = true;
  }

  openEdit(u: User): void {
    this.editingUser = u;
    this.form = { name: u.name, email: u.email, role: u.role, status: u.status };
    this.dialogVisible = true;
  }

  saveUser(): void {
    if (!this.form.name || !this.form.email) return;
    if (this.editingUser) {
      this.users.update(list => list.map(u =>
        u.id === this.editingUser!.id
          ? { ...u, name: this.form.name, email: this.form.email, role: this.form.role, status: this.form.status as User['status'] }
          : u
      ));
    } else {
      const newId = Math.max(...this.users().map(u => u.id)) + 1;
      this.users.update(list => [...list, {
        id: newId, name: this.form.name, email: this.form.email, role: this.form.role,
        status: this.form.status as User['status'], lastLogin: 'Never'
      }]);
    }
    this.dialogVisible = false;
  }

  deleteUser(u: User): void {
    if (confirm(`Are you sure you want to delete ${u.name}?`)) {
      this.users.update(list => list.filter(x => x.id !== u.id));
    }
  }
}
