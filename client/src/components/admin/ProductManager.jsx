import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Sparkles, UploadCloud, Zap, ShoppingBag, Plus, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useToastStore } from '../../store/toastStore';

const emptyFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
};

const ProductManager = ({ session, socket, currentProductId, onCurrentProductChange }) => {
  const addToast = useToastStore((state) => state.addToast);
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(emptyFormState);

  const currentProduct = useMemo(
    () => products.find((product) => product._id === currentProductId) || null,
    [currentProductId, products]
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/api/products?isActive=true');
      setProducts(response.data.data || []);
    } catch (error) {
      addToast({
        title: 'Unable to load products',
        message: error.response?.data?.message || 'Please try again in a moment.',
        tone: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (selectedFile) {
        payload.append('images', selectedFile);
      }

      const response = await api.post('/api/products', payload);
      setProducts((currentProducts) => [response.data.data, ...currentProducts]);
      setFormValues(emptyFormState);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      addToast({
        title: 'Product added',
        message: 'The new product is ready for showcasing.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Unable to add product',
        message: error.response?.data?.message || 'Check the product details and try again.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSwitch = (product) => {
    if (!session || !socket) {
      addToast({
        title: 'Session required',
        message: 'Create and start a session before switching products.',
        tone: 'warning',
      });
      return;
    }

    socket.emit('product:switch', {
      roomId: session.roomId,
      sessionId: session._id,
      productId: product._id,
    });

    onCurrentProductChange?.(product);
    addToast({
      title: 'Showcase updated',
      message: `${product.name} is now the live product.`,
      tone: 'success',
    });
  };

  return (
    <div className="space-y-8 selection:bg-black selection:text-white">
      
      {/* Current Spotlight Card */}
      <div className="border-[3px] border-black bg-zoop-yellow p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
           <Zap size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">Live Focus</p>
          <div className="flex items-center gap-3">
             <div className="bg-black text-zoop-yellow p-2 border-2 border-black">
                <ShoppingBag size={20} />
             </div>
             <h3 className="text-xl font-black uppercase italic tracking-tighter truncate leading-none">
                {currentProduct?.name || 'No Product in Spotlight'}
             </h3>
          </div>
          {currentProduct && (
            <p className="mt-3 text-sm font-bold text-black/60 italic leading-snug">
              "{currentProduct.description || 'Global audience is watching.'}"
            </p>
          )}
        </div>
      </div>

      {/* Add Product Form */}
      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white border-2 border-black p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Plus size={20} />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Add Drop</h3>
        </div>

        <form className="space-y-5" onSubmit={handleCreateProduct}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Product Title</label>
               <input
                 required
                 value={formValues.name}
                 onChange={(e) => setFormValues(s => ({ ...s, name: e.target.value }))}
                 className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
                 placeholder="Hype Name"
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Price (₹)</label>
               <input
                 required
                 type="number"
                 value={formValues.price}
                 onChange={(e) => setFormValues(s => ({ ...s, price: e.target.value }))}
                 className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
                 placeholder="0.00"
               />
            </div>
          </div>
          
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Description / Meta</label>
             <textarea
               rows={2}
               value={formValues.description}
               onChange={(e) => setFormValues(s => ({ ...s, description: e.target.value }))}
               className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
               placeholder="Why should they bid?"
             />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) setSelectedFile(file);
            }}
            className={`border-2 border-dashed p-6 text-center transition-all ${
              isDragging ? 'border-black bg-zoop-yellow/20' : 'border-black/20 bg-zinc-50'
            }`}
          >
            <UploadCloud className="mx-auto text-black/20 mb-3" size={32} />
            <div className="text-xs font-black uppercase tracking-widest leading-loose">
              {selectedFile ? (
                <span className="bg-black text-white px-2 py-1">{selectedFile.name}</span>
              ) : (
                <>Drop Visual or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-black underline decoration-zoop-yellow decoration-4">Browse</button></>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 font-black uppercase italic tracking-tighter text-xl shadow-[4px_4px_0px_0px_rgba(244,255,0,1)] disabled:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Layers size={20} />}
            {isSubmitting ? 'SECURE SAVING...' : 'COMMIT DROP'}
          </motion.button>
        </form>
      </div>

      {/* Product Inventory List */}
      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Inventory</h3>
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={fetchProducts}
            className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 border-[3px] border-black p-3 transition-all ${
                  currentProductId === product._id
                    ? 'bg-zoop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="h-14 w-14 border-2 border-black overflow-hidden bg-black flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white text-black/10 font-black">?</div>
                  )}
                </div>

                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-sm font-black uppercase italic tracking-tighter truncate">{product.name}</p>
                  <p className="text-lg font-black italic tracking-tighter text-blue-600">₹{Number(product.price || 0).toFixed(0)}</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleProductSwitch(product)}
                  className={`px-3 py-2 border-2 border-black font-black uppercase italic text-[10px] tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                    currentProductId === product._id ? 'bg-black text-white' : 'bg-white text-black hover:bg-zoop-yellow'
                  }`}
                >
                  {currentProductId === product._id ? 'ACTIVE' : 'SWITCH'}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
          {!isLoading && products.length === 0 && (
            <div className="py-10 text-center border-2 border-dashed border-black/10 uppercase font-black italic opacity-20">Warehouse Empty.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
