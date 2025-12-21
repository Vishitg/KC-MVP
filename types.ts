
export enum Category {
  GROCERY = 'Grocery',
  PERSONAL_CARE = 'Personal Care',
  FASHION = 'Fashion',
  HOUSEHOLD = 'Household',
  BEAUTY = 'Beauty'
}

export enum UserRole {
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
  customerName?: string;
  customerAddress?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  radiusKm: number;
  societiesCovered: string[];
}
