
import { Product, Category, Store } from './types';

export const MOCK_STORES: Store[] = [
  { id: 'st-001', name: "Ganesh Kirana Store", address: "B-12, Green Valleys Soc", rating: 4.8, image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400', deliverySlot: 'Afternoon Slot (4 PM)' },
  { id: 'st-002', name: "Ramesh Supermarket", address: "Sector 4, Palace Heights", rating: 4.5, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400', deliverySlot: 'Evening Slot (7 PM)' },
  { id: 'st-003', name: "Local Veggie & Dairy", address: "Crossroad Junction", rating: 4.9, image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400', deliverySlot: 'Morning Slot (10 AM)' }
];

export const MOCK_PRODUCTS: Product[] = [
  // --- GROCERY: ATTA ---
  { 
    id: 'g-a-1', 
    name: 'Aashirvaad Superior MP Atta', 
    price: 285, 
    mrp: 320,
    category: Category.GROCERY, 
    unit: '5kg', 
    image: 'https://m.media-amazon.com/images/I/91REmKyE84L._AC_UF1000,1000_QL80_.jpg', 
    stock: 50,
    description: 'Aashirvaad Superior MP Atta is made from the grains which are heavy on the palm and golden in colour. It is ground using modern chakki process which ensures that the rotis stay soft for a long time.',
    manufacturer: 'ITC Limited',
    expiryDate: '2025-08-15'
  },
  { 
    id: 'g-a-2', 
    name: 'Sri Sri Tattva Wheat Atta', 
    price: 65, 
    mrp: 75,
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.srisritattva.com/cdn/shop/products/wheat-atta1kg-srisritattva_a6c3dee2-4dba-4f1a-8e2e-f8cb1485d3ea.jpg?v=1614403658', 
    stock: 100,
    description: 'Sri Sri Tattva Wheat Atta is made by choosing the finest quality of wheat and processing it with the utmost hygiene.',
    manufacturer: 'Sriveda Sattva Pvt Ltd',
    expiryDate: '2025-12-01'
  },
  { 
    id: 'g-a-3', 
    name: 'Fortune Chakki Fresh Atta', 
    price: 55, 
    mrp: 60,
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/10/EQ/JA/AC/69592393/1kg-fortune-chakki-fresh-atta.jpg', 
    stock: 80,
    description: 'Fortune Chakki Fresh Atta is 100% whole wheat flour, which is essential for healthy, soft and fluffy rotis.',
    manufacturer: 'Adani Wilmar Limited',
    expiryDate: '2025-09-20'
  },

  // --- HOUSEHOLD: TOOTHPASTE ---
  { 
    id: 'h-t-1', 
    name: 'Colgate Strong Teeth Toothpaste', 
    price: 145, 
    mrp: 160,
    category: Category.HOUSEHOLD, 
    unit: '300g', 
    image: 'https://www.quickpantry.in/cdn/shop/files/Colgate_Strong_Teeth_Toothpaste_300_g_Quick_Pantry.jpg?crop=center&height=1200&v=1731146068&width=1200', 
    stock: 65,
    description: 'Colgate Strong Teeth with Amino Shakti, adds natural calcium to your teeth to give them 2x strengthening power.',
    manufacturer: 'Colgate-Palmolive (India) Ltd',
    expiryDate: '2026-05-10'
  },
  { 
    id: 'h-t-4', 
    name: 'Close Up Everfresh Red Hot', 
    price: 90, 
    mrp: 110,
    category: Category.HOUSEHOLD, 
    unit: '150g', 
    image: 'https://www.quickpantry.in/cdn/shop/files/Close_Up_Everfresh_Anti-Germ_Gel_Toothpaste_-_Red_Hot.jpg?v=1738006096', 
    stock: 55,
    description: 'Closeup Red Hot Everfresh Gel Toothpaste now in Triple Fresh Formula harnesses the combined power of 3 components to keep you fresh for up to 12 hours.',
    manufacturer: 'Hindustan Unilever Limited',
    expiryDate: '2026-02-14'
  }
];
