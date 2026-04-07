import { ShoppingCart, Zap, Tag, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductSpotlight = ({ product }) => {
  const navigate = useNavigate();

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm font-black uppercase italic tracking-tighter text-black/20">The drop is empty. Awaiting host selection...</p>
      </div>
    );
  }

  const handleBuy = () => {
    navigate('/cart');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Visual Asset */}
      <div className="h-40 w-40 flex-shrink-0 border-2 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 italic font-black text-black/10">NO ASSET</div>
        )}
      </div>

      {/* Product Intel */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-zoop-yellow fill-black" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Drop ID: {product._id?.slice(-6).toUpperCase()}</p>
           </div>
           <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2 underline decoration-zoop-yellow decoration-4 underline-offset-4">
              {product.name}
           </h3>
           <p className="text-sm font-bold text-black/60 leading-snug italic line-clamp-2 mb-4">
              "{product.description || 'Global exclusive drop. Extremely limited availability.'}"
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-black/40 tracking-widest leading-none">Price Tag</span>
              <span className="text-3xl font-black italic tracking-tighter text-blue-600">₹{Number(product.price || 0).toFixed(0)}</span>
           </div>
           <div className="flex flex-col border-l-2 border-black/10 pl-6">
              <span className="text-[10px] font-black uppercase text-black/40 tracking-widest leading-none">Vibe Check</span>
              <span className="text-sm font-black uppercase italic text-green-600 flex items-center gap-1">
                 <Truck size={14} strokeWidth={3} /> Fast Delivery
              </span>
           </div>
        </div>
      </div>

      {/* Action Block */}
      <div className="flex flex-row md:flex-col gap-3 md:w-56">
         <motion.button
           whileHover={{ scale: 1.05, x: 5 }}
           whileTap={{ scale: 0.95 }}
           onClick={handleBuy}
           className="flex-1 bg-black text-white px-6 py-3 font-black uppercase italic tracking-tighter text-lg shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] flex items-center justify-center gap-3 group"
         >
           BUY NOW <Zap size={18} className="fill-zoop-yellow group-hover:animate-pulse" />
         </motion.button>
         <motion.button
           whileHover={{ scale: 1.05, x: -5 }}
           whileTap={{ scale: 0.95 }}
           onClick={handleBuy}
           className="flex-1 bg-white border-[3px] border-black text-black px-6 py-3 font-black uppercase italic tracking-tighter text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3"
         >
           ADD TO CART <ShoppingCart size={18} strokeWidth={3} />
         </motion.button>
      </div>
    </div>
  );
};

export default ProductSpotlight;
