import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Sparkles, UploadCloud, Zap, ShoppingBag, Plus, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
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
    () => products.find((p) => p._id === currentProductId) || null,
    [currentProductId, products]
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await api.get('/api/products?isActive=true');
      setProducts(resp.data.data || []);
    } catch (error) {
      addToast({ title: 'Load Failed', message: error.response?.data?.message, tone: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(formValues).forEach(([k, v]) => v !== '' && payload.append(k, v));
      if (selectedFile) payload.append('images', selectedFile);

      const resp = await api.post('/api/products', payload);
      setProducts(prev => [resp.data.data, ...prev]);
      setFormValues(emptyFormState);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast({ title: 'Product Added', message: 'Ready for display.', tone: 'success' });
    } catch (error) {
      addToast({ title: 'Save Failed', message: error.response?.data?.message, tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSwitch = (product) => {
    if (!session || !socket) {
      addToast({ title: 'Signal Required', message: 'Initialize session first.', tone: 'warning' });
      return;
    }
    socket.emit('product:switch', { roomId: session.roomId, sessionId: session._id, productId: product._id });
    onCurrentProductChange?.(product);
    addToast({ title: 'Showcase Updated', message: `${product.name} is now LIVE.`, tone: 'success' });
  };

  return (
    <div className="space-y-8 selection:bg-black selection:text-white font-sans">

      {/* Current Spotlight */}
      <div className="border-[3px] border-black bg-zoop-yellow p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <Zap className="absolute -right-4 -top-4 opacity-10 rotate-12" size={100} />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">Live Focus</p>
          <div className="flex items-center gap-3">
            <div className="bg-black text-zoop-yellow p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(244,255,0,1)]">
              <ShoppingBag size={20} />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter truncate leading-none">
              {currentProduct?.name || 'No Product Active'}
            </h3>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="bg-black text-white p-1" size={24} />
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Commit Drop</h3>
        </div>

        <form className="space-y-4" onSubmit={handleCreateProduct}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={formValues.name}
              onChange={e => setFormValues(s => ({ ...s, name: e.target.value }))}
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold focus:bg-zoop-yellow/5 outline-none"
              placeholder="Product Name"
            />
            <input
              required
              type="number"
              value={formValues.price}
              onChange={e => setFormValues(s => ({ ...s, price: e.target.value }))}
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold focus:bg-zoop-yellow/5 outline-none"
              placeholder="Price (₹)"
            />
          </div>
          <textarea
            rows={2}
            value={formValues.description}
            onChange={e => setFormValues(s => ({ ...s, description: e.target.value }))}
            className="w-full border-2 border-black bg-white p-3 text-sm font-bold focus:bg-zoop-yellow/5 outline-none"
            placeholder="Hype description..."
          />

          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setSelectedFile(f); }}
            className={`border-2 border-dashed p-6 text-center transition-all ${isDragging ? 'border-black bg-zoop-yellow/10' : 'border-black/20 bg-zinc-50'}`}
          >
            <UploadCloud className="mx-auto text-black/20 mb-2" size={32} />
            <div className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {selectedFile ? <span className="bg-black text-white px-2 py-1">{selectedFile.name}</span> : 'Drop asset or Browse'}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 font-black uppercase italic tracking-tighter text-xl shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] disabled:bg-zinc-800 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Layers size={20} />}
            {isSubmitting ? 'SAVING...' : 'COMMIT DROP'}
          </motion.button>
        </form>
      </div>

      {/* Inventory */}
      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Inventory</h3>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : 'cursor-pointer'} onClick={fetchProducts} />
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {products.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-4 border-[3px] border-black p-3 transition-all ${currentProductId === p._id ? 'bg-zoop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
              >
                <div className="h-12 w-12 border-2 border-black bg-black flex-shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt="p" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase truncate">{p.name}</p>
                  <p className="font-black text-blue-600">₹{Number(p.price || 0).toFixed(0)}</p>
                </div>
                <button
                  onClick={() => handleProductSwitch(p)}
                  className={`px-3 py-1.5 border-2 border-black font-black uppercase italic text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${currentProductId === p._id ? 'bg-black text-white' : 'bg-white hover:bg-zoop-yellow'}`}
                >
                  {currentProductId === p._id ? 'ACTIVE' : 'SWITCH'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
