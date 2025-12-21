
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, CartItem, Order, DeliveryMode, UserRole } from './types';
import { MOCK_PRODUCTS, MOCK_STORE } from './constants';
import ChatAssistant from './components/ChatAssistant';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(DeliveryMode.BATCH);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleChatOrder = (items: CartItem[]) => {
    setCart(prev => {
      let newCart = [...prev];
      items.forEach(newItem => {
        const existing = newCart.find(i => i.id === newItem.id);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          newCart.push(newItem);
        }
      });
      return newCart;
    });
    // Visual feedback
    const cartBtn = document.getElementById('cart-toggle-btn');
    cartBtn?.classList.add('scale-125', 'bg-orange-600');
    setTimeout(() => {
      cartBtn?.classList.remove('scale-125', 'bg-orange-600');
    }, 1000);
  };

  const handleCheckoutRequested = () => {
    setShowCart(true);
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const initiatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cart],
        total: cartTotal + (deliveryMode === DeliveryMode.INSTANT ? 30 : 0),
        deliveryMode,
        status: 'Confirmed',
        createdAt: new Date(),
        estimatedDelivery: deliveryMode === DeliveryMode.INSTANT ? 'Within 30 mins' : 'Batch @ 4:00 PM',
        customerName: "Rahul Sharma",
        customerAddress: "Flat 402, Green Valleys Soc"
      };
      setOrders([newOrder, ...orders]);
      setCart([]);
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setShowCart(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen pb-32 transition-colors duration-300">
      <div className="fixed top-0 left-0 w-full h-1 z-[100] group">
         <div className="hidden group-hover:flex bg-black/80 text-white p-2 text-[8px] justify-center gap-4">
            <button onClick={() => setRole(UserRole.CUSTOMER)}>Customer View</button>
            <button onClick={() => setRole(UserRole.STORE_OWNER)}>Store View</button>
         </div>
      </div>

      {role === UserRole.CUSTOMER ? (
        <>
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800 px-6 py-5 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-none">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                   </div>
                   <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">KiranaConnect</h1>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-400">
                   <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                   DELIVERING TO <span className="text-orange-600 dark:text-orange-500 uppercase">GREEN VALLEYS SOC</span>
                </div>
              </div>
              <button 
                id="cart-toggle-btn"
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-gray-900 dark:bg-slate-800 rounded-2xl text-white shadow-xl transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-4 border-white dark:border-slate-800 font-black">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-5">
              {['All', ...Object.values(Category)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category | 'All')}
                  className={`px-6 py-2.5 rounded-2xl whitespace-nowrap text-[11px] font-black tracking-widest uppercase transition-all ${
                    activeCategory === cat 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 dark:shadow-none' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="p-6">
            <div className="bg-gray-900 dark:bg-orange-700/20 rounded-[2.5rem] p-6 text-white mb-8 shadow-2xl relative overflow-hidden group transition-colors">
               <div className="relative z-10">
                 <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 tracking-widest uppercase mb-1">Building B-12 Exclusive</p>
                 <h2 className="text-2xl font-black mb-1">Batch #44 is open</h2>
                 <p className="text-xs text-gray-400 dark:text-slate-300 font-medium">Free delivery ends in <span className="text-white font-bold">22 mins</span></p>
               </div>
               <div className="absolute top-0 right-0 p-8 text-orange-600/20 group-hover:scale-110 transition-transform">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H12.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V5a1 1 0 00-1-1H3z" /></svg>
               </div>
            </div>

            <main className="grid grid-cols-2 gap-5">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-sm border border-gray-50 dark:border-slate-800 flex flex-col p-3 group transition-all hover:shadow-2xl hover:border-orange-100 dark:hover:border-orange-600/50">
                  <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-[#F9F9F9] dark:bg-slate-800">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-2xl text-[10px] font-black text-gray-900 dark:text-white shadow-xl border border-white dark:border-slate-800">
                      {product.unit}
                    </div>
                  </div>
                  <div className="px-3 pt-4 pb-2 flex flex-col flex-1">
                    <h3 className="font-black text-sm text-gray-900 dark:text-slate-100 line-clamp-2 h-10 mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-black text-xl text-gray-900 dark:text-white">₹{product.price}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white w-11 h-11 rounded-[1.25rem] flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all active:scale-90"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </main>
          </div>

          <ChatAssistant onItemsAdded={handleChatOrder} onCheckoutRequested={handleCheckoutRequested} catalog={products} />
        </>
      ) : (
        <div className="p-8 text-center text-gray-400 dark:text-slate-600 font-bold uppercase tracking-widest py-32">
          Store Dashboard Mockup Coming Soon
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[4rem] shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="px-10 py-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Bag</h2>
                <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest mt-1">Review your items</p>
              </div>
              <button onClick={() => setShowCart(false)} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 space-y-8 no-scrollbar pb-10">
              {cart.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-6 opacity-30 text-center dark:opacity-20">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <p className="font-black text-xl text-gray-900 dark:text-white">Your bag is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center group">
                    <div className="w-24 h-24 rounded-[2rem] bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-base text-gray-900 dark:text-white leading-tight mb-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-3">{item.unit} • ₹{item.price}</p>
                      <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 w-fit p-1 rounded-[1.25rem]">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 shadow-sm font-black text-gray-900 dark:text-white hover:text-orange-600 transition-colors">-</button>
                        <span className="text-sm font-black w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 shadow-sm font-black text-gray-900 dark:text-white hover:text-orange-600 transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-10 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-8 sticky bottom-0 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end px-2">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Total to Pay</p>
                    <span className="text-4xl font-black text-gray-900 dark:text-white">₹{cartTotal + (deliveryMode === DeliveryMode.INSTANT ? 30 : 0)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Batch Discount Applied</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-slate-300 underline underline-offset-4 decoration-orange-600">Batch #44 (4 PM Arrival)</p>
                  </div>
                </div>
                
                <button 
                  onClick={initiatePayment}
                  className="w-full bg-orange-600 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-orange-700 transition-all shadow-2xl shadow-orange-200 dark:shadow-none active:scale-95"
                >
                  Confirm & Pay Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isProcessingPayment && (
        <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
           <div className="w-20 h-20 border-4 border-orange-100 dark:border-slate-800 border-t-orange-600 rounded-full animate-spin mb-8 text-orange-600"></div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Securing Payment...</h2>
           <p className="text-gray-400 dark:text-slate-500 font-medium max-w-xs">Connecting to Secure Kirana Gateway</p>
        </div>
      )}

      {paymentSuccess && (
        <div className="fixed inset-0 z-[120] bg-orange-600 dark:bg-orange-700 text-white flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-110 duration-700">
           <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" /></svg>
           </div>
           <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase leading-none">Order Placed!</h2>
           <p className="text-xl font-medium opacity-90 max-w-xs mb-12">Success! Your items are reserved. Delivery expected by 4:15 PM.</p>
           <button 
             onClick={() => setPaymentSuccess(false)}
             className="bg-white text-orange-600 px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 hover:scale-105 transition-transform"
           >
             Continue Shopping
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
