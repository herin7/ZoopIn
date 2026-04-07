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
import { Activity, Flame, Heart, Users } from 'lucide-react';
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
      } catch (error) {
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

    return uniqueEntries.slice(-30).map(({ key, ...entry }) => ({
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
    { key: 'like', label: '👍 Likes', value: reactionCounts?.like || 0 },
    { key: 'fire', label: '🔥 Fire', value: reactionCounts?.fire || 0 },
    { key: 'heart', label: '❤️ Hearts', value: reactionCounts?.heart || 0 },
    { key: 'wow', label: '😮 Wow', value: reactionCounts?.wow || 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Current Viewers',
            value: currentStats.viewerCount,
            subtitle: `Peak ${peakViewers}`,
            icon: <Users size={18} />,
          },
          {
            title: 'Total Reactions',
            value: totalReactionCount,
            subtitle: 'Across all reaction types',
            icon: <Flame size={18} />,
          },
          {
            title: 'Engagement Rate',
            value: `${((currentStats.engagementRate || 0) * 100).toFixed(1)}%`,
            subtitle: `${currentStats.questionCount || 0} questions so far`,
            icon: <Activity size={18} />,
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-[1.75rem] border border-white/10 bg-gray-950/70 p-4 shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{card.title}</p>
              <div className="rounded-2xl bg-white/5 p-2 text-emerald-300">{card.icon}</div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-gray-950/70 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-500/10 p-2 text-sky-300">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Viewer Count Over Time</h3>
            <p className="text-sm text-gray-500">Live audience trend for the current broadcast.</p>
          </div>
        </div>

        <div className="mt-5 h-72">
          {mergedData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-gray-900/60 text-sm text-gray-500">
              Analytics will appear after viewers start joining the room.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    color: '#f9fafb',
                  }}
                />
                <Line type="monotone" dataKey="viewerCount" stroke="#34d399" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-gray-950/70 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pink-500/10 p-2 text-pink-300">
            <Heart size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Reaction Breakdown</h3>
            <p className="text-sm text-gray-500">See which reactions are resonating most with viewers.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {reactionBreakdown.map((reaction) => {
            const percentage = totalReactionCount > 0 ? (reaction.value / totalReactionCount) * 100 : 0;

            return (
              <div key={reaction.key}>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{reaction.label}</span>
                  <span>
                    {reaction.value} • {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                    style={{ width: `${percentage}%` }}
                  />
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
