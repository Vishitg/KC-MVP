
import { Product, Category, Store } from './types';

export const MOCK_STORE: Store = {
  id: 'st-001',
  name: "Ganesh Kirana & General Store",
  address: "Building B-12, Green Valleys, Mumbai",
  radiusKm: 5,
  societiesCovered: ["Green Valleys", "Blue Bells", "Silver Oaks", "Palace Heights", "Harmony Homes"]
};

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Aashirvaad Select Atta', price: 285, category: Category.GROCERY, unit: '5kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200', stock: 50 },
  { id: '2', name: 'Tata Salt (Iodized)', price: 28, category: Category.GROCERY, unit: '1kg', image: 'https://images.unsplash.com/photo-1626509653295-d866b245037d?auto=format&fit=crop&q=80&w=200', stock: 100 },
  { id: '3', name: 'Fortune Soya Health Oil', price: 155, category: Category.GROCERY, unit: '1L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbacf849?auto=format&fit=crop&q=80&w=200', stock: 40 },
  { id: '4', name: 'Dove Cream Bar', price: 52, category: Category.BEAUTY, unit: '100g', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=200', stock: 30 },
  { id: '5', name: 'Ponds White Beauty Cream', price: 210, category: Category.BEAUTY, unit: '50g', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200', stock: 20 },
  { id: '6', name: 'Mens Plain White Tee', price: 399, category: Category.FASHION, unit: 'L', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200', stock: 15 },
  { id: '7', name: 'Microfiber Floor Mop', price: 249, category: Category.HOUSEHOLD, unit: 'Piece', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200', stock: 60 },
  { id: '8', name: 'Colgate MaxFresh Gel', price: 95, category: Category.PERSONAL_CARE, unit: '150g', image: 'https://images.unsplash.com/photo-1559594864-4242182916d1?auto=format&fit=crop&q=80&w=200', stock: 45 },
  { id: '9', name: 'Amul Gold Milk', price: 33, category: Category.GROCERY, unit: '500ml', image: 'https://images.unsplash.com/photo-1563636619-e9107da4a1bb?auto=format&fit=crop&q=80&w=200', stock: 80 },
  { id: '10', name: 'Basmati Rice (Organic)', price: 120, category: Category.GROCERY, unit: '1kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200', stock: 150 },
];
