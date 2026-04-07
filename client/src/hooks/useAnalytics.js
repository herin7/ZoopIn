import { useEffect, useState } from 'react';

/**
 * Tracks admin-facing analytics updates for a live session.
 *
 * @param {import('socket.io-client').Socket | null} socket
 * @returns {{ currentStats: { viewerCount: number, reactionCount: number, questionCount: number, totalReactions: number, engagementRate: number, timestamp: string | null }, historicalData: Array<{ sessionId?: string, viewerCount: number, reactionCount: number, questionCount: number, engagementRate: number, timestamp: string | Date }>, peakViewers: number }}
 */
export const useAnalytics = (socket) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [currentStats, setCurrentStats] = useState({
    viewerCount: 0,
    reactionCount: 0,
    questionCount: 0,
    totalReactions: 0,
    engagementRate: 0,
    timestamp: null,
  });
  const [peakViewers, setPeakViewers] = useState(0);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleAnalyticsUpdate = (snapshot) => {
      setHistoricalData((previousSnapshots) => {
        const nextSnapshots = [...previousSnapshots, snapshot].slice(-30);
        setPeakViewers(
          nextSnapshots.reduce(
            (currentPeak, item) => Math.max(currentPeak, item.viewerCount || 0),
            0
          )
        );

        return nextSnapshots;
      });

      setCurrentStats({
        viewerCount: snapshot.viewerCount || 0,
        reactionCount: snapshot.reactionCount || 0,
        questionCount: snapshot.questionCount || 0,
        totalReactions: snapshot.reactionCount || 0,
        engagementRate: snapshot.engagementRate || 0,
        timestamp: snapshot.timestamp || null,
      });
    };

    socket.on('analytics:update', handleAnalyticsUpdate);

    return () => {
      socket.off('analytics:update', handleAnalyticsUpdate);
    };
  }, [socket]);

  return { currentStats, historicalData, peakViewers };
};
