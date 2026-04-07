import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Store, Users, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { getDefaultRouteForRole } from '../services/authRoutes';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const ROLE_OPTIONS = [
  {
    id: 'buyer',
    label: 'Buyer',
    icon: <Users size={24} />,
    description: 'Join live rooms, react in real time, and ask questions while shopping.',
  },
  {
    id: 'shop_owner',
    label: 'Shop Owner',
    icon: <Store size={24} />,
    description: 'Manage products, go live, and answer viewer questions.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <ShieldCheck size={24} />,
    description: 'Oversee live operations and platform sessions.',
  },
];

const LoginPage = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const initialRole = ROLE_OPTIONS.some((roleOption) => roleOption.id === requestedRole)
    ? requestedRole
    : 'buyer';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => getDefaultRouteForRole(selectedRole), [selectedRole]);

  if (token && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/login', {
        ...formValues,
        role: selectedRole,
      });
      setAuth(response.data.data);
      addToast({
        title: 'Welcome back',
        message: {
          admin: 'Admin access granted.',
          shop_owner: 'Shop owner access granted.',
          buyer: 'Buyer access granted.',
        }[selectedRole],
        tone: 'success',
      });
      navigate(location.state?.from || redirectPath, { replace: true });
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

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zoop-yellow px-4 py-12 selection:bg-black selection:text-white">
      <div className="w-full max-w-5xl border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:grid lg:grid-cols-[1fr_0.8fr]">

        {/* Left Side: Role Selection */}
        <div className="border-b-[4px] border-black p-8 lg:border-b-0 lg:border-r-[4px] bg-white">
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-black p-1.5 rounded-lg">
              <Zap className="text-zoop-yellow fill-zoop-yellow" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">ZoopIn</span>
          </div>

          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black leading-none">
            Welcome <br /> Back.
          </h1>
          <p className="mt-4 text-lg font-bold text-black/60 leading-tight">
            Pick your lane and get back into the action.
          </p>

          <div className="mt-10 space-y-4">
            {ROLE_OPTIONS.map((roleOption) => (
              <motion.button
                key={roleOption.id}
                type="button"
                whileHover={{ x: 4, y: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
                onClick={() => handleRoleChange(roleOption.id)}
                className={`flex w-full items-start gap-4 border-[3px] border-black p-5 text-left transition-colors ${selectedRole === roleOption.id
                  ? 'bg-zoop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white'
                  }`}
              >
                <div className={`p-3 border-2 border-black ${selectedRole === roleOption.id ? 'bg-black text-zoop-yellow' : 'bg-zoop-yellow text-black'}`}>
                  {roleOption.icon}
                </div>
                <div>
                  <p className="text-xl font-black uppercase italic tracking-tighter leading-none">{roleOption.label}</p>
                  <p className="mt-2 text-sm font-bold text-black/50 leading-snug">{roleOption.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Side: Log In Form */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">Auth Gateway</p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tighter decoration-zoop-yellow decoration-[6px] underline underline-offset-4">
              {{
                admin: 'Admin Login',
                shop_owner: 'Seller Login',
                buyer: 'Buyer Login',
              }[selectedRole]}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Email Adddress</label>
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
                className="w-full border-[3px] border-black bg-white p-4 text-sm font-bold outline-none transition-all focus:bg-zoop-yellow/10"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Secret Password</label>
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
                className="w-full border-[3px] border-black bg-white p-4 text-sm font-bold outline-none transition-all focus:bg-zoop-yellow/10"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, rotate: 1 }}
              whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: 'none' }}
              className="group flex w-full h-[60px] items-center justify-center gap-3 bg-black px-4 text-lg font-black uppercase italic tracking-tighter text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] disabled:bg-zinc-800 disabled:shadow-none transition-all"
            >
              {isSubmitting ? 'Verifying...' : (
                <>
                  Continue <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            {selectedRole === 'admin' ? (
              <p className="text-xs font-bold text-black/40 uppercase tracking-wider italic">Admin credentials are hardware restricted.</p>
            ) : (
              <p className="text-sm font-bold uppercase italic tracking-tighter">
                No account?{' '}
                <Link
                  to={`/register?role=${selectedRole}`}
                  className="text-black underline decoration-zoop-yellow decoration-4 underline-offset-4 hover:bg-zoop-yellow"
                >
                  Create one now
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
