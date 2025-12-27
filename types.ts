
export enum Category {
  GROCERY = 'Grocery',
  PERSONAL_CARE = 'Personal Care',
  FASHION = 'Fashion',
  HOUSEHOLD = 'Household',
  BEAUTY = 'Beauty',
  DAIRY = 'Dairy',
  SNACKS = 'Snacks'
}

export enum UserRole {
  UNSET = 'Unset',
  CUSTOMER = 'Customer',
  STORE_OWNER = 'Store Owner'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  unit: string;
  image: string;
  stock: number;
  description?: string;
  manufacturer?: string;
  expiryDate?: string;
  mrp?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum DeliveryMode {
  BATCH = 'Batch',
  INSTANT = 'Instant'
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryMode: DeliveryMode;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered';
  createdAt: Date;
  estimatedDelivery: string;
  storeName: string;
  customerName?: string;
  customerAddress?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  image: string;
  deliverySlot: string;
}

export interface AddressEntry {
  id: string;
  label: string; // Home, Work, etc.
  details: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  addresses?: AddressEntry[];
}

export interface StoreProfile extends UserProfile {
  storeName: string;
  businessType: string;
  deliverySlots?: string; // New field for custom slots
}
