import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Store, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import LiveRoomCard from '../components/viewer/LiveRoomCard';
import { getDefaultRouteForRole } from '../lib/authRoutes';
import { useAuthStore } from '../store/authStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [liveSessions, setLiveSessions] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      setIsLoading(true);

      try {
        const [liveSessionsResponse, productsResponse] = await Promise.all([
          api.get('/api/sessions/live'),
          api.get('/api/products?isActive=true'),
        ]);

        setLiveSessions(liveSessionsResponse.data.data || []);
        setProducts(productsResponse.data.data || []);
      } catch (error) {
        setLiveSessions([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorefrontData();

    const refreshInterval = window.setInterval(fetchStorefrontData, 20000);
    return () => window.clearInterval(refreshInterval);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gray-900/80 px-5 py-4 shadow-xl shadow-black/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">ZoopIn</p>
            <h1 className="mt-2 text-2xl font-semibold">
              Browse live rooms and shop directly from the stream
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(getDefaultRouteForRole(user.role))}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
                >
                  Open {user.role === 'shop_owner' ? 'studio' : user.role === 'admin' ? 'admin panel' : 'buyer hub'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/register?role=buyer')}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
                >
                  Buyer register
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register?role=shop_owner')}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
                >
                  Become a seller
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login?role=admin')}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400"
                >
                  Admin login
                </button>
              </>
            )}
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.25rem] border border-white/10 bg-gray-900/80 p-6 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">How it works</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight">
              Every active live room is listed here, ready to open in one tap.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
              Buyers browse live rooms with seller-provided thumbnails and descriptions. Shop owners create the session card and go live. Admins keep an eye on questions, viewers, and engagement.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: 'Buyer',
                  icon: <Users size={18} />,
                  description: 'Open any active room, watch the stream, react instantly, and ask product questions.',
                },
                {
                  title: 'Shop Owner',
                  icon: <Store size={18} />,
                  description: 'Add a session thumbnail and short description so buyers can discover your live room.',
                },
                {
                  title: 'Admin',
                  icon: <ShieldCheck size={18} />,
                  description: 'Monitor sessions, answer questions, and watch platform activity in real time.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.5rem] border border-white/10 bg-gray-950/70 p-4"
                >
                  <div className="w-fit rounded-2xl bg-white/5 p-2 text-emerald-300">{card.icon}</div>
                  <p className="mt-3 font-medium text-white">{card.title}</p>
                  <p className="mt-2 text-sm text-gray-400">{card.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/register?role=buyer')}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400"
              >
                <UserPlus size={16} />
                Create buyer account
              </button>
              <button
                type="button"
                onClick={() => navigate('/login?role=buyer')}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
              >
                Buyer login
              </button>
              <button
                type="button"
                onClick={() => navigate('/login?role=shop_owner')}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5"
              >
                Seller login
              </button>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-white/10 bg-gray-900/80 p-6 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Live marketplace</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">What is live right now</h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: 'Active rooms', value: liveSessions.length },
                { label: 'Active products', value: products.length },
                {
                  label: 'Live viewers',
                  value: liveSessions.reduce((total, session) => total + (session.viewerCount || 0), 0),
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-gray-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-gray-400">
              Room codes still power the stream internally, but buyers only see a simple list of active sessions with thumbnails, host details, and product info.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Active live rooms</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Browse all live sessions</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-gray-900/70 px-3 py-1 text-xs text-gray-300">
              {liveSessions.length} live now
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

            {!isLoading && liveSessions.length === 0 && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                No public live sessions yet. When a seller goes live, the room will appear here automatically.
              </div>
            )}

            {isLoading && (
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
              <h3 className="mt-2 text-2xl font-semibold text-white">Featured products</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-gray-900/70 px-3 py-1 text-xs text-gray-300">
              {products.length} active
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {!isLoading && featuredProducts.length === 0 && (
              <div className="rounded-[1.75rem] border border-white/10 bg-gray-900/70 p-6 text-sm text-gray-500">
                No active products yet. Sellers can add products from the studio dashboard.
              </div>
            )}

            {featuredProducts.map((product) => (
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

export default LandingPage;
