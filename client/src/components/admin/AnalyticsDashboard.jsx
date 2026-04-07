import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Flame, Heart, Users, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsDashboard = ({ socket, sessionId, reactionCounts }) => {
  const { currentStats, historicalData, peakViewers } = useAnalytics(socket);
  const [initialSnapshots, setInitialSnapshots] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!sessionId) {
        setInitialSnapshots([]);
        return;
      }

      try {
        const response = await api.get(`/api/analytics/${sessionId}`);
        setInitialSnapshots(response.data.data.timeseries || []);
      } catch {
        setInitialSnapshots([]);
      }
    };

    fetchAnalytics();
  }, [sessionId]);

  const mergedData = useMemo(() => {
    const liveEntries = historicalData.map((item) => ({
      ...item,
      timestamp: item.timestamp || new Date().toISOString(),
    }));

    const uniqueEntries = [...initialSnapshots, ...liveEntries].reduce((entries, currentEntry) => {
      const key = `${currentEntry.timestamp}-${currentEntry.viewerCount}-${currentEntry.reactionCount}`;
      if (!entries.some((entry) => entry.key === key)) {
        entries.push({
          key,
          ...currentEntry,
        });
      }
      return entries;
    }, []);

    return uniqueEntries.slice(-30).map(({ ...entry }) => ({
      ...entry,
      label: new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [historicalData, initialSnapshots]);

  const totalReactionCount = Object.values(reactionCounts || {}).reduce(
    (total, count) => total + count,
    0
  );

  const reactionBreakdown = [
    { key: 'like', label: '👍 Likes', value: reactionCounts?.like || 0, color: '#f4ff00' },
    { key: 'fire', label: '🔥 Fire', value: reactionCounts?.fire || 0, color: '#dc2626' },
    { key: 'heart', label: '❤️ Hearts', value: reactionCounts?.heart || 0, color: '#db2777' },
    { key: 'wow', label: '😮 Wow', value: reactionCounts?.wow || 0, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 selection:bg-black selection:text-white">
      
      {/* High-Level Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Current Viewers',
            value: currentStats.viewerCount,
            subtitle: `Peak ${peakViewers}`,
            icon: <Users size={20} />,
          },
          {
            title: 'Total Reactions',
            value: totalReactionCount || 0,
            subtitle: 'Blast signals',
            icon: <Flame size={20} />,
          },
          {
            title: 'Engagement',
            value: `${((currentStats.engagementRate || 0) * 100).toFixed(1)}%`,
            subtitle: `${currentStats.questionCount || 0} Questions`,
            icon: <Activity size={20} />,
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="border-[3px] border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{card.title}</p>
              <div className="bg-black text-zoop-yellow p-1.5 border-2 border-black">
                 {card.icon}
              </div>
            </div>
            <p className="text-4xl font-black uppercase italic tracking-tighter text-black leading-none">{card.value}</p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-black/30 flex items-center gap-2">
               <TrendingUp size={12} className="text-zoop-yellow" /> {card.subtitle}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="border-[4px] border-black bg-black p-6 shadow-[10px_10px_0px_0px_rgba(244,255,0,1)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-zoop-yellow text-black p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Live Amplitude</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Viewer frequency snapshot</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {mergedData.length === 0 ? (
            <div className="flex h-full items-center justify-center border-2 border-dashed border-white/20 bg-white/5">
              <span className="text-sm font-black uppercase italic tracking-tighter text-white/20">Awaiting Data Points...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000000',
                    border: '3px solid #FEF102',
                    borderRadius: '0px',
                    color: '#ffffff',
                    fontFamily: 'Spline Sans',
                    fontWeight: 900,
                  }}
                  itemStyle={{ color: '#FEF102' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="viewerCount" 
                  stroke="#FEF102" 
                  strokeWidth={4} 
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Reaction Breakdown Section */}
      <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-zoop-yellow border-2 border-black p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Reaction Delta</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Which vibes are hitting hardest</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reactionBreakdown.map((reaction) => {
            const percentage = totalReactionCount > 0 ? (reaction.value / totalReactionCount) * 100 : 0;

            return (
              <div key={reaction.key} className="border-2 border-black p-4 bg-zinc-50 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-sm font-black uppercase italic tracking-tighter">{reaction.label}</span>
                  <span className="text-sm font-black bg-black text-white px-2 py-0.5">{reaction.value}</span>
                </div>
                <div className="h-6 border-2 border-black bg-white relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full"
                    style={{ backgroundColor: reaction.color }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest mix-blend-difference text-white">
                    {percentage.toFixed(1)}% Intensity
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
