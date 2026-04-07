import { useEffect, useState } from 'react';
import { ArrowRight, Eye, ShieldCheck, Store, Users, QrCode, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getDefaultRouteForRole } from '../services/authRoutes';
import LiveStreamCard from '../components/viewer/LiveStreamCard';

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [liveSessions, setLiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionsRes = await api.get('/api/sessions/live');
        setLiveSessions(sessionsRes.data.data || []);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white overflow-x-hidden">

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 z-[100] w-full border-b-[3px] border-black bg-white/80 backdrop-blur-md px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-black p-1.5 rounded-lg shadow-[3px_3px_0px_0px_rgba(244,255,0,1)]">
              <Zap className="text-zoop-yellow fill-zoop-yellow" size={20} />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">ZoopIn</span>
          </motion.div>

          <div className="flex items-center gap-3 md:gap-6">
            <motion.a
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              href="https://github.com/herin7/ZoopIn"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </motion.a>

            <button
              className="hidden text-xs md:text-sm font-black uppercase tracking-tight lg:block hover:text-zoop-yellow transition-colors"
              onClick={() => navigate('/register?role=shop_owner')}
            >
              Become a Seller
            </button>

            {user ? (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ y: 2, x: 2, boxShadow: 'none' }}
                  onClick={() => navigate(getDefaultRouteForRole(user.role))}
                  className="bg-zoop-yellow border-2 border-black px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Studio
                </motion.button>
                <button onClick={logout} className="bg-black px-4 py-1.5 text-xs md:text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,255,0,0.1)]">Exit</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-xs md:text-sm font-black uppercase">Log In</button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98, boxShadow: 'none', x: 2, y: 2 }}
                  onClick={() => navigate('/register')}
                  className="bg-zoop-yellow border-2 border-black px-5 py-2 text-xs md:text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Join Now
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zoop-yellow pt-20">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -left-20 text-black"><Zap size={400} /></motion.div>
          <motion.div animate={{ y: [0, 50, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/2 -right-20 text-black"><Sparkles size={300} /></motion.div>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="z-10 space-y-6 text-center lg:text-left"
          >
            <div className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              🚀 The Future of Shopping
            </div>
            <h1 className="text-[50px] font-black leading-[0.85] tracking-tighter text-black sm:text-[80px] md:text-[100px] lg:text-[110px]">
              LIVE <br className="hidden md:block" />
              <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">MARKET</span> <br />
              DROPS.
            </h1>
            <p className="mx-auto lg:mx-0 max-w-[450px] text-lg md:text-xl font-bold leading-tight text-black/80">
              Stop scrolling, start winning. Real-time auctions, verified grails, and pure vibes.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/feed')}
                className="group flex h-[70px] md:h-[80px] items-center justify-center gap-3 bg-black px-10 text-lg md:text-xl font-black uppercase tracking-tight text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all"
              >
                Enter Feed <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </motion.button>

              <div className="flex items-center justify-center gap-4 border-2 border-black bg-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <QrCode size={50} />
                <div className="text-left leading-none">
                  <p className="text-[10px] font-black uppercase">App Beta</p>
                  <p className="mt-1 text-[10px] font-bold text-black/40 uppercase">Scan to Join</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DASHING PHONE MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto h-[620px] w-[310px] rounded-[3rem] border-[10px] border-black bg-zinc-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
              <motion.img
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity }}
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012"
                className="h-full w-full object-cover opacity-80"
              />

              <div className="absolute top-8 left-6 right-6 flex justify-between items-center">
                <div className="flex items-center gap-2 bg-red-600 px-2 py-0.5 rounded text-[10px] font-black text-white animate-pulse">
                  LIVE
                </div>
                <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1">
                  <Eye size={12} /> 1.8k
                </div>
              </div>

              <div className="absolute bottom-10 left-6 right-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-zoop-yellow overflow-hidden bg-white text-black font-black flex items-center justify-center text-[10px]">HS</div>
                  <div>
                    <p className="text-white font-black text-xs">Herin Soni</p>
                    <p className="text-zoop-yellow text-[10px] font-bold uppercase">Grail Sneakers</p>
                  </div>
                </div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-white border-2 border-black p-2 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(244,255,0,1)]"
                >
                  <div className="h-10 w-10 bg-zinc-100 flex items-center justify-center">
                    <Sparkles size={16} className="text-zinc-400" />
                  </div>
                  <div className="leading-none">
                    <p className="text-[10px] font-black uppercase">AJ1 Retro High</p>
                    <p className="text-blue-600 font-black text-sm">₹22,500</p>
                  </div>
                  <div className="ml-auto bg-black p-1 text-white">
                    <ArrowRight size={14} />
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 top-1/4 bg-white border-2 border-black p-3 shadow-lg">
              <Store className="text-black" />
            </motion.div>
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -left-12 bottom-1/4 bg-zoop-yellow border-2 border-black p-4 shadow-lg rotate-12">
              <Zap className="text-black fill-black" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── LIVE TICKER MARQUEE ─── */}
      <div className="bg-black py-4 overflow-hidden border-y-4 border-black">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-10"
        >
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-4 text-white font-black italic uppercase text-2xl">
              <span className="text-zoop-yellow">●</span> LIVE AUCTIONS NOW <span className="text-zoop-yellow">●</span> 0% SELLER FEES FOR 30 DAYS <span className="text-zoop-yellow">●</span> VERIFIED AUTHENTICITY
            </div>
          ))}
        </motion.div>
      </div>

      {/* ─── LIVE NOW GRID ─── */}
      <section className="bg-white py-24 px-6">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            {...fadeInUp}
            className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-[6px] border-black pb-10 mb-16"
          >
            <div className="text-center md:text-left">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Live <span className="bg-black text-white px-4">Now</span></h2>
              <p className="mt-4 font-bold text-black/50 uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" /> Real-time action
              </p>
            </div>
            <motion.button
              whileHover={{ x: 10 }}
              onClick={() => navigate('/feed')}
              className="group flex items-center gap-4 text-2xl font-black uppercase underline decoration-zoop-yellow decoration-[8px] underline-offset-8"
            >
              View Feed <ArrowRight size={32} />
            </motion.button>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-zinc-100 border-4 border-black animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />)
            ) : liveSessions.length > 0 ? (
              liveSessions.map((session) => (
                <LiveStreamCard key={session._id} session={session} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-black">
                <p className="text-2xl font-black uppercase opacity-20 italic">No live sessions at the moment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── DASHING FEATURES ─── */}
      <section className="bg-zoop-yellow py-24 px-6 border-y-[6px] border-black space-y-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">The <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">Zoop</span> Way.</h2>
            <p className="text-lg font-black uppercase tracking-widest text-black/40">Zero noise. All hype.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Shop Live', icon: <Users size={48} />, text: 'Chat, react, and bid in real-time. No more static images.', bg: 'bg-white' },
              { title: 'Sell Fast', icon: <Store size={48} />, text: 'Turn your inventory into cash in minutes, not days.', bg: 'bg-white' },
              { title: 'Trust First', icon: <ShieldCheck size={48} />, text: 'Every seller is vetted. Every transaction is locked.', bg: 'bg-white' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ rotate: i % 2 === 0 ? 1 : -1 }}
                className={`${f.bg} border-4 border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group`}
              >
                <div className="mb-8 h-20 w-20 bg-zoop-yellow border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter italic">{f.title}</h3>
                <p className="font-bold text-black/60 text-lg leading-snug">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MOBILE CTA ─── */}
      <section className="bg-black py-20 px-6 text-center text-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.9] mb-10">Ready to <br /> <span className="text-zoop-yellow">Join the Hype?</span></h2>
          <div className="flex items-center justify-center gap-3">
            <motion.a
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              href="https://github.com/herin7/ZoopIn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow transition-all text-black"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-zoop-yellow text-black border-2 border-white px-12 py-6 text-2xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white py-20 px-6 border-t-[6px] border-black">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 md:grid-cols-4">
            <div className="col-span-2">
              <span className="text-6xl font-black italic tracking-tighter uppercase">ZoopIn</span>
              <p className="mt-6 max-w-sm text-xl font-bold text-black/60 italic leading-snug">
                Built for the community, <br /> by the community.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, url: 'https://x.com/herinnsoni/', label: 'X (Twitter)' },
                  { icon: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>, url: 'https://github.com/herin7', label: 'GitHub' },
                  { icon: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>, url: 'https://www.linkedin.com/in/herinsoni/', label: 'LinkedIn' },
                  { icon: <Sparkles size={22} />, url: 'https://herin.vercel.app/', label: 'Portfolio' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    whileHover={{ scale: 1.1, rotate: 5, backgroundColor: '#f4ff00' }}
                    whileTap={{ scale: 0.9 }}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 w-12 border-2 border-black flex items-center justify-center bg-white text-black cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    title={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 underline decoration-zoop-yellow decoration-4 underline-offset-4">Platform</h4>
              <ul className="space-y-4 font-black uppercase text-sm">
                <li className="hover:translate-x-2 transition-transform cursor-pointer" onClick={() => navigate('/feed')}>Browse Feed</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer" onClick={() => navigate('/register?role=shop_owner')}>Seller Portal</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer">Safety Guidelines</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 underline decoration-zoop-yellow decoration-4 underline-offset-4">Legal</h4>
              <ul className="space-y-4 font-black uppercase text-sm">
                <li className="hover:translate-x-2 transition-transform cursor-pointer">Terms of Service</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer">Privacy Policy</li>
                <li className="hover:translate-x-2 transition-transform cursor-pointer">Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-20 border-t-4 border-black pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black uppercase">© {new Date().getFullYear()} ZoopIn INC.</p>
            <p className="text-xs font-black uppercase italic text-black/40">Made by Herin Soni</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;