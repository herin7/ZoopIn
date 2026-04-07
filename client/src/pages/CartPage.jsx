import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Zap, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();

  // Dummy data
  const cartItems = [
    { id: 1, name: 'Rare Jordan 1 Drop', price: 15999, quantity: 1, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=3087&auto=format&fit=crop' },
    { id: 2, name: 'Supreme Vault Box Logo', price: 8500, quantity: 2, image: 'https://images.unsplash.com/photo-1574015974293-817f0efebb19?q=80&w=3104&auto=format&fit=crop' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 500;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black md:px-8 selection:bg-black selection:text-white font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-[4px] border-black bg-zoop-yellow p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
           <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-black text-white p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
           >
              <ChevronLeft size={24} strokeWidth={3} />
           </motion.button>
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Your <span className="bg-black text-white px-3">Haul.</span></h1>
           <div className="h-12 w-12 border-2 border-black flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingBag size={24} strokeWidth={3} />
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Cart List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="group border-[3px] border-black p-4 flex gap-6 hover:bg-zinc-50 transition-all bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(244,255,0,1)]"
              >
                <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 border-2 border-black bg-zinc-100 overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">{item.name}</h3>
                         <p className="text-xs font-black uppercase tracking-widest text-black/40">Verified Drop Item</p>
                      </div>
                      <button className="text-red-600 hover:text-black transition-colors">
                         <Trash2 size={20} strokeWidth={3} />
                      </button>
                   </div>

                   <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                      <div className="flex bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                         <button className="p-2 border-r-2 border-black hover:bg-zoop-yellow transition-colors"><Minus size={14} strokeWidth={4} /></button>
                         <span className="px-4 py-2 font-black italic">{item.quantity}</span>
                         <button className="p-2 border-l-2 border-black hover:bg-zoop-yellow transition-colors"><Plus size={14} strokeWidth={4} /></button>
                      </div>
                      <span className="text-2xl font-black italic tracking-tighter text-blue-600">₹{item.price.toLocaleString()}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
             <div className="border-[4px] border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sticky top-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-8 underline decoration-zoop-yellow decoration-[6px]">Drop Summary</h2>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between font-bold text-black/60 italic">
                      <span>Inventory Value</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between font-bold text-black/60 italic">
                      <span>Fast Shipping</span>
                      <span>₹{shipping.toLocaleString()}</span>
                   </div>
                   <div className="h-[2px] bg-black/10 my-4" />
                   <div className="flex justify-between text-2xl font-black uppercase italic tracking-tighter">
                      <span>Total Due</span>
                      <span className="text-blue-600">₹{total.toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="w-full bg-black text-white py-5 font-black uppercase italic tracking-tighter text-2xl shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] flex items-center justify-center gap-3 group"
                   >
                     SECURE CHECKOUT <Zap size={22} className="fill-zoop-yellow group-hover:animate-pulse" />
                   </motion.button>
                   <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30">
                      <CreditCard size={12} strokeWidth={3} /> PCI SEALED PROTOCOL ACTIVE
                   </div>
                </div>

                {/* Promo Code Dummy */}
                <div className="mt-10 pt-10 border-t-2 border-dashed border-black/10">
                   <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2 block">DASH-COUPON CODE</label>
                   <div className="flex gap-2">
                      <input 
                        className="flex-1 border-2 border-black p-2 font-bold focus:bg-zoop-yellow/5 outline-none" 
                        placeholder="HYPE30"
                      />
                      <button className="bg-white border-2 border-black px-4 font-black uppercase italic text-xs hover:bg-black hover:text-white transition-all">APPLY</button>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Branding Footer */}
        <div className="mt-20 py-10 border-t-4 border-black/5 opacity-5 select-none text-center">
           <span className="text-[150px] font-black tracking-tighter uppercase italic leading-none">ZOOPIN HAUL</span>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
