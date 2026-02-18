// ─── Models ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  cached?: boolean;
  timestamp?: string;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  success: boolean;
}

// Admin Portal Models
export interface Merchant {
  id: number;
  name: string;
  mid: string;
  status: 'Active' | 'Inactive' | 'Pending';
  type: string;
  transactions: number;
  volume: string;
  subdomain: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface Settlement {
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

export interface AdminReport {
  id: number;
  name: string;
  type: string;
  generatedBy: string;
  date: string;
  status: 'Ready' | 'Processing' | 'Failed';
  size: string;
}

// Merchant Portal Models
export interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  status: 'Open' | 'Closed';
  tablesCount: number;
  managerId: number;
  managerName: string;
}

export interface Table {
  id: number;
  storeId: number;
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  qrCode: string;
  currentOrderId?: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  displayOrder: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  status: 'Available' | 'Unavailable';
  preparationTime: number;
  tags: string[];
}

export interface Order {
  id: number;
  storeId: number;
  storeName: string;
  tableId: number;
  tableNumber: string;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  customerNote?: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface MerchantReport {
  id: number;
  period: string;
  totalOrders: number;
  totalRevenue: number;
  currency: string;
  avgOrderValue: number;
  topItems: string[];
  date: string;
  status: 'Ready' | 'Processing';
}

export interface Payout {
  id: number;
  reference: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  bankAccount: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen';
  storeId: number;
  storeName: string;
  status: 'Active' | 'Inactive';
  pin: string;
  joinedAt: string;
}

export interface MerchantSettings {
  merchantId: number;
  merchantName: string;
  email: string;
  phone: string;
  logo?: string;
  currency: string;
  taxRate: number;
  timezone: string;
  orderPrefix: string;
  enableTableOrdering: boolean;
  enableTakeaway: boolean;
  enableDelivery: boolean;
  autoConfirmOrders: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'admin' | 'merchant';
  name: string;
  merchantSubdomain?: string;
  expiresAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayRevenue: number;
  activeStores: number;
  activeTables: number;
  pendingOrders: number;
  currency: string;
  revenueChange: number;
  ordersChange: number;
}
