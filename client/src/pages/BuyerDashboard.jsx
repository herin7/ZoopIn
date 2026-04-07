import { useEffect, useMemo, useState } from 'react';
import { LogOut, Zap, ArrowRight, Play, ShoppingBag, Eye, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black md:px-8 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header Section */}
        <div className="border-[4px] border-black bg-zoop-yellow p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-black p-1 rounded-md">
                  <Zap className="text-zoop-yellow fill-zoop-yellow" size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black">Buyer Hub</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                Welcome, <br className="md:hidden" /> {user?.name?.split(' ')[0] || 'Shopper'}.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-bold text-black/70 leading-tight">
                The stream is moving fast. Catch the drops before they vanish.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="border-2 border-black bg-white px-6 py-2.5 text-sm font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Landing Page
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-2.5 text-sm font-black uppercase tracking-tight text-white shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]"
              >
                <LogOut size={16} />
                Exit
              </motion.button>
            </div>
          </div>
        </div>

        {/* Info & Stats Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] mb-12">
          <motion.div {...fadeInUp} className="border-[4px] border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter decoration-zoop-yellow decoration-[6px] underline underline-offset-4 mb-8">
              Live Guide
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: 'Pick a room', text: 'Check the real-time thumbnails and session titles.' },
                { title: 'Engage live', text: 'Chat, react, and ask questions in the moment.' },
                { title: 'Grab drops', text: 'Spotlights update instantly. Be fast.' },
              ].map((step, i) => (
                <div key={step.title} className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]">
                  <span className="text-3xl font-black text-black/10 absolute -mt-8">0{i + 1}</span>
                  <p className="text-lg font-black uppercase italic tracking-tighter mb-2">{step.title}</p>
                  <p className="text-sm font-bold text-black/60 leading-snug">{step.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="border-[4px] border-black bg-black p-8 shadow-[8px_8px_0px_0px_rgba(244,255,0,1)] text-white">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zoop-yellow mb-6">Market Stats</h2>
            <div className="grid gap-4">
              {[
                { label: 'Active Rooms', value: liveSessions.length, icon: <Play size={18} /> },
                { label: 'Live Viewers', value: liveViewerCount, icon: <Eye size={18} /> },
                { label: 'Total Products', value: products.length, icon: <ShoppingBag size={18} /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between border-2 border-white/20 p-4 bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-zoop-yellow">{stat.icon}</span>
                    <span className="text-sm font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black italic tracking-tighter text-zoop-yellow">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Live Rooms Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[6px] border-black pb-8 mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">Hype Zone</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">Live <span className="bg-black text-white px-3">Sessions</span></h2>
            </div>
            <div className="bg-black text-zoop-yellow px-4 py-2 border-2 border-black font-black uppercase italic tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              {liveSessions.length} Rooms Active
            </div>
          </div>

          {isLoadingLiveSessions ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-zinc-100 border-4 border-black animate-pulse" />)}
            </div>
          ) : liveSessions.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {liveSessions.map((session) => (
                <LiveRoomCard
                  key={session._id}
                  session={session}
                  onOpen={(roomId) => navigate(`/live/${roomId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-black py-20 text-center">
              <span className="text-3xl font-black uppercase opacity-10 italic">Quiet on the set. No live rooms.</span>
            </div>
          )}
        </section>

        {/* Product Catalog Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[6px] border-black pb-8 mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">The Vault</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">Active <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] underline decoration-zoop-yellow decoration-[10px] underline-offset-4">Catalog</span></h2>
            </div>
            <div className="bg-white border-2 border-black px-4 py-2 font-black uppercase italic tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {products.length} Items Listed
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-zinc-100 border-4 border-black animate-pulse" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -8, x: -8, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
                  className="border-[4px] border-black bg-white p-5 transition-all shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]"
                >
                  <div className="aspect-square border-[3px] border-black overflow-hidden bg-zinc-100 relative group">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-50">
                        <ShoppingBag size={40} className="text-black/10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase italic">
                      {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-black uppercase text-black/40 tracking-widest">{product.category || 'General'}</p>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter truncate mt-1">{product.name}</h4>
                    <p className="mt-3 text-2xl font-black italic tracking-tighter text-blue-600">₹{Number(product.price || 0).toFixed(2).toLocaleString()}</p>
                    <p className="mt-3 line-clamp-2 text-sm font-bold text-black/60 leading-snug">
                      {product.description || 'No meta added.'}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full border-2 border-black bg-black py-3 text-sm font-black uppercase italic text-white hover:bg-zoop-yellow hover:text-black transition-colors"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-black py-20 text-center">
              <span className="text-2xl font-black uppercase opacity-10 italic">Warehouse Empty.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BuyerDashboard;
