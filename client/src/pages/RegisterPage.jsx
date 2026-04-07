import { useMemo, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, UserPlus } from 'lucide-react';
import api from '../lib/api';
import { getDefaultRouteForRole } from '../lib/authRoutes';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const ROLE_OPTIONS = [
  {
    id: 'buyer',
    label: 'Buyer',
    icon: <UserPlus size={18} />,
    description: 'Create an account to join live rooms, ask questions, and follow product drops.',
  },
  {
    id: 'shop_owner',
    label: 'Shop Owner',
    icon: <Store size={18} />,
    description: 'Open your selling dashboard, upload products, and host live product sessions.',
  },
];

const RegisterPage = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(
    searchParams.get('role') === 'shop_owner' ? 'shop_owner' : 'buyer'
  );
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const location = useLocation();
  const navigate = useNavigate();

  const redirectPath = useMemo(
    () => getDefaultRouteForRole(selectedRole),
    [selectedRole]
  );

  if (token && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formValues.password !== formValues.confirmPassword) {
      addToast({
        title: 'Passwords do not match',
        message: 'Please enter the same password in both fields.',
        tone: 'warning',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/register', {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        role: selectedRole,
      });

      setAuth(response.data.data);
      addToast({
        title: 'Account ready',
        message:
          selectedRole === 'shop_owner'
            ? 'Your seller workspace is ready to use.'
            : 'Your buyer account has been created successfully.',
        tone: 'success',
      });

      navigate(location.state?.from || redirectPath, { replace: true });
    } catch (error) {
      addToast({
        title: 'Registration failed',
        message: error.response?.data?.message || 'Unable to create your account right now.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-gray-900/90 shadow-2xl shadow-black/40 backdrop-blur-sm lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-white/10 bg-gray-950/70 p-8 lg:border-b-0 lg:border-r">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Create Account</p>
          <h1 className="mt-3 text-3xl font-semibold">Choose how you want to use ZoopIn</h1>
          <p className="mt-3 text-sm text-gray-400">
            Buyers join live shopping rooms and discover products. Shop owners run streams and manage catalog launches.
          </p>

          <div className="mt-8 space-y-3">
            {ROLE_OPTIONS.map((roleOption) => (
              <button
                key={roleOption.id}
                type="button"
                onClick={() => handleRoleChange(roleOption.id)}
                className={`flex w-full items-start gap-3 rounded-[1.5rem] border p-4 text-left transition ${
                  selectedRole === roleOption.id
                    ? 'border-emerald-400/50 bg-emerald-500/10'
                    : 'border-white/10 bg-gray-900/70 hover:border-white/20'
                }`}
              >
                <div className="rounded-2xl bg-white/5 p-3 text-emerald-300">{roleOption.icon}</div>
                <div>
                  <p className="font-medium text-white">{roleOption.label}</p>
                  <p className="mt-1 text-sm text-gray-400">{roleOption.description}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Admin accounts are provisioned separately and sign in from the admin login flow.
          </p>
        </div>

        <div className="p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Register</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {selectedRole === 'shop_owner' ? 'Create a shop owner account' : 'Create a buyer account'}
            </h2>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Full name</label>
              <input
                type="text"
                required
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                placeholder={selectedRole === 'shop_owner' ? 'Asha Sharma' : 'Riya Kapoor'}
              />
            </div>

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
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formValues.password}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Confirm password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formValues.confirmPassword}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to={`/login?role=${selectedRole}`} className="font-medium text-emerald-300 hover:text-emerald-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
