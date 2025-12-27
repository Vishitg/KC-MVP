
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, CartItem, Order, DeliveryMode, UserRole, Store, UserProfile, StoreProfile, AddressEntry } from './types';
import { MOCK_PRODUCTS, MOCK_STORES } from './constants';
import ChatAssistant from './components/ChatAssistant';

const App: React.FC = () => {
  // --- STATE & PERSISTENCE ---
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kc_role');
    return (saved as UserRole) || UserRole.UNSET;
  });

  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem('kc_isRegistered') === 'true';
  });

  const [customerProfile, setCustomerProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('kc_customerProfile');
    return saved ? JSON.parse(saved) : { 
      name: "", address: "", phone: "", email: "", 
      addresses: [{ id: '1', label: 'Home', details: '', isDefault: true }] 
    };
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem('kc_storeProfile');
    return saved ? JSON.parse(saved) : { 
      name: "", address: "", phone: "", email: "", storeName: "", businessType: "General Store", deliverySlots: "10 AM - 7 PM" 
    };
  });

  const [storeInventory, setStoreInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kc_inventory');
    return saved ? JSON.parse(saved) : [...MOCK_PRODUCTS];
  });

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
    return localStorage.getItem('kc_selectedStoreId');
  });

  const activeStore = MOCK_STORES.find(s => s.id === selectedStoreId) || null;

  // Tabs: Shopper (Home, Catalog, Profile) | Store (Inventory, Orders, Profile)
  const [activeTab, setActiveTab] = useState<'Home' | 'Catalog' | 'Profile' | 'Inventory' | 'Orders'>('Home');
  const [profileSubTab, setProfileSubTab] = useState<'Orders' | 'Addresses' | 'Support' | 'Admin'>('Orders');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kc_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCart, setShowCart] = useState(false);

  // Modal & Dashboard states
  const [historyView, setHistoryView] = useState<'none' | 'earnings' | 'analytics'>('none');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    mrp: 0,
    category: Category.GROCERY,
    unit: '1kg',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
    stock: 0,
    description: '',
    manufacturer: '',
    expiryDate: ''
  });

  // Sync state
  useEffect(() => {
    localStorage.setItem('kc_role', role);
    localStorage.setItem('kc_isRegistered', String(isRegistered));
    localStorage.setItem('kc_customerProfile', JSON.stringify(customerProfile));
    localStorage.setItem('kc_storeProfile', JSON.stringify(storeProfile));
    localStorage.setItem('kc_orders', JSON.stringify(myOrders));
    localStorage.setItem('kc_inventory', JSON.stringify(storeInventory));
    if (selectedStoreId) localStorage.setItem('kc_selectedStoreId', selectedStoreId);
    else localStorage.removeItem('kc_selectedStoreId');
  }, [role, isRegistered, customerProfile, storeProfile, myOrders, storeInventory, selectedStoreId]);

  useEffect(() => {
    if (role === UserRole.STORE_OWNER) {
      setActiveTab('Inventory');
      setProfileSubTab('Admin');
    } else if (role === UserRole.CUSTOMER) {
      setActiveTab('Home');
      setProfileSubTab('Orders');
    }
  }, [role]);

  // --- LOGIC ---
  const filteredProducts = useMemo(() => {
    const base = role === UserRole.CUSTOMER ? MOCK_PRODUCTS : storeInventory;
    if (activeCategory === 'All') return base;
    return base.filter(p => p.category === activeCategory);
  }, [activeCategory, role, storeInventory]);

  const addToCart = (items: CartItem[]) => {
    setCart(prev => {
      let newCart = [...prev];
      items.forEach(newItem => {
        const existing = newCart.find(i => i.id === newItem.id);
        if (existing) {
          existing.quantity = Math.min(5, existing.quantity + newItem.quantity);
        } else {
          newCart.push({ ...newItem, quantity: Math.min(5, newItem.quantity) });
        }
      });
      return newCart;
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryMode: DeliveryMode.BATCH,
      status: 'Pending',
      createdAt: new Date(),
      estimatedDelivery: 'Tomorrow, 10 AM',
      storeName: activeStore?.name || "Local Store"
    };
    setMyOrders([newOrder, ...myOrders]);
    setCart([]);
    setShowCart(false);
    setActiveTab('Profile');
    setProfileSubTab('Orders');
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(UserRole.UNSET);
    setIsRegistered(false);
    setSelectedStoreId(null);
    setCart([]);
    setMyOrders([]);
    setActiveTab('Home');
    setProfileSubTab('Orders');
    setHistoryView('none');
    setEditingProduct(null);
    setIsAddingProduct(false);
    setCustomerProfile({ 
      name: "", address: "", phone: "", email: "", 
      addresses: [{ id: '1', label: 'Home', details: '', isDefault: true }] 
    });
    setStoreProfile({ 
      name: "", address: "", phone: "", email: "", storeName: "", businessType: "General Store", deliverySlots: "10 AM - 7 PM" 
    });
    setStoreInventory([...MOCK_PRODUCTS]);
  };

  const resetToStart = () => {
    setRole(UserRole.UNSET);
    setIsRegistered(false);
    setSelectedStoreId(null);
    localStorage.removeItem('kc_role');
    localStorage.removeItem('kc_isRegistered');
    localStorage.removeItem('kc_selectedStoreId');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setStoreInventory(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productToAdd: Product = { ...newProduct, id: `custom-${Date.now()}` };
    setStoreInventory(prev => [productToAdd, ...prev]);
    setIsAddingProduct(false);
    setNewProduct({
      name: '', price: 0, mrp: 0, category: Category.GROCERY, unit: '1kg', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', stock: 0, description: '', manufacturer: '', expiryDate: ''
    });
  };

  const renderProductCard = (p: Product) => (
    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div 
        onClick={() => setViewingProductDetails(p)}
        className="relative cursor-pointer aspect-square mb-3 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden p-3 flex items-center justify-center"
      >
        <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        <span className="absolute top-2 right-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-tighter">{p.unit}</span>
      </div>
      <h4 
        onClick={() => setViewingProductDetails(p)}
        className="cursor-pointer font-bold text-[11px] text-slate-900 dark:text-white mb-1 line-clamp-2 h-8 leading-tight hover:text-indigo-600 transition-colors"
      >
        {p.name}
      </h4>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="font-black text-indigo-600 text-xs">₹{p.price}</span>
          {p.mrp && p.mrp > p.price && (
            <span className="text-[9px] text-slate-400 line-through">₹{p.mrp}</span>
          )}
        </div>
        <button 
          onClick={() => addToCart([{ ...p, quantity: 1 }])}
          className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>
    </div>
  );

  // --- ONBOARDING SCREENS ---
  if (role === UserRole.UNSET) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl rotate-6 transition-transform hover:rotate-0 duration-500">
          <span className="text-4xl font-black text-white">K</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight text-center">KiranaConnect</h1>
        <p className="text-slate-500 font-medium mt-3 mb-12 text-center max-w-[280px]">Welcome! Choose your path.</p>
        <div className="w-full max-w-xs space-y-4">
          <button onClick={() => setRole(UserRole.CUSTOMER)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all active:scale-95">I'm a Shopper</button>
          <button onClick={() => setRole(UserRole.STORE_OWNER)} className="w-full bg-white dark:bg-slate-900 text-indigo-600 border-2 border-indigo-50 dark:border-slate-800 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all active:scale-95">I'm a Store Owner</button>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 animate-in slide-in-from-right duration-500">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative">
          <button onClick={() => setRole(UserRole.UNSET)} className="absolute top-8 left-8 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> Back
          </button>
          <div className="mt-10">
            <h2 className="text-3xl font-black mb-2">{role === UserRole.CUSTOMER ? "Profile Setup" : "Register Store"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); setIsRegistered(true); }} className="space-y-4">
              {role === UserRole.STORE_OWNER && (
                <input required type="text" value={storeProfile.storeName} onChange={(e) => setStoreProfile({...storeProfile, storeName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" placeholder="Store Name" />
              )}
              <input required type="text" value={customerProfile.name} onChange={(e) => setCustomerProfile({...customerProfile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" placeholder="Full Name" />
              <input required type="tel" value={customerProfile.phone} onChange={(e) => setCustomerProfile({...customerProfile, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" placeholder="Phone" />
              <input required type="email" value={customerProfile.email} onChange={(e) => setCustomerProfile({...customerProfile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" placeholder="Business Email" />
              <textarea required value={customerProfile.address} onChange={(e) => setCustomerProfile({...customerProfile, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none resize-none" placeholder="Address" rows={3} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl mt-4 active:scale-95 transition-all">Complete Registration</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (role === UserRole.CUSTOMER && !selectedStoreId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-500">
        <div className="max-w-4xl mx-auto space-y-10 py-10 text-center">
          <h2 className="text-4xl font-black tracking-tight">Neighborhood Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_STORES.map(s => (
              <button key={s.id} onClick={() => setSelectedStoreId(s.id)} className="group text-left bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all">
                <div className="h-56 relative overflow-hidden">
                  <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={s.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-black text-white">{s.name}</h3>
                    <p className="text-white/70 text-sm font-bold">{s.address}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-slate-950 pb-24 transition-colors duration-300">
      <header className="sticky top-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={resetToStart} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-all">
              <span className="text-white font-black text-2xl">K</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none">KiranaConnect</h1>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">
                {role === UserRole.STORE_OWNER ? storeProfile.storeName : activeStore?.name}
              </p>
            </div>
          </div>
          {role === UserRole.CUSTOMER && (
            <button onClick={() => setShowCart(true)} className="relative p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-lg">{cart.length}</span>}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto min-h-[calc(100vh-160px)]">
        {role === UserRole.CUSTOMER ? (
          <>
            {activeTab === 'Home' && (
              <div className="p-6 space-y-10 animate-in fade-in duration-500">
                <div className="relative h-64 rounded-[3.5rem] overflow-hidden bg-indigo-600 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent z-10 p-10 flex flex-col justify-center">
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Welcome to {activeStore?.name}</span>
                    <h2 className="text-4xl font-black text-white leading-tight">Your Daily Essentials,<br/>Faster.</h2>
                    <div className="mt-8 flex gap-3">
                       <button onClick={() => setActiveTab('Catalog')} className="bg-white text-indigo-600 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-50 active:scale-95">Explore Items</button>
                    </div>
                  </div>
                  <img src={activeStore?.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]" alt="Banner" />
                </div>
                <div className="space-y-6">
                   <h3 className="text-2xl font-black tracking-tight px-2">Top Sellers</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {MOCK_PRODUCTS.slice(0, 4).map(renderProductCard)}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Catalog' && (
              <div className="flex h-full animate-in fade-in duration-500 overflow-hidden">
                <aside className="w-24 md:w-32 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar py-6">
                  <div className="flex flex-col gap-3 px-3">
                    {['All', ...Object.values(Category)].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat as any)} 
                        className={`py-6 px-1 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        <span className="text-2xl">{cat === 'All' ? '📦' : '✨'}</span>
                        <span className="text-[9px] font-black uppercase text-center leading-tight">{cat}</span>
                      </button>
                    ))}
                  </div>
                </aside>
                <section className="flex-1 overflow-y-auto p-6 no-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                    {filteredProducts.map(renderProductCard)}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="p-6 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                <div className="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl flex items-center gap-8 relative overflow-hidden">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl font-black border border-white/20">
                    {customerProfile.name.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 z-10">
                    <h2 className="text-3xl font-black mb-1">{customerProfile.name}</h2>
                    <p className="opacity-80 font-bold text-sm">{customerProfile.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl">
                  {['Orders', 'Addresses', 'Support'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setProfileSubTab(tab as any)} 
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${profileSubTab === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {profileSubTab === 'Orders' && (
                  <div className="space-y-4">
                    {myOrders.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 text-center border opacity-50"><p className="text-6xl mb-4">🛒</p><p className="font-black text-sm uppercase">No orders yet</p></div>
                    ) : (
                      myOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border shadow-sm space-y-4">
                           <div className="flex justify-between items-start">
                              <div><p className="text-[10px] font-black text-indigo-600">ID: {order.id}</p><p className="text-xl font-black">₹{order.total}</p></div>
                              <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600">{order.status}</span>
                           </div>
                           <div className="flex gap-2 overflow-x-auto no-scrollbar">
                              {order.items.map(i => <img key={i.id} src={i.image} className="w-12 h-12 rounded-xl bg-slate-50 p-2 border" alt={i.name} />)}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-6 rounded-[2.5rem] font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Sign Out Account</button>
              </div>
            )}
          </>
        ) : (
          /* STORE OWNER INTERFACE */
          <div className="p-6 space-y-10 animate-in fade-in duration-500">
             {activeTab === 'Inventory' && (
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div><h2 className="text-3xl font-black tracking-tight">Shop Items</h2><p className="text-xs font-bold text-slate-400 mt-1">Inventory Management</p></div>
                    <button onClick={() => setIsAddingProduct(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase shadow-xl transition-all">+ Add Product</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {storeInventory.map(p => (
                     <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm group">
                        <div onClick={() => setEditingProduct(p)} className="w-20 h-20 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-shrink-0 cursor-pointer"><img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={p.name} /></div>
                        <div className="flex-1 cursor-pointer" onClick={() => setEditingProduct(p)}><h4 className="font-black text-sm leading-tight mb-2">{p.name}</h4><p className="text-[10px] font-black text-indigo-600">₹{p.price} • Stock: {p.stock}</p></div>
                        <button onClick={() => setEditingProduct(p)} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 5v.01M12 12v.01M12 19v.01" /></svg></button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {activeTab === 'Orders' && (
               <div className="space-y-8">
                 <h2 className="text-3xl font-black tracking-tight">Customer Orders</h2>
                 <div className="bg-white dark:bg-slate-900 p-20 rounded-[4rem] text-center border opacity-40"><p className="text-5xl mb-4">🧾</p><p className="font-black text-sm uppercase">No pending orders</p></div>
               </div>
             )}

             {activeTab === 'Profile' && (
               <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
                 {historyView === 'none' ? (
                   <>
                    <div className="bg-slate-900 dark:bg-indigo-950 p-10 rounded-[4rem] shadow-2xl flex items-center justify-between text-white relative overflow-hidden">
                      <div className="flex items-center gap-8 relative z-10">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black">S</div>
                        <div><h2 className="text-3xl font-black tracking-tight">{storeProfile.storeName}</h2><p className="opacity-60 text-xs font-bold">Store Dashboard</p></div>
                      </div>
                      <button onClick={handleLogout} className="bg-white/10 p-4 rounded-3xl active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg></button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div onClick={() => setHistoryView('earnings')} className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:border-indigo-500 cursor-pointer active:scale-95 transition-all">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Earnings</p>
                          <h3 className="text-3xl font-black group-hover:text-indigo-600 transition-colors">₹8,420</h3>
                          <p className="text-[8px] font-black text-green-500 mt-2 uppercase tracking-tighter">+12% from yesterday</p>
                        </div>
                        <div onClick={() => setHistoryView('analytics')} className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:border-indigo-500 cursor-pointer active:scale-95 transition-all">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Store Analytics</p>
                          <h3 className="text-3xl font-black group-hover:text-indigo-600 transition-colors">86%</h3>
                          <p className="text-[8px] font-black text-indigo-500 mt-2 uppercase tracking-tighter">Customer Satisfaction</p>
                        </div>
                    </div>

                    <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl">
                        {['Store Info', 'Support'].map(tab => (
                          <button key={tab} onClick={() => setProfileSubTab(tab === 'Store Info' ? 'Admin' : 'Support' as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${profileSubTab === (tab === 'Store Info' ? 'Admin' : 'Support') ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
                        ))}
                    </div>

                    {profileSubTab === 'Admin' && (
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 space-y-6">
                          <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Business Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div><p className="text-[9px] font-black text-slate-400 uppercase">Owner Name</p><p className="font-bold text-sm">{customerProfile.name}</p></div>
                              <div><p className="text-[9px] font-black text-slate-400 uppercase">Phone</p><p className="font-bold text-sm">{customerProfile.phone}</p></div>
                              <div><p className="text-[9px] font-black text-slate-400 uppercase">Email</p><p className="font-bold text-sm">{customerProfile.email || 'Not provided'}</p></div>
                              <div className="col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase">Address</p><p className="font-bold text-sm leading-relaxed">{customerProfile.address}</p></div>
                          </div>
                        </div>
                    )}

                    {profileSubTab === 'Support' && (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] text-center space-y-8 border shadow-sm">
                          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-4xl">🏪</div>
                          <div><h3 className="text-2xl font-black mb-3">Partner Support</h3><p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">Get help with payouts, listings, or technical issues.</p></div>
                          <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-all">Contact Account Manager</button>
                        </div>
                    )}
                    <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-6 rounded-[2.5rem] font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Sign Out Account</button>
                   </>
                 ) : historyView === 'earnings' ? (
                   <div className="space-y-8 animate-in slide-in-from-right duration-500">
                      <div className="flex items-center justify-between">
                         <h3 className="text-3xl font-black tracking-tight">Revenue History</h3>
                         <button onClick={() => setHistoryView('none')} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Balance</p>
                         <h2 className="text-5xl font-black">₹42,350.00</h2>
                         <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-2xl"><p className="text-[9px] font-black opacity-60">This Week</p><p className="text-xl font-black">₹18,400</p></div>
                            <div className="bg-white/10 p-4 rounded-2xl"><p className="text-[9px] font-black opacity-60">This Month</p><p className="text-xl font-black">₹1.2L</p></div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Recent Payouts</h4>
                         {[1,2,3].map(i => (
                           <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-xl font-black">↓</div>
                                 <div><p className="font-black text-sm">Payout to Bank</p><p className="text-[10px] text-slate-400 font-bold">May {10+i}, 2025</p></div>
                              </div>
                              <p className="font-black text-indigo-600">₹{4500 * i}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-8 animate-in slide-in-from-right duration-500">
                      <div className="flex items-center justify-between">
                         <h3 className="text-3xl font-black tracking-tight">Analytics Insights</h3>
                         <button onClick={() => setHistoryView('none')} className="bg-slate-100 p-3 rounded-2xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100">
                            <h4 className="text-xs font-black uppercase text-indigo-600 mb-6">Customer Traffic</h4>
                            <div className="h-48 flex items-end gap-2 px-2">
                               {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                 <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-xl relative group">
                                    <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-indigo-600 rounded-t-xl group-hover:bg-indigo-400 transition-all"></div>
                                 </div>
                               ))}
                            </div>
                            <div className="flex justify-between mt-4 px-1 text-[8px] font-black text-slate-400 uppercase">
                               <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                            </div>
                         </div>
                         <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 space-y-6">
                            <h4 className="text-xs font-black uppercase text-indigo-600">Key Metrics</h4>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Repeat Customers</span><span className="font-black text-indigo-600">72%</span></div>
                               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full w-[72%]"></div></div>
                               <div className="flex justify-between items-center mt-6"><span className="text-xs font-bold text-slate-500">Stock Efficiency</span><span className="font-black text-indigo-600">94%</span></div>
                               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-green-500 h-full w-[94%]"></div></div>
                            </div>
                         </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100">
                         <h4 className="text-xs font-black uppercase text-indigo-600 mb-6">Popular Categories</h4>
                         <div className="space-y-4">
                            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><p className="flex-1 text-sm font-bold">Grocery</p><p className="font-black">45%</p></div>
                            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-indigo-400"></div><p className="flex-1 text-sm font-bold">Dairy</p><p className="font-black">30%</p></div>
                            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-indigo-200"></div><p className="flex-1 text-sm font-bold">Household</p><p className="font-black">25%</p></div>
                         </div>
                      </div>
                   </div>
                 )}
               </div>
             )}
          </div>
        )}
      </main>

      {/* FOOTER NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-10 py-5 flex justify-between items-center z-[110] shadow-[0_-15px_50px_rgba(0,0,0,0.06)] rounded-t-[2.5rem]">
        {role === UserRole.CUSTOMER ? (
          <>
            <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" /></svg>
              <span className="text-[9px] font-black uppercase">Home</span>
            </button>
            <button onClick={() => setActiveTab('Catalog')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Catalog' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Catalog' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="text-[9px] font-black uppercase">Catalog</span>
            </button>
            <button onClick={() => setActiveTab('Profile')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[9px] font-black uppercase">Profile</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('Inventory')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Inventory' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Inventory' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4" /></svg>
              <span className="text-[9px] font-black uppercase">Items</span>
            </button>
            <button onClick={() => setActiveTab('Orders')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Orders' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Orders' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span className="text-[9px] font-black uppercase">Orders</span>
            </button>
            <button onClick={() => setActiveTab('Profile')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[9px] font-black uppercase">Account</span>
            </button>
          </>
        )}
      </nav>

      {/* PRODUCT DETAILS MODAL (Shopper Only) */}
      {viewingProductDetails && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
              <div className="relative h-72 sm:h-80 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-10">
                 <img src={viewingProductDetails.image} className="w-full h-full object-contain" alt={viewingProductDetails.name} />
                 <button onClick={() => setViewingProductDetails(null)} className="absolute top-6 right-6 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl shadow-lg text-slate-500 transition-transform active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6" /></svg></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className="text-[10px] font-black text-indigo-600 uppercase mb-1 block">{viewingProductDetails.category}</span>
                       <h2 className="text-2xl font-black tracking-tight leading-tight">{viewingProductDetails.name}</h2>
                       <p className="text-slate-400 font-bold text-sm mt-1">{viewingProductDetails.unit} Pack</p>
                    </div>
                    <div className="text-right"><p className="text-3xl font-black text-indigo-600">₹{viewingProductDetails.price}</p>{viewingProductDetails.mrp && viewingProductDetails.mrp > viewingProductDetails.price && <p className="text-xs text-slate-400 line-through font-bold">MRP ₹{viewingProductDetails.mrp}</p>}</div>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-[11px] font-black uppercase text-slate-400">About product</h3>
                    <p className="text-sm font-medium leading-relaxed">{viewingProductDetails.description || "Fresh local essential. Quality checked and verified by your Kirana partner."}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-4">
                    <h3 className="text-[11px] font-black uppercase text-indigo-600/60 text-center">Consumer Information</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-[11px]">
                       <div><p className="text-slate-400 uppercase mb-0.5">Manufacturer</p><p className="font-bold">{viewingProductDetails.manufacturer || "Local Supplier"}</p></div>
                       <div><p className="text-slate-400 uppercase mb-0.5">Expiry Date</p><p className="font-bold">{viewingProductDetails.expiryDate || "See packaging"}</p></div>
                    </div>
                 </div>
                 <button onClick={() => { addToCart([{ ...viewingProductDetails, quantity: 1 }]); setViewingProductDetails(null); }} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all">Add to Bag</button>
              </div>
           </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL (Store Only) */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black tracking-tight">Add New Stock</h3><button onClick={() => setIsAddingProduct(false)} className="text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Name</label><input required type="text" placeholder="e.g. Basmati Rice" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" /></div>
                   <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Category</label><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none">{Object.values(Category).map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Price (₹)</label><input required type="number" value={newProduct.price || ''} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">MRP (₹)</label><input type="number" value={newProduct.mrp || ''} onChange={(e) => setNewProduct({...newProduct, mrp: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Unit</label><input required type="text" placeholder="1kg" value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold outline-none" /></div>
                 </div>
                 <div className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl p-6 space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-indigo-600">Legal Info (Forum Compliant)</h4>
                    <input type="text" placeholder="Manufacturer" value={newProduct.manufacturer} onChange={(e) => setNewProduct({...newProduct, manufacturer: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                    <input type="text" placeholder="Expiry" value={newProduct.expiryDate} onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                    <textarea rows={3} placeholder="Full Description..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none resize-none" />
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 bg-slate-100 py-5 rounded-3xl font-black text-[10px] uppercase">Cancel</button>
                    <button type="submit" className="flex-2 bg-indigo-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase shadow-xl">List Item</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (Store Only) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black tracking-tight">Edit Stock</h3><button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                 <div className="flex gap-4 items-center">
                    <img src={editingProduct.image} className="w-20 h-20 rounded-2xl bg-slate-50 p-4 border" alt={editingProduct.name} />
                    <div className="flex-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Item Name</label>
                       <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-2 px-4 text-sm font-bold outline-none" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Price (₹)</label><input required type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-4 px-6 font-bold outline-none" /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Stock</label><input required type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-4 px-6 font-bold outline-none" /></div>
                 </div>
                 <div className="bg-indigo-50/30 rounded-3xl p-6 space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-indigo-600">Consumer Details</h4>
                    <textarea rows={3} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none resize-none" placeholder="Description..." />
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 py-5 rounded-3xl font-black text-[10px] uppercase">Discard</button>
                    <button type="submit" className="flex-2 bg-indigo-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase shadow-xl">Update</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* AI ASSISTANT (Shopper Only) */}
      {role === UserRole.CUSTOMER && isRegistered && selectedStoreId && (
        <ChatAssistant onItemsAdded={addToCart} onCheckoutRequested={() => setShowCart(true)} catalog={MOCK_PRODUCTS} />
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center"><h3 className="text-2xl font-black tracking-tight">Shopping Bag</h3><button onClick={() => setShowCart(false)} className="text-slate-400 p-2.5 hover:bg-slate-50 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6" /></svg></button></div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-24 opacity-30"><div className="text-7xl mb-6">🛒</div><p className="font-black text-sm uppercase">Bag is empty</p></div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[2rem] border">
                    <div className="w-20 h-20 bg-white rounded-2xl p-3 flex items-center justify-center"><img src={item.image} className="w-full h-full object-contain" alt={item.name} /></div>
                    <div className="flex-1"><h4 className="font-black text-sm leading-tight mb-1">{item.name}</h4><p className="text-xs font-black text-indigo-600">₹{item.price} × {item.quantity}</p></div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-10 border-t space-y-8 bg-slate-50/50">
                <div className="flex justify-between items-center"><span className="font-black text-slate-500 uppercase text-[10px]">Total Amount</span><span className="text-3xl font-black text-indigo-600">₹{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span></div>
                <button onClick={handleCheckout} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-lg active:scale-95 transition-all">Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
