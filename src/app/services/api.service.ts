import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse, PagedResponse, Merchant, AdminUser, Settlement, AdminReport,
  Store, Table, MenuItem, MenuCategory, Order, MerchantReport, Payout,
  StaffMember, MerchantSettings, LoginRequest, LoginResponse, DashboardStats
} from '../models';

/**
 * API Service — wires to .NET 8 Web API backend.
 * BASE_URL points to the backend; toggle USE_MOCK to switch to mock data
 * during development (Redis-backed endpoints described in API_ENDPOINTS.md).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly BASE_URL = 'http://localhost:5000/api';
  private readonly USE_MOCK = true; // flip to false when .NET API is running

  constructor(private http: HttpClient) {}

  // ─── Helper ───────────────────────────────────────────────────────────────

  private mock<T>(data: T, ms = 350): Observable<ApiResponse<T>> {
    return of({ data, success: true, message: 'OK', cached: false, timestamp: new Date().toISOString() }).pipe(delay(ms));
  }

  private mockPaged<T>(data: T[], page = 1, pageSize = 10): Observable<PagedResponse<T>> {
    return of({ data, total: data.length, page, pageSize, success: true }).pipe(delay(350));
  }

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  /** POST /api/auth/admin/login */
  adminLogin(req: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    if (this.USE_MOCK) {
      if (req.username === 'geidea_admin' && req.password === 'Geidea@2025!') {
        return this.mock<LoginResponse>({
          token: 'mock-admin-jwt-token-' + Date.now(),
          role: 'admin',
          name: 'Geidea Admin',
          expiresAt: new Date(Date.now() + 8 * 3600000).toISOString()
        });
      }
      return of({ data: null as any, success: false, message: 'Invalid credentials' }).pipe(delay(400));
    }
    return this.http.post<ApiResponse<LoginResponse>>(`${this.BASE_URL}/auth/admin/login`, req);
  }

  /** POST /api/auth/merchant/login */
  merchantLogin(subdomain: string, req: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    if (this.USE_MOCK) {
      const merchants: Record<string, { user: string; pass: string; name: string }> = {
        'al-rajhi-markets': { user: 'alrajhi_admin', pass: 'AlRajhi@2025!', name: 'Al Rajhi Markets' },
        'kudu-restaurant': { user: 'kudu_admin', pass: 'Kudu@2025!', name: 'Kudu Restaurant' },
        'mash': { user: 'mash_admin', pass: 'Mash@2025!', name: 'Mash Restaurant' },
      };
      const m = merchants[subdomain];
      if (m && req.username === m.user && req.password === m.pass) {
        return this.mock<LoginResponse>({
          token: `mock-merchant-jwt-${subdomain}-` + Date.now(),
          role: 'merchant',
          name: m.name,
          merchantSubdomain: subdomain,
          expiresAt: new Date(Date.now() + 8 * 3600000).toISOString()
        });
      }
      return of({ data: null as any, success: false, message: 'Invalid credentials' }).pipe(delay(400));
    }
    return this.http.post<ApiResponse<LoginResponse>>(`${this.BASE_URL}/auth/merchant/${subdomain}/login`, req);
  }

  /** POST /api/auth/logout */
  logout(): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) return this.mock<void>(undefined as any, 100);
    return this.http.post<ApiResponse<void>>(`${this.BASE_URL}/auth/logout`, {});
  }

  // ─── ADMIN: MERCHANTS ─────────────────────────────────────────────────────

  private readonly MOCK_MERCHANTS: Merchant[] = [
    { id: 1, name: 'Al Rajhi Markets', mid: 'MID-001234', status: 'Active', type: 'Retail', transactions: 15234, volume: 'SAR 1.2M', subdomain: 'al-rajhi-markets', email: 'admin@alrajhi.com', phone: '+966501234567', createdAt: '2024-01-10' },
    { id: 2, name: 'Jarir Bookstore', mid: 'MID-001235', status: 'Active', type: 'Retail', transactions: 8921, volume: 'SAR 890K', subdomain: 'jarir-bookstore', email: 'admin@jarir.com', phone: '+966502345678', createdAt: '2024-01-15' },
    { id: 3, name: 'Kudu Restaurant', mid: 'MID-001236', status: 'Active', type: 'F&B', transactions: 12456, volume: 'SAR 650K', subdomain: 'kudu-restaurant', email: 'admin@kudu.com', phone: '+966503456789', createdAt: '2024-02-01' },
    { id: 4, name: 'Nahdi Pharmacy', mid: 'MID-001237', status: 'Pending', type: 'Healthcare', transactions: 0, volume: 'SAR 0', subdomain: 'nahdi-pharmacy', email: 'admin@nahdi.com', phone: '+966504567890', createdAt: '2024-03-05' },
    { id: 5, name: 'Extra Electronics', mid: 'MID-001238', status: 'Active', type: 'Retail', transactions: 6543, volume: 'SAR 1.8M', subdomain: 'extra-electronics', email: 'admin@extra.com', phone: '+966505678901', createdAt: '2024-03-12' },
    { id: 6, name: 'Tamimi Markets', mid: 'MID-001239', status: 'Inactive', type: 'Retail', transactions: 3210, volume: 'SAR 420K', subdomain: 'tamimi-markets', email: 'admin@tamimi.com', phone: '+966506789012', createdAt: '2024-04-01' },
    { id: 7, name: 'Whites Restaurant', mid: 'MID-001240', status: 'Active', type: 'F&B', transactions: 4567, volume: 'SAR 310K', subdomain: 'whites-restaurant', email: 'admin@whites.com', phone: '+966507890123', createdAt: '2024-04-15' },
    { id: 8, name: 'Panda Hypermarket', mid: 'MID-001241', status: 'Active', type: 'Retail', transactions: 19876, volume: 'SAR 2.1M', subdomain: 'panda-hypermarket', email: 'admin@panda.com', phone: '+966508901234', createdAt: '2024-05-01' },
    { id: 9, name: 'Mash Restaurant', mid: 'MID-001242', status: 'Active', type: 'F&B', transactions: 3100, volume: 'SAR 180K', subdomain: 'mash', email: 'admin@mash.com', phone: '+966509012345', createdAt: '2024-06-01' },
  ];

  /** GET /api/admin/merchants?page=1&pageSize=10&search=&status= */
  getMerchants(page = 1, pageSize = 10, search = '', status = ''): Observable<PagedResponse<Merchant>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_MERCHANTS];
      if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.mid.toLowerCase().includes(search.toLowerCase()));
      if (status) list = list.filter(m => m.status === status);
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search).set('status', status);
    return this.http.get<PagedResponse<Merchant>>(`${this.BASE_URL}/admin/merchants`, { params });
  }

  /** GET /api/admin/merchants/:id */
  getMerchantById(id: number): Observable<ApiResponse<Merchant>> {
    if (this.USE_MOCK) {
      const m = this.MOCK_MERCHANTS.find(x => x.id === id);
      return this.mock(m ?? this.MOCK_MERCHANTS[0]);
    }
    return this.http.get<ApiResponse<Merchant>>(`${this.BASE_URL}/admin/merchants/${id}`);
  }

  /** POST /api/admin/merchants */
  createMerchant(payload: Partial<Merchant>): Observable<ApiResponse<Merchant>> {
    if (this.USE_MOCK) {
      const newM: Merchant = { ...payload, id: Date.now(), transactions: 0, volume: 'SAR 0', createdAt: new Date().toISOString().slice(0, 10) } as Merchant;
      this.MOCK_MERCHANTS.push(newM);
      return this.mock(newM);
    }
    return this.http.post<ApiResponse<Merchant>>(`${this.BASE_URL}/admin/merchants`, payload);
  }

  /** PUT /api/admin/merchants/:id */
  updateMerchant(id: number, payload: Partial<Merchant>): Observable<ApiResponse<Merchant>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_MERCHANTS.findIndex(m => m.id === id);
      if (idx > -1) this.MOCK_MERCHANTS[idx] = { ...this.MOCK_MERCHANTS[idx], ...payload };
      return this.mock(this.MOCK_MERCHANTS[idx] ?? this.MOCK_MERCHANTS[0]);
    }
    return this.http.put<ApiResponse<Merchant>>(`${this.BASE_URL}/admin/merchants/${id}`, payload);
  }

  /** DELETE /api/admin/merchants/:id */
  deleteMerchant(id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_MERCHANTS.findIndex(m => m.id === id);
      if (idx > -1) this.MOCK_MERCHANTS.splice(idx, 1);
      return this.mock<void>(undefined as any, 200);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/admin/merchants/${id}`);
  }

  // ─── ADMIN: USERS ─────────────────────────────────────────────────────────

  private readonly MOCK_USERS: AdminUser[] = [
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@geidea.net', role: 'Super Admin', status: 'Active', lastLogin: '2025-06-15 09:32' },
    { id: 2, name: 'Sara Mohammed', email: 'sara@geidea.net', role: 'Admin', status: 'Active', lastLogin: '2025-06-15 08:15' },
    { id: 3, name: 'Omar Hassan', email: 'omar@geidea.net', role: 'Manager', status: 'Active', lastLogin: '2025-06-14 17:45' },
    { id: 4, name: 'Fatima Al-Zahrani', email: 'fatima@geidea.net', role: 'Viewer', status: 'Active', lastLogin: '2025-06-14 14:20' },
    { id: 5, name: 'Khalid Ibrahim', email: 'khalid@geidea.net', role: 'Manager', status: 'Inactive', lastLogin: '2025-05-28 11:00' },
    { id: 6, name: 'Nora Al-Saud', email: 'nora@geidea.net', role: 'Admin', status: 'Active', lastLogin: '2025-06-15 10:05' },
  ];

  /** GET /api/admin/users?page=1&pageSize=10&search= */
  getAdminUsers(page = 1, pageSize = 10, search = ''): Observable<PagedResponse<AdminUser>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_USERS];
      if (search) list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search);
    return this.http.get<PagedResponse<AdminUser>>(`${this.BASE_URL}/admin/users`, { params });
  }

  /** POST /api/admin/users */
  createAdminUser(payload: Partial<AdminUser>): Observable<ApiResponse<AdminUser>> {
    if (this.USE_MOCK) {
      const u: AdminUser = { ...payload, id: Date.now(), lastLogin: 'Never' } as AdminUser;
      this.MOCK_USERS.push(u);
      return this.mock(u);
    }
    return this.http.post<ApiResponse<AdminUser>>(`${this.BASE_URL}/admin/users`, payload);
  }

  /** PUT /api/admin/users/:id */
  updateAdminUser(id: number, payload: Partial<AdminUser>): Observable<ApiResponse<AdminUser>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_USERS.findIndex(u => u.id === id);
      if (idx > -1) this.MOCK_USERS[idx] = { ...this.MOCK_USERS[idx], ...payload };
      return this.mock(this.MOCK_USERS[idx]);
    }
    return this.http.put<ApiResponse<AdminUser>>(`${this.BASE_URL}/admin/users/${id}`, payload);
  }

  /** DELETE /api/admin/users/:id */
  deleteAdminUser(id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_USERS.findIndex(u => u.id === id);
      if (idx > -1) this.MOCK_USERS.splice(idx, 1);
      return this.mock<void>(undefined as any, 200);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/admin/users/${id}`);
  }

  // ─── ADMIN: SETTLEMENTS ───────────────────────────────────────────────────

  private readonly MOCK_SETTLEMENTS: Settlement[] = [
    { id: 1, merchant: 'Al Rajhi Markets', mid: 'MID-001234', amount: 'SAR 125,400', fee: 'SAR 2,508', net: 'SAR 122,892', status: 'Completed', date: '2025-06-15', reference: 'STL-20250615-001' },
    { id: 2, merchant: 'Jarir Bookstore', mid: 'MID-001235', amount: 'SAR 89,200', fee: 'SAR 1,784', net: 'SAR 87,416', status: 'Completed', date: '2025-06-15', reference: 'STL-20250615-002' },
    { id: 3, merchant: 'Kudu Restaurant', mid: 'MID-001236', amount: 'SAR 45,600', fee: 'SAR 912', net: 'SAR 44,688', status: 'Pending', date: '2025-06-15', reference: 'STL-20250615-003' },
    { id: 4, merchant: 'Nahdi Pharmacy', mid: 'MID-001237', amount: 'SAR 67,800', fee: 'SAR 1,356', net: 'SAR 66,444', status: 'Completed', date: '2025-06-14', reference: 'STL-20250614-001' },
    { id: 5, merchant: 'Extra Electronics', mid: 'MID-001238', amount: 'SAR 234,500', fee: 'SAR 4,690', net: 'SAR 229,810', status: 'Completed', date: '2025-06-14', reference: 'STL-20250614-002' },
    { id: 6, merchant: 'Tamimi Markets', mid: 'MID-001239', amount: 'SAR 12,300', fee: 'SAR 246', net: 'SAR 12,054', status: 'Failed', date: '2025-06-14', reference: 'STL-20250614-003' },
    { id: 7, merchant: 'Whites Restaurant', mid: 'MID-001240', amount: 'SAR 28,900', fee: 'SAR 578', net: 'SAR 28,322', status: 'Pending', date: '2025-06-13', reference: 'STL-20250613-001' },
    { id: 8, merchant: 'Panda Hypermarket', mid: 'MID-001241', amount: 'SAR 189,700', fee: 'SAR 3,794', net: 'SAR 185,906', status: 'Completed', date: '2025-06-13', reference: 'STL-20250613-002' },
  ];

  /** GET /api/admin/settlements?page=1&pageSize=10&search=&status= */
  getSettlements(page = 1, pageSize = 10, search = '', status = ''): Observable<PagedResponse<Settlement>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_SETTLEMENTS];
      if (search) list = list.filter(s => s.merchant.toLowerCase().includes(search.toLowerCase()) || s.reference.toLowerCase().includes(search.toLowerCase()));
      if (status) list = list.filter(s => s.status === status);
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search).set('status', status);
    return this.http.get<PagedResponse<Settlement>>(`${this.BASE_URL}/admin/settlements`, { params });
  }

  // ─── ADMIN: REPORTS ───────────────────────────────────────────────────────

  private readonly MOCK_ADMIN_REPORTS: AdminReport[] = [
    { id: 1, name: 'Monthly Transaction Summary - June', type: 'Transaction', generatedBy: 'Ahmed Al-Rashid', date: '2025-06-15', status: 'Ready', size: '3.2 MB' },
    { id: 2, name: 'Settlement Reconciliation Q2', type: 'Settlement', generatedBy: 'Sara Mohammed', date: '2025-06-14', status: 'Ready', size: '5.1 MB' },
    { id: 3, name: 'Merchant Onboarding Report', type: 'Merchant', generatedBy: 'Omar Hassan', date: '2025-06-14', status: 'Processing', size: '-' },
    { id: 4, name: 'PCI Compliance Audit', type: 'Compliance', generatedBy: 'Fatima Al-Zahrani', date: '2025-06-13', status: 'Ready', size: '1.8 MB' },
    { id: 5, name: 'Daily Transaction Log - Jun 12', type: 'Transaction', generatedBy: 'System', date: '2025-06-12', status: 'Ready', size: '890 KB' },
    { id: 6, name: 'Failed Transactions Report', type: 'Transaction', generatedBy: 'Nora Al-Saud', date: '2025-06-12', status: 'Failed', size: '-' },
    { id: 7, name: 'Merchant Fee Analysis', type: 'Settlement', generatedBy: 'Ahmed Al-Rashid', date: '2025-06-11', status: 'Ready', size: '2.3 MB' },
    { id: 8, name: 'KYC Verification Status', type: 'Compliance', generatedBy: 'Sara Mohammed', date: '2025-06-10', status: 'Ready', size: '4.5 MB' },
  ];

  /** GET /api/admin/reports?page=1&pageSize=10&search=&type= */
  getAdminReports(page = 1, pageSize = 10, search = '', type = ''): Observable<PagedResponse<AdminReport>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_ADMIN_REPORTS];
      if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
      if (type) list = list.filter(r => r.type === type);
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search).set('type', type);
    return this.http.get<PagedResponse<AdminReport>>(`${this.BASE_URL}/admin/reports`, { params });
  }

  // ─── MERCHANT PORTAL: DASHBOARD ───────────────────────────────────────────

  /** GET /api/merchant/:subdomain/dashboard/stats */
  getMerchantDashboardStats(subdomain: string): Observable<ApiResponse<DashboardStats>> {
    if (this.USE_MOCK) {
      return this.mock<DashboardStats>({
        totalOrders: 1247,
        todayRevenue: 18450,
        activeStores: 3,
        activeTables: 24,
        pendingOrders: 8,
        currency: 'SAR',
        revenueChange: 12.5,
        ordersChange: 8.3
      });
    }
    return this.http.get<ApiResponse<DashboardStats>>(`${this.BASE_URL}/merchant/${subdomain}/dashboard/stats`);
  }

  // ─── MERCHANT PORTAL: STORES ──────────────────────────────────────────────

  private readonly MOCK_STORES: Store[] = [
    { id: 1, name: 'Main Branch', address: 'King Fahd Road, Olaya', city: 'Riyadh', phone: '+966501111111', status: 'Open', tablesCount: 12, managerId: 1, managerName: 'Khalid Hassan' },
    { id: 2, name: 'Mall of Arabia Outlet', address: 'Mall of Arabia, Jeddah', city: 'Jeddah', phone: '+966502222222', status: 'Open', tablesCount: 8, managerId: 2, managerName: 'Sara Nasser' },
    { id: 3, name: 'Riyadh Park Branch', address: 'Riyadh Park Mall', city: 'Riyadh', phone: '+966503333333', status: 'Closed', tablesCount: 6, managerId: 3, managerName: 'Omar Khalid' },
  ];

  /** GET /api/merchant/:subdomain/stores */
  getStores(subdomain: string): Observable<ApiResponse<Store[]>> {
    if (this.USE_MOCK) return this.mock([...this.MOCK_STORES]);
    return this.http.get<ApiResponse<Store[]>>(`${this.BASE_URL}/merchant/${subdomain}/stores`);
  }

  /** POST /api/merchant/:subdomain/stores */
  createStore(subdomain: string, payload: Partial<Store>): Observable<ApiResponse<Store>> {
    if (this.USE_MOCK) {
      const s: Store = { ...payload, id: Date.now(), tablesCount: 0 } as Store;
      this.MOCK_STORES.push(s);
      return this.mock(s);
    }
    return this.http.post<ApiResponse<Store>>(`${this.BASE_URL}/merchant/${subdomain}/stores`, payload);
  }

  /** PUT /api/merchant/:subdomain/stores/:id */
  updateStore(subdomain: string, id: number, payload: Partial<Store>): Observable<ApiResponse<Store>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_STORES.findIndex(s => s.id === id);
      if (idx > -1) this.MOCK_STORES[idx] = { ...this.MOCK_STORES[idx], ...payload };
      return this.mock(this.MOCK_STORES[idx]);
    }
    return this.http.put<ApiResponse<Store>>(`${this.BASE_URL}/merchant/${subdomain}/stores/${id}`, payload);
  }

  /** DELETE /api/merchant/:subdomain/stores/:id */
  deleteStore(subdomain: string, id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_STORES.findIndex(s => s.id === id);
      if (idx > -1) this.MOCK_STORES.splice(idx, 1);
      return this.mock<void>(undefined as any);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/merchant/${subdomain}/stores/${id}`);
  }

  // ─── MERCHANT PORTAL: TABLES ──────────────────────────────────────────────

  private readonly MOCK_TABLES: Table[] = [
    { id: 1, storeId: 1, number: 'T-01', capacity: 4, status: 'Available', qrCode: 'QR-T01-001' },
    { id: 2, storeId: 1, number: 'T-02', capacity: 4, status: 'Occupied', qrCode: 'QR-T02-001', currentOrderId: 101 },
    { id: 3, storeId: 1, number: 'T-03', capacity: 6, status: 'Reserved', qrCode: 'QR-T03-001' },
    { id: 4, storeId: 1, number: 'T-04', capacity: 2, status: 'Available', qrCode: 'QR-T04-001' },
    { id: 5, storeId: 2, number: 'T-01', capacity: 4, status: 'Available', qrCode: 'QR-T05-001' },
    { id: 6, storeId: 2, number: 'T-02', capacity: 6, status: 'Occupied', qrCode: 'QR-T06-001', currentOrderId: 102 },
  ];

  /** GET /api/merchant/:subdomain/tables?storeId= */
  getTables(subdomain: string, storeId?: number): Observable<ApiResponse<Table[]>> {
    if (this.USE_MOCK) {
      const list = storeId ? this.MOCK_TABLES.filter(t => t.storeId === storeId) : [...this.MOCK_TABLES];
      return this.mock(list);
    }
    const params = storeId ? new HttpParams().set('storeId', storeId) : undefined;
    return this.http.get<ApiResponse<Table[]>>(`${this.BASE_URL}/merchant/${subdomain}/tables`, { params });
  }

  /** POST /api/merchant/:subdomain/tables */
  createTable(subdomain: string, payload: Partial<Table>): Observable<ApiResponse<Table>> {
    if (this.USE_MOCK) {
      const t: Table = { ...payload, id: Date.now(), qrCode: `QR-${Date.now()}` } as Table;
      this.MOCK_TABLES.push(t);
      return this.mock(t);
    }
    return this.http.post<ApiResponse<Table>>(`${this.BASE_URL}/merchant/${subdomain}/tables`, payload);
  }

  /** PUT /api/merchant/:subdomain/tables/:id */
  updateTable(subdomain: string, id: number, payload: Partial<Table>): Observable<ApiResponse<Table>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_TABLES.findIndex(t => t.id === id);
      if (idx > -1) this.MOCK_TABLES[idx] = { ...this.MOCK_TABLES[idx], ...payload };
      return this.mock(this.MOCK_TABLES[idx]);
    }
    return this.http.put<ApiResponse<Table>>(`${this.BASE_URL}/merchant/${subdomain}/tables/${id}`, payload);
  }

  /** DELETE /api/merchant/:subdomain/tables/:id */
  deleteTable(subdomain: string, id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_TABLES.findIndex(t => t.id === id);
      if (idx > -1) this.MOCK_TABLES.splice(idx, 1);
      return this.mock<void>(undefined as any);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/merchant/${subdomain}/tables/${id}`);
  }

  // ─── MERCHANT PORTAL: MENU ────────────────────────────────────────────────

  private readonly MOCK_CATEGORIES: MenuCategory[] = [
    { id: 1, name: 'Starters', description: 'Appetizers and soups', itemCount: 8, displayOrder: 1 },
    { id: 2, name: 'Main Course', description: 'Main dishes and grills', itemCount: 14, displayOrder: 2 },
    { id: 3, name: 'Desserts', description: 'Sweets and pastries', itemCount: 6, displayOrder: 3 },
    { id: 4, name: 'Beverages', description: 'Drinks and juices', itemCount: 12, displayOrder: 4 },
  ];

  private readonly MOCK_MENU_ITEMS: MenuItem[] = [
    { id: 1, categoryId: 1, categoryName: 'Starters', name: 'Hummus', description: 'Creamy chickpea dip', price: 18, currency: 'SAR', status: 'Available', preparationTime: 5, tags: ['Vegan', 'GF'] },
    { id: 2, categoryId: 1, categoryName: 'Starters', name: 'Fattoush', description: 'Fresh vegetable salad', price: 22, currency: 'SAR', status: 'Available', preparationTime: 7, tags: ['Vegan'] },
    { id: 3, categoryId: 2, categoryName: 'Main Course', name: 'Mixed Grill', description: 'Assorted grilled meats', price: 85, currency: 'SAR', status: 'Available', preparationTime: 20, tags: ['Chef Special'] },
    { id: 4, categoryId: 2, categoryName: 'Main Course', name: 'Mandi Rice', description: 'Slow-cooked spiced rice with lamb', price: 75, currency: 'SAR', status: 'Available', preparationTime: 25, tags: ['Popular'] },
    { id: 5, categoryId: 3, categoryName: 'Desserts', name: 'Kunafa', description: 'Traditional cheese pastry', price: 28, currency: 'SAR', status: 'Available', preparationTime: 10, tags: ['Popular'] },
    { id: 6, categoryId: 4, categoryName: 'Beverages', name: 'Karak Tea', description: 'Spiced milk tea', price: 12, currency: 'SAR', status: 'Available', preparationTime: 3, tags: [] },
    { id: 7, categoryId: 4, categoryName: 'Beverages', name: 'Fresh Juice', description: 'Seasonal fresh juice', price: 16, currency: 'SAR', status: 'Available', preparationTime: 4, tags: ['Vegan'] },
    { id: 8, categoryId: 2, categoryName: 'Main Course', name: 'Grilled Chicken', description: 'Half grilled chicken with rice', price: 55, currency: 'SAR', status: 'Unavailable', preparationTime: 18, tags: [] },
  ];

  /** GET /api/merchant/:subdomain/menu/categories */
  getMenuCategories(subdomain: string): Observable<ApiResponse<MenuCategory[]>> {
    if (this.USE_MOCK) return this.mock([...this.MOCK_CATEGORIES]);
    return this.http.get<ApiResponse<MenuCategory[]>>(`${this.BASE_URL}/merchant/${subdomain}/menu/categories`);
  }

  /** POST /api/merchant/:subdomain/menu/categories */
  createMenuCategory(subdomain: string, payload: Partial<MenuCategory>): Observable<ApiResponse<MenuCategory>> {
    if (this.USE_MOCK) {
      const c: MenuCategory = { ...payload, id: Date.now(), itemCount: 0 } as MenuCategory;
      this.MOCK_CATEGORIES.push(c);
      return this.mock(c);
    }
    return this.http.post<ApiResponse<MenuCategory>>(`${this.BASE_URL}/merchant/${subdomain}/menu/categories`, payload);
  }

  /** GET /api/merchant/:subdomain/menu/items?categoryId= */
  getMenuItems(subdomain: string, categoryId?: number): Observable<ApiResponse<MenuItem[]>> {
    if (this.USE_MOCK) {
      const list = categoryId ? this.MOCK_MENU_ITEMS.filter(i => i.categoryId === categoryId) : [...this.MOCK_MENU_ITEMS];
      return this.mock(list);
    }
    const params = categoryId ? new HttpParams().set('categoryId', categoryId) : undefined;
    return this.http.get<ApiResponse<MenuItem[]>>(`${this.BASE_URL}/merchant/${subdomain}/menu/items`, { params });
  }

  /** POST /api/merchant/:subdomain/menu/items */
  createMenuItem(subdomain: string, payload: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    if (this.USE_MOCK) {
      const item: MenuItem = { ...payload, id: Date.now() } as MenuItem;
      this.MOCK_MENU_ITEMS.push(item);
      return this.mock(item);
    }
    return this.http.post<ApiResponse<MenuItem>>(`${this.BASE_URL}/merchant/${subdomain}/menu/items`, payload);
  }

  /** PUT /api/merchant/:subdomain/menu/items/:id */
  updateMenuItem(subdomain: string, id: number, payload: Partial<MenuItem>): Observable<ApiResponse<MenuItem>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_MENU_ITEMS.findIndex(i => i.id === id);
      if (idx > -1) this.MOCK_MENU_ITEMS[idx] = { ...this.MOCK_MENU_ITEMS[idx], ...payload };
      return this.mock(this.MOCK_MENU_ITEMS[idx]);
    }
    return this.http.put<ApiResponse<MenuItem>>(`${this.BASE_URL}/merchant/${subdomain}/menu/items/${id}`, payload);
  }

  /** DELETE /api/merchant/:subdomain/menu/items/:id */
  deleteMenuItem(subdomain: string, id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_MENU_ITEMS.findIndex(i => i.id === id);
      if (idx > -1) this.MOCK_MENU_ITEMS.splice(idx, 1);
      return this.mock<void>(undefined as any);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/merchant/${subdomain}/menu/items/${id}`);
  }

  // ─── MERCHANT PORTAL: ORDERS ──────────────────────────────────────────────

  private readonly MOCK_ORDERS: Order[] = [
    { id: 101, storeId: 1, storeName: 'Main Branch', tableId: 2, tableNumber: 'T-02', status: 'Preparing', items: [{ id: 1, menuItemId: 3, name: 'Mixed Grill', quantity: 2, unitPrice: 85, total: 170 }, { id: 2, menuItemId: 6, name: 'Karak Tea', quantity: 2, unitPrice: 12, total: 24 }], subtotal: 194, tax: 29.1, total: 223.1, currency: 'SAR', createdAt: '2025-06-15T10:00:00', updatedAt: '2025-06-15T10:05:00' },
    { id: 102, storeId: 2, storeName: 'Mall of Arabia Outlet', tableId: 6, tableNumber: 'T-02', status: 'Pending', items: [{ id: 3, menuItemId: 4, name: 'Mandi Rice', quantity: 1, unitPrice: 75, total: 75 }], subtotal: 75, tax: 11.25, total: 86.25, currency: 'SAR', createdAt: '2025-06-15T10:10:00', updatedAt: '2025-06-15T10:10:00' },
    { id: 103, storeId: 1, storeName: 'Main Branch', tableId: 1, tableNumber: 'T-01', status: 'Served', items: [{ id: 4, menuItemId: 1, name: 'Hummus', quantity: 1, unitPrice: 18, total: 18 }, { id: 5, menuItemId: 5, name: 'Kunafa', quantity: 2, unitPrice: 28, total: 56 }], subtotal: 74, tax: 11.1, total: 85.1, currency: 'SAR', createdAt: '2025-06-15T09:00:00', updatedAt: '2025-06-15T09:45:00' },
    { id: 104, storeId: 1, storeName: 'Main Branch', tableId: 4, tableNumber: 'T-04', status: 'Confirmed', items: [{ id: 6, menuItemId: 7, name: 'Fresh Juice', quantity: 3, unitPrice: 16, total: 48 }], subtotal: 48, tax: 7.2, total: 55.2, currency: 'SAR', createdAt: '2025-06-15T10:15:00', updatedAt: '2025-06-15T10:16:00' },
  ];

  /** GET /api/merchant/:subdomain/orders?status=&storeId=&page=1&pageSize=10 */
  getOrders(subdomain: string, status = '', storeId?: number, page = 1, pageSize = 10): Observable<PagedResponse<Order>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_ORDERS];
      if (status) list = list.filter(o => o.status === status);
      if (storeId) list = list.filter(o => o.storeId === storeId);
      return this.mockPaged(list, page, pageSize);
    }
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    if (storeId) params = params.set('storeId', storeId);
    return this.http.get<PagedResponse<Order>>(`${this.BASE_URL}/merchant/${subdomain}/orders`, { params });
  }

  /** GET /api/merchant/:subdomain/orders/:id */
  getOrderById(subdomain: string, id: number): Observable<ApiResponse<Order>> {
    if (this.USE_MOCK) {
      const o = this.MOCK_ORDERS.find(x => x.id === id) ?? this.MOCK_ORDERS[0];
      return this.mock(o);
    }
    return this.http.get<ApiResponse<Order>>(`${this.BASE_URL}/merchant/${subdomain}/orders/${id}`);
  }

  /** PUT /api/merchant/:subdomain/orders/:id/status */
  updateOrderStatus(subdomain: string, id: number, status: Order['status']): Observable<ApiResponse<Order>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_ORDERS.findIndex(o => o.id === id);
      if (idx > -1) this.MOCK_ORDERS[idx] = { ...this.MOCK_ORDERS[idx], status, updatedAt: new Date().toISOString() };
      return this.mock(this.MOCK_ORDERS[idx]);
    }
    return this.http.put<ApiResponse<Order>>(`${this.BASE_URL}/merchant/${subdomain}/orders/${id}/status`, { status });
  }

  // ─── MERCHANT PORTAL: REPORTS ─────────────────────────────────────────────

  private readonly MOCK_MERCHANT_REPORTS: MerchantReport[] = [
    { id: 1, period: 'June 2025', totalOrders: 1247, totalRevenue: 98450, currency: 'SAR', avgOrderValue: 78.9, topItems: ['Mixed Grill', 'Mandi Rice', 'Kunafa'], date: '2025-06-15', status: 'Ready' },
    { id: 2, period: 'May 2025', totalOrders: 1102, totalRevenue: 87300, currency: 'SAR', avgOrderValue: 79.2, topItems: ['Mixed Grill', 'Karak Tea', 'Hummus'], date: '2025-05-31', status: 'Ready' },
    { id: 3, period: 'April 2025', totalOrders: 980, totalRevenue: 75100, currency: 'SAR', avgOrderValue: 76.6, topItems: ['Mandi Rice', 'Kunafa', 'Fresh Juice'], date: '2025-04-30', status: 'Ready' },
  ];

  /** GET /api/merchant/:subdomain/reports?period=&page=1&pageSize=10 */
  getMerchantReports(subdomain: string, period = '', page = 1, pageSize = 10): Observable<PagedResponse<MerchantReport>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_MERCHANT_REPORTS];
      if (period) list = list.filter(r => r.period.toLowerCase().includes(period.toLowerCase()));
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('period', period);
    return this.http.get<PagedResponse<MerchantReport>>(`${this.BASE_URL}/merchant/${subdomain}/reports`, { params });
  }

  // ─── MERCHANT PORTAL: PAYOUTS ─────────────────────────────────────────────

  private readonly MOCK_PAYOUTS: Payout[] = [
    { id: 1, reference: 'PAY-20250615-001', amount: 45200, fee: 904, net: 44296, currency: 'SAR', status: 'Completed', date: '2025-06-15', bankAccount: '****4521' },
    { id: 2, reference: 'PAY-20250614-001', amount: 38900, fee: 778, net: 38122, currency: 'SAR', status: 'Completed', date: '2025-06-14', bankAccount: '****4521' },
    { id: 3, reference: 'PAY-20250613-001', amount: 52100, fee: 1042, net: 51058, currency: 'SAR', status: 'Pending', date: '2025-06-13', bankAccount: '****4521' },
    { id: 4, reference: 'PAY-20250612-001', amount: 29800, fee: 596, net: 29204, currency: 'SAR', status: 'Completed', date: '2025-06-12', bankAccount: '****4521' },
    { id: 5, reference: 'PAY-20250611-001', amount: 8200, fee: 164, net: 8036, currency: 'SAR', status: 'Failed', date: '2025-06-11', bankAccount: '****4521' },
  ];

  /** GET /api/merchant/:subdomain/payouts?status=&page=1&pageSize=10 */
  getPayouts(subdomain: string, status = '', page = 1, pageSize = 10): Observable<PagedResponse<Payout>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_PAYOUTS];
      if (status) list = list.filter(p => p.status === status);
      return this.mockPaged(list, page, pageSize);
    }
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('status', status);
    return this.http.get<PagedResponse<Payout>>(`${this.BASE_URL}/merchant/${subdomain}/payouts`, { params });
  }

  // ─── MERCHANT PORTAL: STAFF ───────────────────────────────────────────────

  private readonly MOCK_STAFF: StaffMember[] = [
    { id: 1, name: 'Khalid Hassan', email: 'khalid@mash.com', role: 'Manager', storeId: 1, storeName: 'Main Branch', status: 'Active', pin: '1234', joinedAt: '2024-01-10' },
    { id: 2, name: 'Sara Nasser', email: 'sara@mash.com', role: 'Cashier', storeId: 1, storeName: 'Main Branch', status: 'Active', pin: '5678', joinedAt: '2024-02-01' },
    { id: 3, name: 'Omar Al-Fahad', email: 'omar@mash.com', role: 'Waiter', storeId: 1, storeName: 'Main Branch', status: 'Active', pin: '9012', joinedAt: '2024-03-15' },
    { id: 4, name: 'Fatima Al-Ali', email: 'fatima@mash.com', role: 'Kitchen', storeId: 2, storeName: 'Mall of Arabia Outlet', status: 'Active', pin: '3456', joinedAt: '2024-04-01' },
    { id: 5, name: 'Nasser Ibrahim', email: 'nasser@mash.com', role: 'Waiter', storeId: 2, storeName: 'Mall of Arabia Outlet', status: 'Inactive', pin: '7890', joinedAt: '2024-05-01' },
  ];

  /** GET /api/merchant/:subdomain/staff?storeId=&page=1&pageSize=10 */
  getStaff(subdomain: string, storeId?: number, page = 1, pageSize = 10): Observable<PagedResponse<StaffMember>> {
    if (this.USE_MOCK) {
      let list = [...this.MOCK_STAFF];
      if (storeId) list = list.filter(s => s.storeId === storeId);
      return this.mockPaged(list, page, pageSize);
    }
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (storeId) params = params.set('storeId', storeId);
    return this.http.get<PagedResponse<StaffMember>>(`${this.BASE_URL}/merchant/${subdomain}/staff`, { params });
  }

  /** POST /api/merchant/:subdomain/staff */
  createStaff(subdomain: string, payload: Partial<StaffMember>): Observable<ApiResponse<StaffMember>> {
    if (this.USE_MOCK) {
      const s: StaffMember = { ...payload, id: Date.now(), joinedAt: new Date().toISOString().slice(0, 10) } as StaffMember;
      this.MOCK_STAFF.push(s);
      return this.mock(s);
    }
    return this.http.post<ApiResponse<StaffMember>>(`${this.BASE_URL}/merchant/${subdomain}/staff`, payload);
  }

  /** PUT /api/merchant/:subdomain/staff/:id */
  updateStaff(subdomain: string, id: number, payload: Partial<StaffMember>): Observable<ApiResponse<StaffMember>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_STAFF.findIndex(s => s.id === id);
      if (idx > -1) this.MOCK_STAFF[idx] = { ...this.MOCK_STAFF[idx], ...payload };
      return this.mock(this.MOCK_STAFF[idx]);
    }
    return this.http.put<ApiResponse<StaffMember>>(`${this.BASE_URL}/merchant/${subdomain}/staff/${id}`, payload);
  }

  /** DELETE /api/merchant/:subdomain/staff/:id */
  deleteStaff(subdomain: string, id: number): Observable<ApiResponse<void>> {
    if (this.USE_MOCK) {
      const idx = this.MOCK_STAFF.findIndex(s => s.id === id);
      if (idx > -1) this.MOCK_STAFF.splice(idx, 1);
      return this.mock<void>(undefined as any);
    }
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/merchant/${subdomain}/staff/${id}`);
  }

  // ─── MERCHANT PORTAL: SETTINGS ────────────────────────────────────────────

  private MOCK_SETTINGS: MerchantSettings = {
    merchantId: 9, merchantName: 'Mash Restaurant', email: 'admin@mash.com', phone: '+966509012345',
    currency: 'SAR', taxRate: 15, timezone: 'Asia/Riyadh', orderPrefix: 'ORD',
    enableTableOrdering: true, enableTakeaway: true, enableDelivery: false, autoConfirmOrders: false
  };

  /** GET /api/merchant/:subdomain/settings */
  getSettings(subdomain: string): Observable<ApiResponse<MerchantSettings>> {
    if (this.USE_MOCK) return this.mock({ ...this.MOCK_SETTINGS });
    return this.http.get<ApiResponse<MerchantSettings>>(`${this.BASE_URL}/merchant/${subdomain}/settings`);
  }

  /** PUT /api/merchant/:subdomain/settings */
  updateSettings(subdomain: string, payload: Partial<MerchantSettings>): Observable<ApiResponse<MerchantSettings>> {
    if (this.USE_MOCK) {
      this.MOCK_SETTINGS = { ...this.MOCK_SETTINGS, ...payload };
      return this.mock({ ...this.MOCK_SETTINGS });
    }
    return this.http.put<ApiResponse<MerchantSettings>>(`${this.BASE_URL}/merchant/${subdomain}/settings`, payload);
  }
}
