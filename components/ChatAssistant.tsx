
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { CartItem, Product } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'kiyara';
  timestamp: Date;
}

interface ChatAssistantProps {
  onItemsAdded: (items: CartItem[]) => void;
  onCheckoutRequested: () => void;
  catalog: Product[];
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onItemsAdded, onCheckoutRequested, catalog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Namaste! I'm Kiyara, your neighborhood assistant. What do you need today?", sender: 'kiyara', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    const history = newMessages.slice(-7).map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
      text: m.text
    }));

    const result = await geminiService.processChatCommand(userMsg.text, catalog, history);

    if (result) {
      const kiyaraMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: result.responseText,
        sender: 'kiyara',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, kiyaraMsg]);

      if (result.items && result.items.length > 0) {
        const itemsToAdd: CartItem[] = result.items.map(e => {
          const product = catalog.find(p => p.id === e.itemId);
          return product ? { ...product, quantity: e.quantity } : null;
        }).filter(Boolean) as CartItem[];
        
        if (itemsToAdd.length > 0) {
          onItemsAdded(itemsToAdd);
        }
      }

      if (result.intentToPay) {
        setTimeout(() => {
          setIsOpen(false);
          onCheckoutRequested();
        }, 1500);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Connection is a bit slow. Could you try that again?",
        sender: 'kiyara',
        timestamp: new Date()
      }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[150] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] h-[480px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-5 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight tracking-tight">Kiyara</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Online Now</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-bold shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white border border-indigo-500 rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Kiyara for anything..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 19l7-7-7-7" /></svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 border-2 border-white dark:border-slate-800 group"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
        ) : (
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </div>
  );
};

export default ChatAssistant;
