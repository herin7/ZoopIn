import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Radio, Zap, Activity, Signal, LayoutGrid } from 'lucide-react';
import api from '../services/api';
import LiveFeedSlide from '../components/viewer/LiveFeedSlide';
import { motion, AnimatePresence } from 'framer-motion';

const REFRESH_INTERVAL_MS = 15000;

const LiveFeed = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [sessions, setSessions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await api.get('/api/sessions/live');
      const liveSessions = response.data.data || [];
      setSessions(liveSessions);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = window.setInterval(fetchSessions, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchSessions]);

  /* Track which slide is visible using IntersectionObserver */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [sessions]);

  const scrollTo = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const nextIndex =
      direction === 'up'
        ? Math.max(0, activeIndex - 1)
        : Math.min(sessions.length - 1, activeIndex + 1);

    const target = container.querySelector(`[data-index="${nextIndex}"]`);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black overflow-hidden relative font-sans">
        <Zap className="text-zoop-yellow fill-zoop-yellow opacity-10 absolute scale-[5]" />
        <div className="z-10 text-center">
          <div className="h-20 w-20 border-[6px] border-zoop-yellow border-t-white animate-spin mx-auto mb-8 bg-black shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)]" />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">SYNCING FEED...</h2>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zoop-yellow px-6 text-center select-none overflow-hidden relative font-sans">
        <Zap className="text-black opacity-5 absolute scale-[8] rotate-12" />
        <div className="z-10 max-w-xl border-[6px] border-black bg-white p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <Radio size={80} className="mx-auto text-black mb-8" />
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">SIGNAL<br /> LOST.</h2>
          <p className="text-xl font-bold text-black/60 leading-tight mb-10">
            The marketplace is quiet. Sellers are prepping the next major drop. Hang tight.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full bg-black text-white py-5 font-black uppercase italic tracking-tighter text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
          >
            RETURN TO BASE
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black selection:bg-zoop-yellow selection:text-black touch-none overflow-hidden font-sans">

      {/* ── Progress Indicator ── */}
      <div className="absolute top-0 left-0 z-50 h-[8px] bg-white transition-all duration-500 ease-out border-b-2 border-black" style={{ width: `${((activeIndex + 1) / sessions.length) * 100}%` }}>
        <div className="h-full bg-zoop-yellow w-full shadow-[0px_0px_20px_#f4ff00]" />
      </div>

      {/* ── Header bar ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 p-4 sm:p-6 lg:p-8 flex items-start justify-between">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/')}
          className="pointer-events-auto bg-black border-2 border-white px-4 py-2 text-white font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 hover:bg-zoop-yellow hover:text-black hover:border-black transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Home
        </motion.button>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 bg-red-600 border-2 border-black px-4 py-1 text-white font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] animate-pulse"
          >
            <Activity size={14} strokeWidth={3} /> {sessions.length} CHANNELS LIVE
          </motion.div>
          <div className="flex gap-2">
            <div className="bg-white border-2 border-black px-4 py-1 text-black font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
              DROP {activeIndex + 1} / {sessions.length}
            </div>
            <button onClick={() => navigate('/buyer')} className="bg-white border-2 border-black p-1 hover:bg-zoop-yellow transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
              <LayoutGrid size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Vertical snap-scroll feed ── */}
      <div ref={containerRef} className="feed-scroll h-full w-full bg-black scrollbar-hide">
        {sessions.map((session, index) => (
          <LiveFeedSlide
            key={session._id}
            session={session}
            index={index}
            isActive={index === activeIndex}
          />
        ))}
      </div>

      {/* ── Navigation arrows (desktop) ── */}
      <div className="pointer-events-none absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 sm:flex lg:right-10">
        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9, x: 0 }}
          disabled={activeIndex === 0}
          onClick={() => scrollTo('up')}
          className="pointer-events-auto h-12 w-12 flex items-center justify-center border-[3px] border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 transition-all hover:bg-zoop-yellow"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9, x: 0 }}
          disabled={activeIndex === sessions.length - 1}
          onClick={() => scrollTo('down')}
          className="pointer-events-auto h-12 w-12 flex items-center justify-center border-[3px] border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 transition-all hover:bg-zoop-yellow"
        >
          <ChevronDown size={24} strokeWidth={3} />
        </motion.button>
      </div>

      {/* ── Global Animated Elements ── */}
      <div className="absolute bottom-10 left-10 pointer-events-none z-10 hidden lg:block overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="h-[2px] w-40 bg-white/20" />
          <div className="flex items-center gap-2">
            <Signal size={20} className="text-zoop-yellow" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic">HYPE-RADAR-V3</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveFeed;
