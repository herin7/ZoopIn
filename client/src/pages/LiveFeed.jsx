import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import api from '../lib/api';
import LiveFeedSlide from '../components/viewer/LiveFeedSlide';

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
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-brand-yellow" />
          <p className="text-sm text-gray-400">Loading live sessions...</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <div className="animate-slide-up">
          <Radio size={48} className="mx-auto text-brand-yellow opacity-60" />
          <h2 className="mt-6 text-2xl font-bold text-white">No live sessions right now</h2>
          <p className="mt-3 max-w-sm text-sm text-gray-400">
            When a seller goes live, their stream will appear here. Come back soon!
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-8 rounded-full bg-brand-yellow px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {/* ── Header bar ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 gradient-feed-top">
        <div className="pointer-events-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="glass-dark inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white text-shadow-sm">
              {sessions.length} Live
            </span>
          </div>

          <div className="glass-dark rounded-full px-3 py-2 text-xs font-medium text-gray-300">
            {activeIndex + 1}/{sessions.length}
          </div>
        </div>
      </div>

      {/* ── Vertical snap-scroll feed ── */}
      <div ref={containerRef} className="feed-scroll h-full w-full">
        {sessions.map((session, index) => (
          <LiveFeedSlide
            key={session._id}
            session={session}
            index={index}
            isActive={index === activeIndex}
          />
        ))}
      </div>

      {/* ── Scroll Progress Indicator ── */}
      <div className="absolute left-0 top-0 z-40 h-1 bg-brand-yellow transition-all duration-300" style={{ width: `${((activeIndex + 1) / sessions.length) * 100}%` }} />

      {/* ── Navigation arrows (desktop) ── */}
      <div className="pointer-events-none absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => scrollTo('up')}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30"
        >
          <ChevronUp size={20} />
        </button>
        <button
          type="button"
          disabled={activeIndex === sessions.length - 1}
          onClick={() => scrollTo('down')}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
};

export default LiveFeed;
