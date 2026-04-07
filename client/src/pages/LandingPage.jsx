import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Eye, PlayCircle, ShieldCheck, ShoppingBag, Store, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { getDefaultRouteForRole } from '../lib/authRoutes';

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [liveSessions, setLiveSessions] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sessionsRes, productsRes] = await Promise.all([
          api.get('/api/sessions/live'),
          api.get('/api/products?isActive=true'),
        ]);
        setLiveSessions(sessionsRes.data.data || []);
        setProducts(productsRes.data.data || []);
      } catch {
        setLiveSessions([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = window.setInterval(fetchData, 20000);
    return () => window.clearInterval(interval);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const totalViewers = liveSessions.reduce((t, s) => t + (s.viewerCount || 0), 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* ════════ Navbar ════════ */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tight">ZoopIn</span>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(getDefaultRouteForRole(user.role))}
                  className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-black border border-black/10 transition hover:brightness-105"
                >
                  Open {user.role === 'shop_owner' ? 'studio' : user.role === 'admin' ? 'admin' : 'dashboard'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-black border border-black/10 transition hover:brightness-105"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ════════ Hero Section ════════ */}
      <section className="relative overflow-hidden bg-brand-yellow">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          {/* Left content */}
          <div className="max-w-[600px]">
            <p className="text-sm font-semibold uppercase tracking-widest text-black/60">
              Live Commerce Platform
            </p>
            <h1 className="mt-4 text-[44px] font-bold leading-[1.15] text-black lg:text-[56px]">
              Shop live.<br />React live.<br />Sell live.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-800">
              Watch sellers demonstrate products in real time, ask questions on the spot,
              react instantly, and never miss a live deal again.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue-hover"
              >
                <PlayCircle size={18} />
                Browse live streams
              </button>
              <button
                type="button"
                onClick={() => navigate('/register?role=shop_owner')}
                className="rounded-full border border-black px-5 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Start selling live
              </button>
            </div>
          </div>

          {/* Right — stats + live preview */}
          <div className="relative">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-card-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Live now', value: liveSessions.length, color: 'text-red-500' },
                  { label: 'Products', value: products.length, color: 'text-brand-blue' },
                  { label: 'Viewers', value: totalViewers, color: 'text-black' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-gray-50 p-4">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {liveSessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/feed')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <PlayCircle size={16} />
                  Watch live feed
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ How It Works (dark section) ════════ */}
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-[1280px] px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-yellow">
            How it works
          </p>
          <h2 className="mt-4 text-[36px] font-bold leading-tight lg:text-[44px]">
            Three roles, one platform
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            Every live commerce experience flows through buyers, sellers, and admins working together in real time.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Buyer',
                icon: <Users size={24} />,
                description:
                  'Scroll through live sessions, watch streams, react with emojis, and ask product questions in real time.',
                accent: 'bg-brand-yellow text-black',
              },
              {
                title: 'Shop Owner',
                icon: <Store size={24} />,
                description:
                  'Upload products, create sessions with thumbnails, go live with your camera, and manage the showcase.',
                accent: 'bg-brand-blue text-white',
              },
              {
                title: 'Admin',
                icon: <ShieldCheck size={24} />,
                description:
                  'Monitor all live sessions, moderate questions, track analytics, and manage platform health.',
                accent: 'bg-white text-black',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
              >
                <div className={`inline-flex rounded-xl p-3 ${card.accent}`}>{card.icon}</div>
                <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Live Sessions Grid ════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Live right now
              </p>
              <h2 className="mt-2 text-[32px] font-bold text-black">Active sessions</h2>
            </div>
            {liveSessions.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-hover"
              >
                Open feed <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session) => {
              const image =
                session.thumbnail || session.currentProduct?.images?.[0] || '';
              return (
                <div
                  key={session._id}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition hover:shadow-card-lg hover:border-gray-300"
                  onClick={() => navigate(`/live/${session.roomId}`)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={session.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-yellow/20 to-brand-blue/10">
                        <ShoppingBag size={40} className="text-gray-300" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        LIVE
                      </span>
                    </div>

                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
                      <Eye size={12} />
                      {session.viewerCount || 0}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                        {session.hostName || session.hostId?.split('@')[0] || 'Live seller'}
                      </p>
                      <p className="mt-1 text-sm font-bold text-white line-clamp-2">
                        {session.title}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500">
                      {session.currentProduct?.name || 'Stream in progress'}
                    </p>
                  </div>
                </div>
              );
            })}

            {!isLoading && liveSessions.length === 0 && (
              <div className="col-span-full rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <PlayCircle size={40} className="mx-auto text-gray-300" />
                <p className="mt-4 font-semibold text-gray-600">No live sessions right now</p>
                <p className="mt-2 text-sm text-gray-400">
                  When a seller goes live, their stream will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ Featured Products ════════ */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto max-w-[1280px] px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Product catalog
            </p>
            <h2 className="mt-2 text-[32px] font-bold text-black">Featured products</h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft transition hover:shadow-card"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-black">{product.name}</p>
                    <p className="mt-1 text-lg font-bold text-brand-blue">
                      ₹{Number(product.price || 0).toFixed(2)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                      {product.description || 'No description added.'}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-400">
                      <span>{product.category || 'General'}</span>
                      <span>{product.stock} in stock</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ Footer ════════ */}
      <footer className="bg-black py-16 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-6 md:grid-cols-3">
          <div>
            <span className="text-xl font-bold">ZoopIn</span>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              The live commerce platform for real-time product demos, instant reactions, and interactive shopping.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Platform</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              <li>
                <button type="button" onClick={() => navigate('/feed')} className="hover:text-white transition">
                  Live feed
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/register?role=shop_owner')} className="hover:text-white transition">
                  Become a seller
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/login?role=admin')} className="hover:text-white transition">
                  Admin login
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Built by</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              <li>
                <a href="https://herin.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Herin Soni
                </a>
              </li>
              <li>
                <a href="https://github.com/herin7/ZoopIn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1280px] border-t border-white/10 px-6 pt-6">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} ZoopIn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
