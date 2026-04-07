import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, LogOut, MessageSquareMore, Plus, Zap, LayoutDashboard, Radio, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import api from '../lib/api';
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

const getSessionImage = (session) =>
  session?.thumbnail || session?.currentProduct?.images?.[0] || '';

const AdminDashboard = () => {
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
    like: 0,
    fire: 0,
    heart: 0,
    wow: 0,
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

  const syncManagedSessions = (updater) => {
    setManagedSessions((currentSessions) =>
      typeof updater === 'function' ? updater(currentSessions) : updater
    );
  };

  const fetchManagedSessions = useCallback(async () => {
    setIsLoadingSessions(true);

    try {
      const response = await api.get('/api/sessions');
      const sessions = response.data.data || [];
      setManagedSessions(sessions);

      if (!session && sessions.length > 0) {
        const preferredSession =
          sessions.find((item) => item.status === 'live') ||
          sessions.find((item) => item.status === 'scheduled') ||
          sessions[0];
        setSession(preferredSession);
      }
    } catch (error) {
      addToast({
        title: 'Unable to load sessions',
        message: error.response?.data?.message || 'Please refresh and try again.',
        tone: 'error',
      });
    } finally {
      setIsLoadingSessions(false);
    }
  }, [addToast, session]);

  useEffect(() => {
    fetchManagedSessions();
  }, [fetchManagedSessions]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleSessionState = ({ data }) => {
      if (data?.session) {
        setSession(data.session);
        syncManagedSessions((currentSessions) =>
          currentSessions.map((item) => (item._id === data.session._id ? data.session : item))
        );
      }

      if (data?.questions) {
        setQuestions(data.questions);
      }

      if (data?.reactionCounts) {
        setReactionCounts(data.reactionCounts);
      }
    };

    const handleQuestionNew = (question) => {
      setQuestions((currentQuestions) => [question, ...currentQuestions]);
    };

    const handleQuestionAnswered = (updatedQuestion) => {
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          (question._id || question.timestamp) === (updatedQuestion._id || updatedQuestion.timestamp)
            ? updatedQuestion
            : question
        )
      );
    };

    const handleReactionUpdate = ({ counts }) => {
      if (counts) {
        setReactionCounts(counts);
      }
    };

    const handleProductChanged = ({ currentProduct }) => {
      if (!currentProduct) {
        return;
      }

      setSession((currentSession) =>
        currentSession
          ? {
            ...currentSession,
            currentProduct,
          }
          : currentSession
      );
    };

    socket.on('session:state', handleSessionState);
    socket.on('question:new', handleQuestionNew);
    socket.on('question:answered', handleQuestionAnswered);
    socket.on('reaction:update', handleReactionUpdate);
    socket.on('product:changed', handleProductChanged);

    return () => {
      socket.off('session:state', handleSessionState);
      socket.off('question:new', handleQuestionNew);
      socket.off('question:answered', handleQuestionAnswered);
      socket.off('reaction:update', handleReactionUpdate);
      socket.off('product:changed', handleProductChanged);
    };
  }, [socket]);

  const unansweredCount = useMemo(
    () => questions.filter((question) => !question.isAnswered).length,
    [questions]
  );

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setIsCreatingSession(true);

    try {
      const response = await api.post('/api/sessions', {
        title: sessionForm.title,
        description: sessionForm.description,
        thumbnail: sessionForm.thumbnail,
      });

      const createdSession = response.data.data;
      setSession(createdSession);
      syncManagedSessions((currentSessions) => [createdSession, ...currentSessions]);
      setSessionForm(EMPTY_SESSION_FORM);
      setQuestions([]);
      setReactionCounts({
        like: 0,
        fire: 0,
        heart: 0,
        wow: 0,
      });
      addToast({
        title: 'Session created',
        message: 'The live room card is ready. Start streaming when you are ready.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Unable to create session',
        message: error.response?.data?.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleMarkAnswered = (question) => {
    if (!socket || !session) {
      return;
    }

    socket.emit('question:answer', {
      roomId: session.roomId,
      questionId: question._id,
    });
  };

  const handleSessionChange = (updatedSession) => {
    setSession(updatedSession);
    syncManagedSessions((currentSessions) =>
      currentSessions.map((item) => (item._id === updatedSession._id ? updatedSession : item))
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black md:px-8 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header Section */}
        <div className="border-[4px] border-black bg-white p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-black p-1.5 rounded-lg shadow-[3px_3px_0px_0px_rgba(244,255,0,1)]">
                <LayoutDashboard className="text-zoop-yellow" size={20} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-black/40">{roleLabel} Control Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Dashing <br className="md:hidden" /> <span className="bg-zoop-yellow px-2">Performance.</span>
            </h1>
            <p className="max-w-2xl text-lg font-bold text-black/60 leading-tight">
              Create drops, blast the feed, and own the live marketplace.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)]"
          >
            <LogOut size={16} /> Exit
          </motion.button>
        </div>

        {/* Global Controls & Creation */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] mb-12">

          {/* Create Session Form */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-[4px] border-black bg-zoop-yellow p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-8 flex items-center gap-3">
              <Plus className="bg-black text-white p-1" size={28} /> New Live Drop
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest">Session Catchphrase</label>
                <input
                  required
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
                  placeholder="e.g. Rare 1-of-1 Vault Opening"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40">Visual Proof (URL)</label>
                  <input
                    value={sessionForm.thumbnail}
                    onChange={(e) => setSessionForm(f => ({ ...f, thumbnail: e.target.value }))}
                    className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40">Drop Description</label>
                  <textarea
                    rows={1}
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border-2 border-black bg-white p-4 text-sm font-bold outline-none"
                    placeholder="Urgent vibes only."
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={isCreatingSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white py-4 font-black uppercase italic tracking-tighter text-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] disabled:bg-zinc-800"
              >
                {isCreatingSession ? 'Launching...' : 'Initialize Session'}
              </motion.button>
            </form>
          </motion.div>

          {/* User Bio Card */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-[4px] border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">Verified Credentials</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="h-16 w-16 border-4 border-black bg-zoop-yellow flex items-center justify-center">
                <Zap className="fill-black" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{user?.name || user?.email}</h3>
                <span className="text-sm font-black text-white bg-black px-2 py-0.5 uppercase mt-1 inline-block">{roleLabel} Access</span>
              </div>
            </div>
            <p className="mt-8 font-bold text-black/60 italic leading-snug">
              Every room you create is instantly blasted to the global feed. Make your thumbnails count.
            </p>
          </motion.div>
        </div>

        {/* Existing Sessions Marquee/Grid */}
        <div className="mb-16 border-[6px] border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(244,255,0,1)]">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your <span className="bg-black text-white px-3">Rooms</span></h2>
            <div className="h-[2px] flex-1 bg-black/10 mx-4 hidden md:block" />
            <div className="text-sm font-black uppercase tracking-widest">{managedSessions.length} Managed</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {managedSessions.map((managedSession) => (
                <motion.button
                  key={managedSession._id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setSession(managedSession)}
                  className={`group relative overflow-hidden border-[3px] border-black p-4 transition-all text-left ${session?._id === managedSession._id
                    ? 'bg-zoop-yellow shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-zinc-50'
                    }`}
                >
                  <div className="aspect-video border-2 border-black overflow-hidden mb-4 bg-zinc-100">
                    {getSessionImage(managedSession) ? (
                      <img src={getSessionImage(managedSession)} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="thumb" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center italic font-black text-black/10">No Asset</div>
                    )}
                  </div>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter truncate">{managedSession.title}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${managedSession.status === 'live' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                      {managedSession.status}
                    </span>
                    <span className="text-[10px] font-black uppercase flex items-center gap-1">
                      <UsersIcon size={12} /> {managedSession.viewerCount || 0}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
            {!isLoadingSessions && managedSessions.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-black/20 py-20 text-center font-black uppercase italic opacity-20 text-4xl tracking-tighter">Zero Rooms Loaded.</div>
            )}
          </div>
        </div>

        {/* Live Control Hub */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Stream Preview & Controls */}
          <div className="lg:col-span-3">
            <StreamControls
              session={session}
              socket={socket}
              localStream={localStream}
              startStream={startStream}
              stopStream={stopStream}
              viewerCount={viewerCount}
              onSessionChange={handleSessionChange}
            />
          </div>

          {/* Tabbed Side Panel */}
          <div className="lg:col-span-2">
            <div className="border-[4px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full min-h-[600px]">
              {/* Custom Tabs */}
              <div className="flex border-b-[4px] border-black">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-5 flex flex-col items-center justify-center gap-1 transition-colors relative ${activeTab === tab.id ? 'bg-zoop-yellow' : 'bg-white hover:bg-zinc-50'
                      }`}
                  >
                    {tab.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    {tab.id === 'questions' && unansweredCount > 0 && (
                      <span className="absolute top-2 right-2 h-5 w-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {unansweredCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Area */}
              <div className="p-6 flex-1 overflow-y-auto bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'products' && (
                      <ProductManager
                        session={session}
                        socket={socket}
                        currentProductId={session?.currentProduct?._id || session?.currentProduct}
                        onCurrentProductChange={(product) =>
                          setSession((currentSession) =>
                            currentSession
                              ? { ...currentSession, currentProduct: product }
                              : currentSession
                          )
                        }
                      />
                    )}

                    {activeTab === 'questions' && (
                      <QuestionPanel
                        questions={questions}
                        unansweredCount={unansweredCount}
                        onMarkAnswered={handleMarkAnswered}
                      />
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

        {/* Floating Session Meta */}
        {session && (
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="mt-10 border-t-[6px] border-black pt-10 flex flex-col md:flex-row gap-10"
          >
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Room Intel</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[10px] font-black text-black/40 uppercase">Status</p>
                  <p className="text-lg font-black uppercase italic text-red-600">{session.status}</p>
                </div>
                <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[10px] font-black text-black/40 uppercase">Room ID</p>
                  <p className="text-lg font-black uppercase italic truncate">{session.roomId}</p>
                </div>
                <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[10px] font-black text-black/40 uppercase">Audience</p>
                  <p className="text-lg font-black uppercase italic">{session.viewerCount || 0} Connected</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 underline decoration-zoop-yellow decoration-4">The Hook</h3>
              <p className="text-sm font-bold text-black/60 leading-snug italic">
                "{session.description || 'No hook provided. Add a description to convert viewers into bidders.'}"
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
