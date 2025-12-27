
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

  // Store owner starts with pre-populated inventory
  const [storeInventory, setStoreInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kc_inventory');
    return saved ? JSON.parse(saved) : [...MOCK_PRODUCTS];
  });

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
    return localStorage.getItem('kc_selectedStoreId');
  });

  const activeStore = MOCK_STORES.find(s => s.id === selectedStoreId) || null;

  const [activeTab, setActiveTab] = useState<'Home' | 'Categories' | 'Profile' | 'Inventory' | 'Orders'>('Home');
  const [profileSubTab, setProfileSubTab] = useState<'Main' | 'Orders' | 'Addresses' | 'Admin' | 'Support'>('Main');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kc_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCart, setShowCart] = useState(false);

  // Store Owner specific interaction states
  const [historyView, setHistoryView] = useState<'none' | 'earnings' | 'orders'>('none');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // New Product Draft State
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    category: Category.GROCERY,
    unit: '1kg',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
    stock: 0
  });

  // Sync state to local storage
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

  // Set default tabs based on role
  useEffect(() => {
    if (role === UserRole.STORE_OWNER) setActiveTab('Inventory');
    else setActiveTab('Home');
  }, [role]);

  // --- LOGIC ---
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

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
    // Clear local storage first
    localStorage.clear();
    
    // Reset all states to initial values
    setRole(UserRole.UNSET);
    setIsRegistered(false);
    setSelectedStoreId(null);
    setCart([]);
    setMyOrders([]);
    setActiveTab('Home');
    setProfileSubTab('Main');
    setHistoryView('none');
    setEditingProduct(null);
    setIsAddingProduct(false);
    
    // Reset Profiles
    setCustomerProfile({ 
      name: "", address: "", phone: "", email: "", 
      addresses: [{ id: '1', label: 'Home', details: '', isDefault: true }] 
    });
    setStoreProfile({ 
      name: "", address: "", phone: "", email: "", storeName: "", businessType: "General Store", deliverySlots: "10 AM - 7 PM" 
    });
    setStoreInventory([...MOCK_PRODUCTS]);
    
    // No window.location.reload() needed. React state update will trigger redirection.
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
    const productToAdd: Product = {
      ...newProduct,
      id: `custom-${Date.now()}`
    };
    setStoreInventory(prev => [productToAdd, ...prev]);
    setIsAddingProduct(false);
    setNewProduct({
      name: '', price: 0, category: Category.GROCERY, unit: '1kg', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', stock: 0
    });
  };

  // --- RENDERING HELPERS ---
  const renderProductCard = (p: Product) => (
    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="relative aspect-square mb-3 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden p-3 flex items-center justify-center">
        <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        <span className="absolute top-2 right-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-tighter">{p.unit}</span>
      </div>
      <h4 className="font-bold text-[11px] text-slate-900 dark:text-white mb-1 line-clamp-2 h-8 leading-tight">{p.name}</h4>
      <div className="flex items-center justify-between mt-auto">
        <span className="font-black text-indigo-600 text-xs">₹{p.price}</span>
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
        <p className="text-slate-500 font-medium mt-3 mb-12 text-center max-w-[280px]">Welcome! Please choose how you'd like to use our platform today.</p>
        <div className="w-full max-w-xs space-y-4">
          <button onClick={() => setRole(UserRole.CUSTOMER)} className="group w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3">
            <span>I'm a Shopper</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button onClick={() => setRole(UserRole.STORE_OWNER)} className="w-full bg-white dark:bg-slate-900 text-indigo-600 border-2 border-indigo-50 dark:border-slate-800 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 hover:bg-indigo-50 dark:hover:bg-slate-800">
            I'm a Store Owner
          </button>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 animate-in slide-in-from-right duration-500">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative">
          <button onClick={() => setRole(UserRole.UNSET)} className="absolute top-8 left-8 text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 font-black text-[10px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="mt-10">
            <h2 className="text-3xl font-black mb-2">{role === UserRole.CUSTOMER ? "Your Profile" : "Register Store"}</h2>
            <p className="text-slate-500 font-medium mb-8 text-sm">Please provide your details to continue.</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsRegistered(true); }} className="space-y-4">
              {role === UserRole.STORE_OWNER && (
                <input required type="text" value={storeProfile.storeName} onChange={(e) => setStoreProfile({...storeProfile, storeName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Kirana Store Name" />
              )}
              <input required type="text" value={customerProfile.name} onChange={(e) => setCustomerProfile({...customerProfile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" />
              <input required type="tel" value={customerProfile.phone} onChange={(e) => setCustomerProfile({...customerProfile, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Mobile Number" />
              <input required type="email" value={customerProfile.email} onChange={(e) => setCustomerProfile({...customerProfile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email ID" />
              <textarea required value={customerProfile.address} onChange={(e) => {
                  const val = e.target.value;
                  setCustomerProfile(prev => ({...prev, address: val, addresses: [{ id: '1', label: 'Home', details: val, isDefault: true }]}));
              }} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Complete Address" rows={3} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl mt-4 hover:bg-indigo-700 transition-all active:scale-95">Complete Registration</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (role === UserRole.CUSTOMER && !selectedStoreId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-500">
        <div className="max-w-4xl mx-auto space-y-10 py-10">
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-4xl font-black tracking-tight">Kirana Stores Near Me</h2>
                <p className="text-slate-500 font-bold mt-2">Select a store to start shopping.</p>
             </div>
             <button onClick={() => setIsRegistered(false)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600">Back to profile</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_STORES.map(s => (
              <button key={s.id} onClick={() => setSelectedStoreId(s.id)} className="group text-left bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="h-56 relative overflow-hidden">
                  <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={s.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-black text-white mb-1">{s.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-black border border-white/10 uppercase tracking-widest">{s.deliverySlot}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-bold truncate max-w-[200px]">{s.address}</p>
                  </div>
                  <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-active:scale-95">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-slate-950 pb-24 transition-colors">
      <header className="sticky top-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={resetToStart} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-90">
              <span className="text-white font-black text-2xl">K</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none">KiranaConnect</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                  {role === UserRole.STORE_OWNER ? storeProfile.storeName || "My Store" : activeStore?.name}
                </p>
                {role === UserRole.CUSTOMER && (
                  <button onClick={() => setSelectedStoreId(null)} className="ml-1 text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-tighter transition-colors">Change Store</button>
                )}
              </div>
            </div>
          </div>
          {role === UserRole.CUSTOMER ? (
            <button onClick={() => setShowCart(true)} className="relative p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all active:scale-95">
              <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-lg">{cart.length}</span>}
            </button>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Active Store</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {role === UserRole.CUSTOMER ? (
          <>
            {activeTab === 'Home' && (
              <div className="p-6 space-y-10 animate-in fade-in duration-500">
                <div className="relative h-60 rounded-[3rem] overflow-hidden bg-indigo-600 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent z-10 p-10 flex flex-col justify-center">
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Featured Store</span>
                    <h2 className="text-3xl font-black text-white leading-tight">{activeStore?.name}</h2>
                    <p className="text-indigo-100 text-xs font-bold mt-3 max-w-xs">{activeStore?.address}</p>
                    <div className="mt-6 flex gap-3">
                       <button onClick={() => setActiveTab('Categories')} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-50 active:scale-95">Explore Catalog</button>
                    </div>
                  </div>
                  <img src={activeStore?.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]" alt="Store Background" />
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight">Today's Selection</h3>
                      <button onClick={() => setActiveTab('Categories')} className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1">View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {MOCK_PRODUCTS.slice(0, 4).map(renderProductCard)}
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'Categories' && (
              <div className="flex h-[calc(100vh-160px)] animate-in fade-in duration-500 overflow-hidden">
                <aside className="w-24 md:w-32 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar py-6">
                  <div className="flex flex-col gap-3 px-3">
                    {['All', ...Object.values(Category)].map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`py-6 px-1 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <span className="text-2xl">{cat === 'All' ? '📦' : cat === Category.GROCERY ? '🌾' : '✨'}</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-tight">{cat}</span>
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
              <div className="p-6 space-y-8 animate-in slide-in-from-bottom-5">
                <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl flex items-center gap-8 relative overflow-hidden">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl font-black">{customerProfile.name.charAt(0)}</div>
                  <div className="flex-1 z-10">
                    <h2 className="text-3xl font-black mb-1">{customerProfile.name}</h2>
                    <p className="opacity-80 font-bold text-sm">{customerProfile.email || customerProfile.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl">
                  {['Orders', 'Addresses', 'Support'].map(tab => (
                    <button key={tab} onClick={() => setProfileSubTab(tab as any)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${profileSubTab === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
                  ))}
                </div>
                {profileSubTab === 'Orders' && (
                  <div className="space-y-4">
                    {myOrders.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center opacity-40">
                        <p className="text-5xl mb-4">📦</p><p className="font-black text-sm uppercase tracking-widest">No orders yet</p>
                      </div>
                    ) : (
                      myOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                          <div className="flex justify-between items-start">
                            <div><p className="text-[10px] font-black text-indigo-600">Booking Ref: {order.id}</p><p className="text-xl font-black mt-1">₹{order.total}</p></div>
                            <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full ${order.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{order.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Logout Account</button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 space-y-10 animate-in fade-in duration-500">
             {activeTab === 'Inventory' && (
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Stock Shelf</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1">Items currently visible to shoppers.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingProduct(true)}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      + Add Product
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {storeInventory.map(p => (
                     <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm group">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-shrink-0 flex items-center justify-center">
                          <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={p.name} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm leading-tight mb-2">{p.name}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">₹{p.price}</span>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                              <span className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                              <span className="text-[9px] font-black uppercase text-slate-500">Stock: {p.stock}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setEditingProduct(p)} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             {activeTab === 'Orders' && (
               <div className="space-y-8">
                 <h2 className="text-3xl font-black tracking-tight">Active Orders</h2>
                 <div className="bg-white dark:bg-slate-900 p-20 rounded-[4rem] text-center opacity-40">
                    <p className="text-5xl mb-4">🧾</p><p className="font-black text-sm uppercase tracking-widest">No incoming orders</p>
                 </div>
               </div>
             )}
             {activeTab === 'Profile' && (
               <div className="space-y-10 animate-in slide-in-from-bottom-5">
                 <div className="bg-slate-900 dark:bg-indigo-950 p-10 rounded-[4rem] shadow-2xl flex items-center justify-between text-white relative overflow-hidden">
                   <div className="flex items-center gap-8 relative z-10">
                     <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black">S</div>
                     <div><h2 className="text-3xl font-black tracking-tight">{storeProfile.storeName || "My Store"}</h2></div>
                   </div>
                   <button onClick={handleLogout} className="bg-white/10 p-4 rounded-3xl active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg></button>
                 </div>
                 <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl">
                    {['Admin Details', 'Support'].map(tab => (
                      <button key={tab} onClick={() => { setProfileSubTab(tab === 'Admin Details' ? 'Admin' : 'Support' as any); setHistoryView('none'); }} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${profileSubTab === (tab === 'Admin Details' ? 'Admin' : 'Support') ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
                    ))}
                 </div>
                 {profileSubTab === 'Admin' && (
                    <div className="space-y-10 animate-in fade-in">
                      {historyView === 'none' ? (
                        <>
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Shop Performance</h4>
                             <div className="grid grid-cols-2 gap-6">
                                <div onClick={() => setHistoryView('earnings')} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm cursor-pointer active:scale-95 transition-all">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Earnings</p>
                                   <h3 className="text-3xl font-black">₹0.00</h3>
                                </div>
                                <div onClick={() => setHistoryView('orders')} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm cursor-pointer active:scale-95 transition-all">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Orders Completed</p>
                                   <h3 className="text-3xl font-black">0</h3>
                                </div>
                             </div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] space-y-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Owner</label><p className="text-sm font-black p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">{customerProfile.name}</p></div>
                              <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contact</label><p className="text-sm font-black p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">{customerProfile.phone}</p></div>
                              <div className="md:col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Address</label><p className="text-sm font-black p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl leading-relaxed">{customerProfile.address}</p></div>
                            </div>
                            <button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Edit Account Info</button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-sm animate-in slide-in-from-right">
                          <div className="flex items-center justify-between mb-8">
                             <h4 className="text-xl font-black tracking-tight">{historyView === 'earnings' ? 'Earnings' : 'Orders'} History</h4>
                             <button onClick={() => setHistoryView('none')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">Back</button>
                          </div>
                          <div className="py-12 text-center opacity-40"><p className="font-black text-sm uppercase tracking-widest">No history yet</p></div>
                        </div>
                      )}
                      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-red-100 active:scale-95 transition-all">Sign Out Account</button>
                    </div>
                 )}
                 {profileSubTab === 'Support' && (
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] text-center space-y-8 shadow-sm">
                      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-4xl">🏪</div>
                      <div><h3 className="text-2xl font-black mb-3">Partner Help</h3><p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">Need help with listing or payments? Contact us anytime.</p></div>
                      <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Contact Manager</button>
                    </div>
                 )}
               </div>
             )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-10 py-5 flex justify-between items-center z-[110] shadow-[0_-15px_50px_rgba(0,0,0,0.06)] rounded-t-[2.5rem]">
        {role === UserRole.CUSTOMER ? (
          <>
            <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Home' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
            </button>
            <button onClick={() => setActiveTab('Categories')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Categories' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Categories' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Shop</span>
            </button>
            <button onClick={() => { setActiveTab('Profile'); setProfileSubTab('Orders'); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Profile' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('Inventory')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Inventory' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Inventory' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Items</span>
            </button>
            <button onClick={() => setActiveTab('Orders')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Orders' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Orders' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Orders</span>
            </button>
            <button onClick={() => { setActiveTab('Profile'); setProfileSubTab('Admin'); setHistoryView('none'); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'Profile' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600'}`}>
              <svg className="w-7 h-7" fill={activeTab === 'Profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
            </button>
          </>
        )}
      </nav>

      {/* ADD PRODUCT MODAL */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black tracking-tight">Add New Stock</h3>
                 <button onClick={() => setIsAddingProduct(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Product Name</label>
                    <input required type="text" placeholder="e.g. Basmati Rice" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Price (₹)</label>
                       <input required type="number" placeholder="0" value={newProduct.price || ''} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Unit</label>
                       <input required type="text" placeholder="1kg" value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Initial Stock</label>
                       <input required type="number" placeholder="0" value={newProduct.stock || ''} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Category</label>
                       <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                          {Object.values(Category).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Image URL</label>
                    <input type="url" placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-2 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">List Item</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black tracking-tight">Edit Stock Item</h3>
                 <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                 <div className="flex gap-4 items-center mb-6">
                    <img src={editingProduct.image} className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 object-contain border border-slate-100 dark:border-slate-800" alt={editingProduct.name} />
                    <div>
                       <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Item Preview</p>
                       <p className="text-sm font-bold truncate max-w-[200px]">{editingProduct.name}</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Product Name</label>
                    <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Price (₹)</label>
                       <input required type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Stock Level</label>
                       <input required type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest">Discard</button>
                    <button type="submit" className="flex-2 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {role === UserRole.CUSTOMER && isRegistered && selectedStoreId && (
        <ChatAssistant onItemsAdded={addToCart} onCheckoutRequested={() => setShowCart(true)} catalog={MOCK_PRODUCTS} />
      )}

      {showCart && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">Shopping Bag</h3>
              <button onClick={() => setShowCart(false)} className="text-slate-400 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-24 opacity-30">
                  <div className="text-7xl mb-6">🛒</div><p className="font-black text-sm uppercase tracking-widest">Bag is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl p-3 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm leading-tight mb-1">{item.name}</h4>
                      <p className="text-xs font-black text-indigo-600">₹{item.price} <span className="text-slate-400 font-bold ml-1">× {item.quantity}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-10 border-t border-slate-100 dark:border-slate-800 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-500 uppercase tracking-widest text-[9px] mb-1">Total</span>
                    <span className="text-3xl font-black text-indigo-600">₹{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-indigo-100 dark:shadow-none transition-all">Order from {activeStore?.name}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
