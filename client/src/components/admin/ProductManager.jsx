import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useToastStore } from '../../store/toastStore';

const emptyFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  isActive: true,
};

const getProductFormState = (product) => ({
  name: product?.name || '',
  description: product?.description || '',
  price: product?.price?.toString?.() || '',
  category: product?.category || '',
  stock: product?.stock?.toString?.() || '',
  isActive: product?.isActive ?? true,
});

const ProductManager = ({ session, socket, currentProductId, onCurrentProductChange }) => {
  const addToast = useToastStore((state) => state.addToast);
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formValues, setFormValues] = useState(emptyFormState);

  const currentProduct = useMemo(
    () => products.find((product) => product._id === currentProductId) || null,
    [currentProductId, products]
  );

  const isEditing = Boolean(editingProductId);

  const resetForm = useCallback(() => {
    setEditingProductId(null);
    setFormValues(emptyFormState);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/products');
      setProducts(response.data.data || []);
    } catch (error) {
      addToast({
        title: 'Load failed',
        message: error.response?.data?.message || 'Unable to load inventory.',
        tone: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          payload.append(key, typeof value === 'boolean' ? String(value) : value);
        }
      });

      if (selectedFile) {
        payload.append('images', selectedFile);
      }

      const response = isEditing
        ? await api.put(`/api/products/${editingProductId}`, payload)
        : await api.post('/api/products', payload);

      const savedProduct = response.data.data;

      setProducts((currentProducts) =>
        isEditing
          ? currentProducts.map((product) =>
              product._id === savedProduct._id ? savedProduct : product
            )
          : [savedProduct, ...currentProducts]
      );

      if (currentProductId === savedProduct._id) {
        onCurrentProductChange?.(savedProduct.isActive ? savedProduct : null);
      }

      resetForm();
      addToast({
        title: isEditing ? 'Item updated' : 'Item added',
        message: isEditing
          ? 'Inventory changes are live in your studio.'
          : 'Ready for display in your inventory.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: isEditing ? 'Update failed' : 'Save failed',
        message: error.response?.data?.message || 'Unable to save this item.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSwitch = (product) => {
    if (!product.isActive) {
      addToast({
        title: 'Item is inactive',
        message: 'Reactivate the item before featuring it live.',
        tone: 'warning',
      });
      return;
    }

    if (!session || !socket) {
      addToast({
        title: 'Signal required',
        message: 'Initialize a session first.',
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
      message: `${product.name} is now live.`,
      tone: 'success',
    });
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setFormValues(getProductFormState(product));
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Remove "${product.name}" from this inventory? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/products/${product._id}`);

      setProducts((currentProducts) =>
        currentProducts.filter((currentProductItem) => currentProductItem._id !== product._id)
      );

      if (editingProductId === product._id) {
        resetForm();
      }

      if (currentProductId === product._id) {
        onCurrentProductChange?.(null);

        if (session && socket) {
          socket.emit('product:switch', {
            roomId: session.roomId,
            sessionId: session._id,
            productId: null,
          });
        }
      }

      addToast({
        title: 'Item removed',
        message: 'The product has been deleted from this inventory.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Delete failed',
        message: error.response?.data?.message || 'Unable to remove this item.',
        tone: 'error',
      });
    }
  };

  return (
    <div className="space-y-8 font-sans selection:bg-black selection:text-white">
      <div className="relative overflow-hidden border-[3px] border-black bg-zoop-yellow p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <Zap className="absolute -right-4 -top-4 rotate-12 opacity-10" size={100} />
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
            Live Focus
          </p>
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-black p-2 text-zoop-yellow shadow-[3px_3px_0px_0px_rgba(244,255,0,1)]">
              <ShoppingBag size={20} />
            </div>
            <h3 className="truncate text-xl font-black uppercase italic tracking-tighter leading-none">
              {currentProduct?.name || 'No Item Active'}
            </h3>
          </div>
        </div>
      </div>

      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Plus className="bg-black p-1 text-white" size={24} />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              {isEditing ? 'Edit Item' : 'Add Item'}
            </h3>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={formValues.name}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  name: event.target.value,
                }))
              }
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
              placeholder="Item Name"
            />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  price: event.target.value,
                }))
              }
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
              placeholder="Price (INR)"
            />
          </div>

          <textarea
            rows={2}
            value={formValues.description}
            onChange={(event) =>
              setFormValues((currentValues) => ({
                ...currentValues,
                description: event.target.value,
              }))
            }
            className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
            placeholder="Product description"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={formValues.category}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  category: event.target.value,
                }))
              }
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
              placeholder="Category"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={formValues.stock}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  stock: event.target.value,
                }))
              }
              className="w-full border-2 border-black bg-white p-3 text-sm font-bold outline-none focus:bg-zoop-yellow/5"
              placeholder="Stock"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 border-2 border-black bg-zinc-50 p-3">
            <input
              type="checkbox"
              checked={formValues.isActive}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-black"
            />
            <span className="text-xs font-black uppercase tracking-widest">
              Keep this item active in the storefront
            </span>
          </label>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const droppedFile = event.dataTransfer.files?.[0];
              if (droppedFile) {
                setSelectedFile(droppedFile);
              }
            }}
            className={`border-2 border-dashed p-6 text-center transition-all ${
              isDragging ? 'border-black bg-zoop-yellow/10' : 'border-black/20 bg-zinc-50'
            }`}
          >
            <UploadCloud className="mx-auto mb-2 text-black/20" size={32} />
            <div
              className="cursor-pointer text-[10px] font-black uppercase tracking-widest"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <span className="bg-black px-2 py-1 text-white">{selectedFile.name}</span>
              ) : (
                'Drop asset or browse'
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-black py-4 text-xl font-black uppercase italic tracking-tighter text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] disabled:bg-zinc-800"
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : isEditing ? <Check size={20} /> : <Plus size={20} />}
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
          </motion.button>
        </form>
      </div>

      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Your Inventory</h3>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.25em] text-black/40">
              Owner-scoped catalog with full item CRUD
            </p>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            className="border-2 border-black bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[430px] space-y-3 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border-[3px] border-black p-3 transition-all ${
                  currentProductId === product._id
                    ? 'bg-zoop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-black bg-black">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="truncate text-xs font-black uppercase">{product.name}</p>
                        <p className="font-black text-blue-600">
                          INR {Number(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                          product.isActive ? 'bg-white' : 'bg-zinc-200 text-black/70'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs font-bold text-black/60">
                      {product.description || 'No description added yet.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-black/60">
                      <span>Category: {product.category || 'General'}</span>
                      <span>Stock: {product.stock ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleProductSwitch(product)}
                    disabled={!product.isActive}
                    className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      currentProductId === product._id
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-zoop-yellow'
                    } disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-black/50`}
                  >
                    {currentProductId === product._id ? 'Active' : 'Feature Live'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditProduct(product)}
                    className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                    className="inline-flex items-center gap-2 border-2 border-black bg-red-100 px-3 py-1.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-200"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLoading && products.length === 0 && (
            <div className="border-2 border-dashed border-black p-10 text-center">
              <p className="text-sm font-black uppercase italic tracking-tighter text-black/30">
                No items in this inventory yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
