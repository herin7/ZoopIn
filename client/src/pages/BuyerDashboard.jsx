import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import LiveRoomCard from '../components/viewer/LiveRoomCard';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const BuyerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingLiveSessions, setIsLoadingLiveSessions] = useState(true);

  const liveViewerCount = useMemo(
    () => liveSessions.reduce((total, session) => total + (session.viewerCount || 0), 0),
    [liveSessions]
  );

  useEffect(() => {
    const fetchBuyerData = async () => {
      setIsLoadingProducts(true);
      setIsLoadingLiveSessions(true);

      try {
        const [productsResponse, liveSessionsResponse] = await Promise.all([
          api.get('/api/products?isActive=true'),
          api.get('/api/sessions/live'),
        ]);

        setProducts(productsResponse.data.data || []);
        setLiveSessions(liveSessionsResponse.data.data || []);
      } catch (error) {
        setProducts([]);
        setLiveSessions([]);
        addToast({
          title: 'Unable to load buyer dashboard',
          message: error.response?.data?.message || 'Please try again in a moment.',
          tone: 'error',
        });
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingLiveSessions(false);
      }
    };

    fetchBuyerData();

    const refreshInterval = window.setInterval(fetchBuyerData, 20000);
    return () => window.clearInterval(refreshInterval);
  }, [addToast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-gray-900/80 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Buyer hub</p>
              <h1 className="mt-2 text-3xl font-semibold">Welcome back, {user?.name || 'shopper'}</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Browse every active room, open the live stream, react instantly, and ask questions while the seller is presenting.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
              >
                Explore landing page
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gray-900/75 p-6 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">How to use</p>
            <h2 className="mt-3 text-3xl font-semibold">Shop from the live rooms list</h2>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: 'Pick a room',
                  description: 'Each live card shows the seller thumbnail, stream title, and what is being showcased.',
                },
                {
                  title: 'Join and engage',
                  description: 'Open the stream, send reactions, and ask product questions in real time.',
                },
                {
                  title: 'Track products',
                  description: 'Watch the product spotlight update live as the seller switches featured items.',
                },
              ].map((step) => (
                <div key={step.title} className="rounded-[1.5rem] border border-white/10 bg-gray-950/70 p-4">
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="mt-2 text-sm text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gray-900/75 p-6 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Live marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold">Your shopping snapshot</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: 'Active rooms', value: liveSessions.length },
                { label: 'Live viewers', value: liveViewerCount },
                { label: 'Active products', value: products.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-gray-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-gray-400">
              Sellers now provide a thumbnail and short description for each session, so you can choose the right live room without dealing with room codes.
            </p>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Active live rooms</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Join a live session</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-gray-900/70 px-3 py-1 text-xs text-gray-300">
              {liveSessions.length} rooms available
            </div>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveSessions.map((session) => (
              <LiveRoomCard
                key={session._id}
                session={session}
                onOpen={(roomId) => navigate(`/live/${roomId}`)}
              />
            ))}

            {!isLoadingLiveSessions && liveSessions.length === 0 && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                No live rooms are active right now.
              </div>
            )}

            {isLoadingLiveSessions && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                Loading active rooms...
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Product catalog</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Browse active products</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-gray-900/70 px-3 py-1 text-xs text-gray-300">
              {products.length} products
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoadingProducts && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                Loading products...
              </div>
            )}

            {!isLoadingProducts && products.length === 0 && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                No active products are listed yet.
              </div>
            )}

            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-4 shadow-lg shadow-black/20"
              >
                <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-gray-950">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">Rs. {Number(product.price || 0).toFixed(2)}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-400">
                    {product.description || 'No description added yet.'}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                  <span>{product.category || 'General'}</span>
                  <span>{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuyerDashboard;
