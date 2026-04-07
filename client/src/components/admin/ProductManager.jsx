import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Sparkles, UploadCloud } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-yellow">Current Spotlight</p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {currentProduct?.name || 'No product is live yet'}
            </h3>
          </div>
          {currentProduct && (
            <div className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs text-brand-yellow">
              Live product
            </div>
          )}
        </div>
        {currentProduct && (
          <p className="mt-2 text-sm text-gray-400">{currentProduct.description || 'No description provided.'}</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-blue/10 p-2 text-brand-blue">
            <ImagePlus size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Add Product</h3>
            <p className="text-sm text-gray-500">Upload a product and make it available in the stream.</p>
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleCreateProduct}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={formValues.name}
              onChange={(event) => setFormValues((state) => ({ ...state, name: event.target.value }))}
              required
              placeholder="Product name"
              className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
            <input
              value={formValues.price}
              onChange={(event) => setFormValues((state) => ({ ...state, price: event.target.value }))}
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
            <input
              value={formValues.category}
              onChange={(event) => setFormValues((state) => ({ ...state, category: event.target.value }))}
              placeholder="Category"
              className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
            <input
              value={formValues.stock}
              onChange={(event) => setFormValues((state) => ({ ...state, stock: event.target.value }))}
              type="number"
              min="0"
              placeholder="Stock"
              className="rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </div>
          <textarea
            value={formValues.description}
            onChange={(event) => setFormValues((state) => ({ ...state, description: event.target.value }))}
            placeholder="Description"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-blue"
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) {
                setSelectedFile(file);
              }
            }}
            className={`rounded-2xl border border-dashed px-4 py-8 text-center transition ${
              isDragging ? 'border-brand-blue bg-brand-blue/10' : 'border-white/10 bg-black/40'
            }`}
          >
            <UploadCloud className="mx-auto text-gray-500" size={26} />
            <p className="mt-3 text-sm text-gray-200">
              Drag and drop a product image here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-bold text-brand-blue"
              >
                browse files
              </button>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'PNG or JPG works best for product cards.'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            {isSubmitting ? 'Saving product...' : 'Add Product'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Uploaded Products</h3>
            <p className="text-sm text-gray-500">Choose the product that should be shown next in the live room.</p>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:border-white/20 hover:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-sm text-gray-400">
              <LoaderCircle className="mr-2 animate-spin" size={16} />
              Loading products...
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-center text-sm text-gray-500">
              No products yet. Add your first product above to start showcasing items live.
            </div>
          )}

          {products.map((product) => (
            <div
              key={product._id}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                currentProductId === product._id
                  ? 'border-brand-yellow/50 bg-brand-yellow/10'
                  : 'border-white/10 bg-black/40'
              }`}
            >
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-800">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-600">
                    <Sparkles size={18} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{product.name}</p>
                <p className="text-sm font-bold text-brand-blue">₹{Number(product.price || 0).toFixed(2)}</p>
              </div>

              <button
                type="button"
                onClick={() => handleProductSwitch(product)}
                className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                {currentProductId === product._id ? 'Currently Live' : 'Set as Current Product'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
