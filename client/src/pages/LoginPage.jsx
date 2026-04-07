import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const LoginPage = () => {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/login', formValues);
      setAuth(response.data.data);
      addToast({
        title: 'Welcome back',
        message: 'Admin session started successfully.',
        tone: 'success',
      });
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (error) {
      addToast({
        title: 'Login failed',
        message: error.response?.data?.message || 'Unable to sign in with those credentials.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-gray-900/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Admin Access</p>
            <h1 className="text-2xl font-semibold">Sign in to control the stream</h1>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              required
              value={formValues.email}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  email: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              value={formValues.password}
              onChange={(event) =>
                setFormValues((currentValues) => ({
                  ...currentValues,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              placeholder="Enter your admin password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
