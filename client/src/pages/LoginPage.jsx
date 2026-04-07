import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Store, Users } from 'lucide-react';
import api from '../lib/api';
import { getDefaultRouteForRole } from '../lib/authRoutes';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const ROLE_OPTIONS = [
  {
    id: 'buyer',
    label: 'Buyer',
    icon: <Users size={18} />,
    description: 'Join live rooms, react in real time, and ask questions while shopping.',
  },
  {
    id: 'shop_owner',
    label: 'Shop Owner',
    icon: <Store size={18} />,
    description: 'Manage products, go live, and answer viewer questions.',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <ShieldCheck size={18} />,
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
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/10 bg-black/40 p-8 lg:border-b-0 lg:border-r">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-yellow">ZoopIn Access</p>
          <h1 className="mt-3 text-3xl font-semibold">Choose your control flow</h1>
          <p className="mt-3 text-sm text-gray-400">
            Buyers join live shopping rooms. Shop owners run live selling sessions. Admins supervise platform activity.
          </p>

          <div className="mt-8 space-y-3">
            {ROLE_OPTIONS.map((roleOption) => (
              <button
                key={roleOption.id}
                type="button"
                onClick={() => handleRoleChange(roleOption.id)}
                className={`flex w-full items-start gap-3 rounded-[1.5rem] border p-4 text-left transition ${
                  selectedRole === roleOption.id
                    ? 'border-brand-yellow/50 bg-brand-yellow/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="rounded-2xl bg-white/5 p-3 text-brand-yellow">{roleOption.icon}</div>
                <div>
                  <p className="font-medium text-white">{roleOption.label}</p>
                  <p className="mt-1 text-sm text-gray-400">{roleOption.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Sign In</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {{
                admin: 'Admin login',
                shop_owner: 'Shop owner login',
                buyer: 'Buyer login',
              }[selectedRole]}
            </h2>
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
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
                placeholder={
                  {
                    admin: 'admin@example.com',
                    shop_owner: 'owner@example.com',
                    buyer: 'buyer@example.com',
                  }[selectedRole]
                }
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
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-brand-yellow"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-yellow px-4 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              {isSubmitting
                ? 'Signing in...'
                : `Continue as ${
                  {
                    admin: 'admin',
                    shop_owner: 'shop owner',
                    buyer: 'buyer',
                  }[selectedRole]
                }`}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-400">
            {selectedRole === 'admin' ? (
              <p>Admin accounts are managed separately.</p>
            ) : (
              <p>
                Need an account?{' '}
                <Link
                  to={`/register?role=${selectedRole}`}
                  className="font-bold text-brand-blue hover:text-brand-blue-hover"
                >
                  Register here
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
