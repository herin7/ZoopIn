import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, MessageSquareMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import api from '../services/api';

import DashboardHeader from '../components/admin/DashboardHeader';
import SessionCreator from '../components/admin/SessionCreator';
import SessionGrid from '../components/admin/SessionGrid';
import StreamControls from '../components/admin/StreamControls';
import ProductManager from '../components/admin/ProductManager';
import QuestionPanel from '../components/admin/QuestionPanel';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const TABS = [
  { id: 'products', label: 'Products', icon: <Boxes size={18} /> },
  { id: 'questions', label: 'Questions', icon: <MessageSquareMore size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
];

const EMPTY_SESSION_FORM = {
  title: '',
  description: '',
  thumbnail: '',
};

const StudioDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION_FORM);
  const [session, setSession] = useState(null);
  const [managedSessions, setManagedSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({
    like: 0, fire: 0, heart: 0, wow: 0
  });
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const { socket } = useSocket(session?.roomId, 'host');
  const { localStream, startStream, stopStream, viewerCount } = useWebRTC(
    socket,
    session?.roomId,
    session?._id
  );

  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Seller';

  const fetchManagedSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await api.get('/api/sessions');
      const sessions = response.data.data || [];
      setManagedSessions(sessions);
      if (!session && sessions.length > 0) {
        setSession(sessions.find(s => s.status === 'live') || sessions[0]);
      }
    } catch (error) {
      addToast({ title: 'Load Error', message: error.response?.data?.message, tone: 'error' });
    } finally {
      setIsLoadingSessions(false);
    }
  }, [addToast, session]);

  useEffect(() => {
    fetchManagedSessions();
  }, [fetchManagedSessions]);

  useEffect(() => {
    if (!socket) return;

    socket.on('session:state', ({ data }) => {
      if (data?.session) {
        setSession(data.session);
        setManagedSessions(prev => prev.map(s => s._id === data.session._id ? data.session : s));
      }
      if (data?.questions) setQuestions(data.questions);
      if (data?.reactionCounts) setReactionCounts(data.reactionCounts);
    });

    socket.on('question:new', q => setQuestions(prev => [q, ...prev]));
    socket.on('question:answered', q => setQuestions(prev => prev.map(item => item._id === q._id ? q : item)));
    socket.on('reaction:update', ({ counts }) => counts && setReactionCounts(counts));
    socket.on('product:changed', ({ currentProduct }) => {
      if (!currentProduct) return;
      setSession(prev => prev ? { ...prev, currentProduct } : prev);
    });

    return () => {
      socket.off('session:state');
      socket.off('question:new');
      socket.off('question:answered');
      socket.off('reaction:update');
      socket.off('product:changed');
    };
  }, [socket]);

  const unansweredCount = useMemo(() => questions.filter(q => !q.isAnswered).length, [questions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsCreatingSession(true);
    try {
      const resp = await api.post('/api/sessions', sessionForm);
      const created = resp.data.data;
      setSession(created);
      setManagedSessions(prev => [created, ...prev]);
      setSessionForm(EMPTY_SESSION_FORM);
      setQuestions([]);
      setReactionCounts({ like: 0, fire: 0, heart: 0, wow: 0 });
      addToast({ title: 'Session Ready', message: 'Ready for signal.', tone: 'success' });
    } catch (error) {
      addToast({ title: 'Creation Error', message: error.response?.data?.message, tone: 'error' });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleMarkAnswered = (q) => {
    if (socket && session) socket.emit('question:answer', { roomId: session.roomId, questionId: q._id });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black md:px-8">
      <div className="mx-auto max-w-7xl">

        <DashboardHeader
          roleLabel={roleLabel}
          onLogout={handleLogout}
        />

        <SessionCreator
          sessionForm={sessionForm}
          setSessionForm={setSessionForm}
          onSubmit={handleCreateSession}
          isCreatingSession={isCreatingSession}
          user={user}
          roleLabel={roleLabel}
        />

        <SessionGrid
          managedSessions={managedSessions}
          activeSessionId={session?._id}
          onSelectSession={setSession}
          isLoadingSessions={isLoadingSessions}
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <StreamControls
              session={session}
              socket={socket}
              localStream={localStream}
              startStream={startStream}
              stopStream={stopStream}
              viewerCount={viewerCount}
              onSessionChange={s => setSession(s)}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="border-[4px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full min-h-[600px]">
              <div className="flex border-b-[4px] border-black">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-5 flex flex-col items-center justify-center gap-1 transition-colors relative ${activeTab === tab.id ? 'bg-zoop-yellow' : 'bg-white hover:bg-zinc-50'}`}
                  >
                    {tab.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    {tab.id === 'questions' && unansweredCount > 0 && (
                      <span className="absolute top-2 right-2 h-5 w-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-black">
                        {unansweredCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {activeTab === 'products' && (
                      <ProductManager
                        session={session}
                        socket={socket}
                        currentProductId={session?.currentProduct?._id || session?.currentProduct}
                        onCurrentProductChange={p => setSession(s => s ? { ...s, currentProduct: p } : s)}
                      />
                    )}
                    {activeTab === 'questions' && (
                      <QuestionPanel questions={questions} unansweredCount={unansweredCount} onMarkAnswered={handleMarkAnswered} />
                    )}
                    {activeTab === 'analytics' && (
                      <AnalyticsDashboard socket={socket} sessionId={session?._id} reactionCounts={reactionCounts} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDashboard;
