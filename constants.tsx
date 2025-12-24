
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
    category: Category.GROCERY, 
    unit: '5kg', 
    image: 'https://m.media-amazon.com/images/I/91REmKyE84L._AC_UF1000,1000_QL80_.jpg', 
    stock: 50 
  },
  { 
    id: 'g-a-2', 
    name: 'Sri Sri Tattva Wheat Atta', 
    price: 65, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.srisritattva.com/cdn/shop/products/wheat-atta1kg-srisritattva_a6c3dee2-4dba-4f1a-8e2e-f8cb1485d3ea.jpg?v=1614403658', 
    stock: 100 
  },
  { 
    id: 'g-a-3', 
    name: 'Fortune Chakki Fresh Atta', 
    price: 55, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/10/EQ/JA/AC/69592393/1kg-fortune-chakki-fresh-atta.jpg', 
    stock: 80 
  },
  { 
    id: 'g-a-4', 
    name: 'Good Life Multigrain Atta', 
    price: 75, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.jiomart.com/images/product/original/491551200/good-life-whole-wheat-atta-with-multigrain-atta-1-kg-product-images-o491551200-p491551200-0-202301061952.jpg?im=Resize=(420,420)', 
    stock: 40 
  },
  { 
    id: 'g-a-5', 
    name: 'KK Chakki Fresh Atta', 
    price: 50, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://kkfoodproducts.com/cdn/shop/files/KKCHACKIFRESHATTA1KGUPDATEDMOCKUPLOWRES.jpg?v=1727938407&width=1000', 
    stock: 60 
  },

  // --- HOUSEHOLD: HAIR OIL ---
  { 
    id: 'h-h-1', 
    name: 'Dabur Amla Hair Oil', 
    price: 95, 
    category: Category.HOUSEHOLD, 
    unit: '200ml', 
    image: 'https://www.daburshop.com/cdn/shop/files/3_cebfacae-95e4-4440-bbdc-f6a9b22b72cc_600x600.png?v=1729670255', 
    stock: 45 
  },
  { 
    id: 'h-h-2', 
    name: 'Aloe Vera Non-Sticky Hair Oil', 
    price: 40, 
    category: Category.HOUSEHOLD, 
    unit: '48ml', 
    image: 'https://www.quickpantry.in/cdn/shop/files/Hair_CareTripleBlendAloeVeraNon-StickyHairOil48ml.jpg?v=1725103267&width=1214', 
    stock: 120 
  },
  { 
    id: 'h-h-3', 
    name: 'WOW Onion Hair Oil', 
    price: 299, 
    category: Category.HOUSEHOLD, 
    unit: '200ml', 
    image: 'https://media.buywow.in/public/20d41733-dd13-40c0-86cb-c63dd3afe718?w=480&q=75&f=webp', 
    stock: 30 
  },
  { 
    id: 'h-h-4', 
    name: 'Bajaj Almond Drops Hair Oil', 
    price: 75, 
    category: Category.HOUSEHOLD, 
    unit: '100ml', 
    image: 'https://bcuat.bajajconsumercare.com/assets/images/Bajaj-Almond-Drops-Hair_Oil.jpg', 
    stock: 90 
  },
  { 
    id: 'h-h-5', 
    name: 'Parachute Coconut Hair Oil', 
    price: 50, 
    category: Category.HOUSEHOLD, 
    unit: '100ml', 
    image: 'https://m.media-amazon.com/images/I/61fapIFwFmL.jpg', 
    stock: 150 
  },
  { 
    id: 'h-h-6', 
    name: 'Pure Hair Oil', 
    price: 60, 
    category: Category.HOUSEHOLD, 
    unit: '100ml', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH3ko0Q2C-vrPqWr_9VDHB1cgu7Kz5nhRxiw&s', 
    stock: 100 
  },

  // --- HOUSEHOLD: TOOTHPASTE ---
  { 
    id: 'h-t-1', 
    name: 'Colgate Strong Teeth Toothpaste', 
    price: 145, 
    category: Category.HOUSEHOLD, 
    unit: '300g', 
    image: 'https://www.quickpantry.in/cdn/shop/files/Colgate_Strong_Teeth_Toothpaste_300_g_Quick_Pantry.jpg?crop=center&height=1200&v=1731146068&width=1200', 
    stock: 65 
  },
  { 
    id: 'h-t-2', 
    name: 'Pepsodent Germi Check', 
    price: 85, 
    category: Category.HOUSEHOLD, 
    unit: '150g', 
    image: 'https://www.clickoncare.com/cdn/shop/files/1_ac505dc9-925c-464e-86ed-165c331bd95f.jpg?v=1707884270', 
    stock: 75 
  },
  { 
    id: 'h-t-3', 
    name: 'Sensodyne Whitening Toothpaste', 
    price: 180, 
    category: Category.HOUSEHOLD, 
    unit: '75g', 
    image: 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/sensodyne-v2/en_US/Product-pages/products/310158083757%20MobileHero%20Sensodyne%20Full%20Protection%20Whitening.jpg?auto=format', 
    stock: 40 
  },
  { 
    id: 'h-t-4', 
    name: 'Close Up Everfresh Red Hot', 
    price: 90, 
    category: Category.HOUSEHOLD, 
    unit: '150g', 
    image: 'https://www.quickpantry.in/cdn/shop/files/Close_Up_Everfresh_Anti-Germ_Gel_Toothpaste_-_Red_Hot.jpg?v=1738006096', 
    stock: 55 
  },

  // --- GROCERY: SALT ---
  { 
    id: 'g-s-1', 
    name: 'Tata Salt Lite', 
    price: 28, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.tatanutrikorner.com/cdn/shop/files/61UhgjGTwYL._SL1000.jpg?v=1745826105&width=1', 
    stock: 200 
  },
  { 
    id: 'g-s-2', 
    name: 'Rock Salt (Andaman)', 
    price: 85, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://andamangreengrocers.com/wp-content/uploads/2024/08/rock.webp', 
    stock: 35 
  },
  { 
    id: 'g-s-3', 
    name: 'Sri Sri Tattva Rock Salt', 
    price: 45, 
    category: Category.GROCERY, 
    unit: '500g', 
    image: 'https://www.srisritattva.com/cdn/shop/files/RockSalt.jpg?v=1702451462', 
    stock: 60 
  },
  { 
    id: 'g-s-4', 
    name: 'Table Salt', 
    price: 20, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://m.media-amazon.com/images/I/614mm2hYHyL._AC_UF894,1000_QL80_.jpg', 
    stock: 100 
  },

  // --- GROCERY: SUGAR ---
  { 
    id: 'g-su-1', 
    name: 'BB Popular Sugar', 
    price: 48, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.bbassets.com/media/uploads/p/xl/40019396_11-bb-popular-sugar.jpg', 
    stock: 120 
  },
  { 
    id: 'g-su-2', 
    name: 'Madhur Refined Sugar', 
    price: 55, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.bbassets.com/media/uploads/p/l/244096_6-madhur-sugar-refined.jpg', 
    stock: 100 
  },
  { 
    id: 'g-su-3', 
    name: 'Sri Sri Tattva Organic Brown Sugar', 
    price: 95, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://www.srisritattva.com/cdn/shop/files/OrganicBrownSugar1kg.png?v=1713507793', 
    stock: 45 
  },
  { 
    id: 'g-su-4', 
    name: 'Pure White Sugar', 
    price: 50, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://m.media-amazon.com/images/I/81M6T+PF-iL.jpg', 
    stock: 100 
  },
  { 
    id: 'g-su-5', 
    name: 'Crystal Sugar', 
    price: 52, 
    category: Category.GROCERY, 
    unit: '1kg', 
    image: 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/e27831f9-2d2b-41a4-abdc-cb61e975ac04.__CR0,0,970,600_PT0_SX970_V1___.jpg', 
    stock: 100 
  },

  // --- GROCERY: OIL ---
  { 
    id: 'g-o-1', 
    name: 'Organic Sarso (Mustard) Oil', 
    price: 165, 
    category: Category.GROCERY, 
    unit: '1L', 
    image: 'https://content.jdmagicbox.com/quickquotes/images_main/organic-sarso-oil-1-kg-jar-802853216-jjv4wu4x.jpg?impolicy=queryparam&im=Resize=(360,360),aspect=fit', 
    stock: 55 
  },
  { 
    id: 'g-o-2', 
    name: 'Fortune Groundnut Oil', 
    price: 185, 
    category: Category.GROCERY, 
    unit: '1L', 
    image: 'https://tiimg.tistatic.com/fp/1/007/639/1-l-100-pure-fresh-natural-taste-organic-fortune-filtered-groundnut-oil-used-for-cooking-354.jpg', 
    stock: 40 
  }
];
