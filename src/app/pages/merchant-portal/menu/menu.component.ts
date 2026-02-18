import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MenuItem, MenuCategory } from '../../../models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h1>Menu Management</h1><p>Manage categories and menu items</p></div>
      <div class="header-actions">
        <button class="btn-outline" (click)="openCatDialog()"><i class="pi pi-folder-plus"></i> Add Category</button>
        <button class="btn-primary" (click)="openItemDialog()"><i class="pi pi-plus"></i> Add Item</button>
      </div>
    </div>

    <div class="menu-layout">
      <!-- Categories sidebar -->
      <div class="categories-panel">
        <h3>Categories</h3>
        <div class="cat-list">
          <button class="cat-item" [class.active]="selectedCat() === 0" (click)="selectCat(0)">
            <span>All Items</span><span class="cnt">{{ items().length }}</span>
          </button>
          @for (cat of categories(); track cat.id) {
            <button class="cat-item" [class.active]="selectedCat() === cat.id" (click)="selectCat(cat.id)">
              <span>{{ cat.name }}</span><span class="cnt">{{ cat.itemCount }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Items grid -->
      <div class="items-panel">
        <div class="items-grid">
          @for (item of filteredItems(); track item.id) {
            <div class="item-card">
              <div class="item-top">
                <div class="item-icon">{{ item.name.charAt(0) }}</div>
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.categoryName }}</p>
                </div>
                <span class="badge" [class.avail]="item.status === 'Available'" [class.unavail]="item.status !== 'Available'">{{ item.status }}</span>
              </div>
              <p class="desc">{{ item.description }}</p>
              <div class="item-meta">
                <span class="price">{{ item.currency }} {{ item.price | number:'1.2-2' }}</span>
                <span class="prep"><i class="pi pi-clock"></i> {{ item.preparationTime }} min</span>
              </div>
              @if (item.tags.length) {
                <div class="tags">@for (t of item.tags; track t) { <span class="tag">{{ t }}</span> }</div>
              }
              <div class="item-actions">
                <button class="btn-outline btn-sm" (click)="openItemDialog(item)"><i class="pi pi-pencil"></i> Edit</button>
                <button class="btn-danger btn-sm" (click)="deleteItem(item.id)"><i class="pi pi-trash"></i></button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Category Dialog -->
    @if (showCatDialog()) {
      <div class="overlay" (click)="showCatDialog.set(false)">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>Add Category</h2><button class="close-btn" (click)="showCatDialog.set(false)"><i class="pi pi-times"></i></button></div>
          <div class="dialog-body">
            <div class="field"><label>Category Name</label><input type="text" [(ngModel)]="catForm.name" placeholder="e.g., Main Course" /></div>
            <div class="field" style="margin-top:1rem"><label>Description</label><input type="text" [(ngModel)]="catForm.description" placeholder="Brief description" /></div>
          </div>
          <div class="dialog-footer">
            <button class="btn-outline" (click)="showCatDialog.set(false)">Cancel</button>
            <button class="btn-primary" (click)="saveCategory()">Create</button>
          </div>
        </div>
      </div>
    }

    <!-- Item Dialog -->
    @if (showItemDialog()) {
      <div class="overlay" (click)="showItemDialog.set(false)">
        <div class="dialog dialog-lg" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>{{ editingItem() ? 'Edit Item' : 'Add Menu Item' }}</h2><button class="close-btn" (click)="showItemDialog.set(false)"><i class="pi pi-times"></i></button></div>
          <div class="dialog-body">
            <div class="form-grid">
              <div class="field col-2"><label>Item Name</label><input type="text" [(ngModel)]="itemForm.name" placeholder="e.g., Mixed Grill" /></div>
              <div class="field"><label>Category</label>
                <select [(ngModel)]="itemForm.categoryId">
                  @for (c of categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
                </select>
              </div>
              <div class="field"><label>Price (SAR)</label><input type="number" [(ngModel)]="itemForm.price" placeholder="0.00" /></div>
              <div class="field"><label>Prep Time (min)</label><input type="number" [(ngModel)]="itemForm.preparationTime" /></div>
              <div class="field"><label>Status</label>
                <select [(ngModel)]="itemForm.status"><option value="Available">Available</option><option value="Unavailable">Unavailable</option></select>
              </div>
              <div class="field col-2"><label>Description</label><input type="text" [(ngModel)]="itemForm.description" placeholder="Brief description" /></div>
              <div class="field col-2"><label>Tags (comma separated)</label><input type="text" [(ngModel)]="tagsInput" placeholder="Vegan, GF, Popular" /></div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-outline" (click)="showItemDialog.set(false)">Cancel</button>
            <button class="btn-primary" (click)="saveItem()">{{ editingItem() ? 'Update' : 'Create' }}</button>
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
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: var(--geidea-green); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-outline { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.8rem; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.8rem; cursor: pointer; &:hover { border-color: var(--geidea-green); } }
    .btn-danger { padding: 0.4rem 0.6rem; background: transparent; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.8rem; cursor: pointer; }
    .btn-sm { padding: 0.35rem 0.6rem !important; font-size: 0.775rem !important; }
    .menu-layout { display: grid; grid-template-columns: 220px 1fr; gap: 1.25rem; }
    .categories-panel { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; h3 { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.75rem; } }
    .cat-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .cat-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); width: 100%; text-align: left; &:hover { background: var(--border-color); } &.active { background: rgba(59,181,74,0.1); color: var(--geidea-green); font-weight: 600; } }
    .cnt { background: var(--border-color); padding: 1px 7px; border-radius: 10px; font-size: 0.7rem; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .item-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .item-top { display: flex; align-items: center; gap: 0.6rem; }
    .item-icon { width: 38px; height: 38px; min-width: 38px; background: rgba(59,181,74,0.1); color: var(--geidea-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .item-info { flex: 1; h4 { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); } p { font-size: 0.7rem; color: var(--text-secondary); } }
    .badge { padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.65rem; font-weight: 600; white-space: nowrap; }
    .badge.avail { background: #dcfce7; color: #16a34a; }
    .badge.unavail { background: #fee2e2; color: #dc2626; }
    .desc { font-size: 0.775rem; color: var(--text-secondary); line-height: 1.4; }
    .item-meta { display: flex; align-items: center; justify-content: space-between; }
    .price { font-size: 1rem; font-weight: 700; color: var(--geidea-green); }
    .prep { font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem; i { font-size: 0.7rem; } }
    .tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .tag { background: rgba(59,181,74,0.1); color: var(--geidea-green); padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 600; }
    .item-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
    .dialog { background: var(--card-bg); border-radius: 14px; width: 100%; max-width: 420px; }
    .dialog-lg { max-width: 560px; }
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
export class MenuComponent implements OnInit {
  categories = signal<MenuCategory[]>([]);
  items = signal<MenuItem[]>([]);
  filteredItems = signal<MenuItem[]>([]);
  selectedCat = signal(0);
  showCatDialog = signal(false);
  showItemDialog = signal(false);
  editingItem = signal<MenuItem | null>(null);
  subdomain = '';
  catForm: Partial<MenuCategory> = {};
  itemForm: Partial<MenuItem> = {};
  tagsInput = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.subdomain = this.route.parent?.snapshot.paramMap.get('subdomain') ?? '';
    this.api.getMenuCategories(this.subdomain).subscribe(r => { if (r.success) this.categories.set(r.data); });
    this.api.getMenuItems(this.subdomain).subscribe(r => { if (r.success) { this.items.set(r.data); this.filteredItems.set(r.data); } });
  }

  selectCat(id: number): void {
    this.selectedCat.set(id);
    this.filteredItems.set(id === 0 ? this.items() : this.items().filter(i => i.categoryId === id));
  }

  openCatDialog(): void { this.catForm = {}; this.showCatDialog.set(true); }
  openItemDialog(item?: MenuItem): void {
    this.editingItem.set(item ?? null);
    this.itemForm = item ? { ...item } : { status: 'Available', preparationTime: 10 };
    this.tagsInput = item?.tags.join(', ') ?? '';
    this.showItemDialog.set(true);
  }

  saveCategory(): void {
    if (!this.catForm.name) return;
    this.api.createMenuCategory(this.subdomain, this.catForm).subscribe(() => { this.ngOnInit(); this.showCatDialog.set(false); });
  }

  saveItem(): void {
    if (!this.itemForm.name) return;
    this.itemForm.tags = this.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const cat = this.categories().find(c => c.id === Number(this.itemForm.categoryId));
    this.itemForm.categoryName = cat?.name ?? '';
    const editing = this.editingItem();
    if (editing) {
      this.api.updateMenuItem(this.subdomain, editing.id, this.itemForm).subscribe(() => { this.ngOnInit(); this.showItemDialog.set(false); });
    } else {
      this.api.createMenuItem(this.subdomain, this.itemForm).subscribe(() => { this.ngOnInit(); this.showItemDialog.set(false); });
    }
  }

  deleteItem(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.api.deleteMenuItem(this.subdomain, id).subscribe(() => this.ngOnInit());
  }
}
