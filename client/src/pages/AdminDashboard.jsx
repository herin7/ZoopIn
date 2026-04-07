import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, LogOut, MessageSquareMore, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  { id: 'products', label: 'Products', icon: <Boxes size={16} /> },
  { id: 'questions', label: 'Questions', icon: <MessageSquareMore size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
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

  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Shop Owner';

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
    <div className="min-h-screen bg-black px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gray-900/80 p-5 shadow-xl shadow-black/20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-yellow">{roleLabel} control center</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {user?.role === 'admin' ? 'Monitor and manage live commerce sessions' : 'Run your live product showcase'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Create a discoverable live-room card, manage the stream, switch products, answer questions, and track engagement.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-white/20 hover:bg-white/5"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <form
            onSubmit={handleCreateSession}
            className="grid gap-3 rounded-[2rem] border border-white/10 bg-gray-900/70 p-4 shadow-lg shadow-black/20 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-gray-500">Session title</label>
              <input
                required
                value={sessionForm.title}
                onChange={(event) =>
                  setSessionForm((currentValue) => ({
                    ...currentValue,
                    title: event.target.value,
                  }))
                }
                placeholder="Weekend sneaker drop"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-gray-500">Short room description</label>
              <textarea
                rows={3}
                value={sessionForm.description}
                onChange={(event) =>
                  setSessionForm((currentValue) => ({
                    ...currentValue,
                    description: event.target.value,
                  }))
                }
                placeholder="Tell buyers what you are showcasing in this stream."
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-gray-500">Thumbnail image URL</label>
              <input
                value={sessionForm.thumbnail}
                onChange={(event) =>
                  setSessionForm((currentValue) => ({
                    ...currentValue,
                    thumbnail: event.target.value,
                  }))
                }
                placeholder="https://your-image-url.com/live-cover.jpg"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isCreatingSession}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-yellow px-5 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                <Plus size={16} />
                {isCreatingSession ? 'Creating...' : 'Create session'}
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-white/10 bg-gray-900/70 p-4 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-white">{user?.name || user?.email}</p>
            <p className="mt-1 text-sm font-bold text-brand-yellow">{roleLabel}</p>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              Add a thumbnail and a short description so buyers can browse your active room from the main storefront.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-white/10 bg-gray-900/70 p-4 shadow-lg shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Your sessions</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Pick a session to control</h2>
            </div>
            {session && (
              <div className="rounded-full border border-white/10 bg-gray-950/70 px-3 py-1 text-xs text-gray-300">
                Active: {session.title}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoadingSessions && (
              <div className="rounded-2xl border border-white/10 bg-gray-950/70 px-4 py-6 text-sm text-gray-500">
                Loading sessions...
              </div>
            )}

            {!isLoadingSessions && managedSessions.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-gray-950/70 px-4 py-6 text-sm text-gray-500">
                No sessions yet. Create your first one above.
              </div>
            )}

            {managedSessions.map((managedSession) => (
              <button
                key={managedSession._id}
                type="button"
                onClick={() => setSession(managedSession)}
                className={`overflow-hidden rounded-[1.5rem] border text-left transition ${
                  session?._id === managedSession._id
                    ? 'border-brand-yellow/40 bg-brand-yellow/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-900">
                  {getSessionImage(managedSession) ? (
                    <img
                      src={getSessionImage(managedSession)}
                      alt={managedSession.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/15 via-gray-950 to-sky-500/10 text-sm text-gray-500">
                      No thumbnail yet
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-medium text-white">{managedSession.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                      {managedSession.description || 'No session description added yet.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-gray-500">
                    <span>{managedSession.status}</span>
                    <span>{managedSession.viewerCount || 0} viewers</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
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

          <div className="xl:col-span-2">
            <div className="rounded-[2rem] border border-white/10 bg-gray-900/70 p-4 shadow-2xl shadow-black/30">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-brand-yellow text-black'
                        : 'border border-white/10 bg-black px-4 py-2 text-gray-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'questions' && unansweredCount > 0 && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-gray-950">
                        {unansweredCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
                {activeTab === 'products' && (
                  <ProductManager
                    session={session}
                    socket={socket}
                    currentProductId={session?.currentProduct?._id || session?.currentProduct}
                    onCurrentProductChange={(product) =>
                      setSession((currentSession) =>
                        currentSession
                          ? {
                            ...currentSession,
                            currentProduct: product,
                          }
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
              </div>
            </div>
          </div>
        </div>

        {session && (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-gray-900/60 p-4 text-sm text-gray-300">
            <div className="flex flex-wrap items-center gap-4">
              <span>Status: {session.status}</span>
              <span>Owner: {session.hostName || session.hostId}</span>
              <span>{session.viewerCount || 0} current viewers</span>
            </div>
            <p className="mt-3 text-gray-400">
              {session.description || 'Add a session description so buyers understand what is happening in this live room.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
