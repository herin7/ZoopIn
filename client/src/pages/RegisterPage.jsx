import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, UserPlus, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { getDefaultRouteForRole } from '../services/authRoutes';
import { getDemoCredentials, getDemoRegisterValues } from '../services/demoCredentials';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const ROLE_OPTIONS = [
  {
    id: 'buyer',
    label: 'Buyer',
    icon: <UserPlus size={24} />,
    description: 'Create an account to join live rooms, ask questions, and follow product drops.',
  },
  {
    id: 'shop_owner',
    label: 'Shop Owner',
    icon: <Store size={24} />,
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
  const [formValues, setFormValues] = useState(() => getDemoRegisterValues(selectedRole));
  const location = useLocation();
  const navigate = useNavigate();

  const roleDemo = useMemo(() => getDemoCredentials(selectedRole), [selectedRole]);

  useEffect(() => {
    setFormValues(getDemoRegisterValues(selectedRole));
  }, [selectedRole]);

  if (token && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
  };

  const signInExistingAccount = async () => {
    const loginResponse = await api.post('/api/auth/login', {
      email: formValues.email,
      password: formValues.password,
      role: selectedRole,
    });

    const authenticatedUser = loginResponse.data.data.user;
    setAuth(loginResponse.data.data);
    addToast({
      title: 'Signed in instead',
      message: 'That account already existed, so we logged you in directly.',
      tone: 'success',
    });

    navigate(location.state?.from || getDefaultRouteForRole(authenticatedUser.role), {
      replace: true,
    });
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

      const authenticatedUser = response.data.data.user;
      setAuth(response.data.data);
      addToast({
        title: 'Account ready',
        message:
          authenticatedUser.role === 'shop_owner'
            ? 'Your seller workspace is ready to use.'
            : 'Your buyer account has been created successfully.',
        tone: 'success',
      });

      navigate(location.state?.from || getDefaultRouteForRole(authenticatedUser.role), {
        replace: true,
      });
    } catch (error) {
      if (error.response?.status === 409) {
        try {
          await signInExistingAccount();
          return;
        } catch (loginError) {
          addToast({
            title: 'Account already exists',
            message:
              loginError.response?.data?.message ||
              'This email is already in use. Try the login screen with these demo credentials.',
            tone: 'warning',
          });
          return;
        }
      }

      addToast({
        title: 'Registration failed',
        message: error.response?.data?.message || 'Unable to create your account right now.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const restoreDemoValues = () => {
    setFormValues(getDemoRegisterValues(selectedRole));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zoop-yellow px-4 py-12 selection:bg-black selection:text-white">
      <div className="w-full max-w-5xl border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:grid lg:grid-cols-[1fr_0.8fr]">
        <div className="border-b-[4px] border-black bg-white p-8 lg:border-b-0 lg:border-r-[4px]">
          <div className="mb-8 flex cursor-pointer items-center gap-2" onClick={() => navigate('/')}>
            <div className="rounded-lg bg-black p-1.5">
              <Zap className="fill-zoop-yellow text-zoop-yellow" size={20} />
            </div>
            <span className="text-2xl font-black uppercase italic tracking-tighter">ZoopIn</span>
          </div>

          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black leading-none">
            Start <br /> Fresh.
          </h1>
          <p className="mt-4 text-lg font-bold leading-tight text-black/60">
            Use the prefilled demo details or swap them for your own.
          </p>

          <div className="mt-10 space-y-4">
            {ROLE_OPTIONS.map((roleOption) => (
              <motion.button
                key={roleOption.id}
                type="button"
                whileHover={{ x: 4, y: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
                onClick={() => handleRoleChange(roleOption.id)}
                className={`flex w-full items-start gap-4 border-[3px] border-black p-5 text-left transition-colors ${
                  selectedRole === roleOption.id
                    ? 'bg-zoop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white'
                }`}
              >
                <div
                  className={`border-2 border-black p-3 ${
                    selectedRole === roleOption.id
                      ? 'bg-black text-zoop-yellow'
                      : 'bg-zoop-yellow text-black'
                  }`}
                >
                  {roleOption.icon}
                </div>
                <div>
                  <p className="text-xl font-black uppercase italic tracking-tighter leading-none">
                    {roleOption.label}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-snug text-black/50">
                    {roleOption.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white p-8 md:p-12">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">New Identity</p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tighter decoration-zoop-yellow decoration-[6px] underline underline-offset-4">
              {selectedRole === 'shop_owner' ? 'Seller Signup' : 'Buyer Signup'}
            </h2>
          </div>

          <div className="mb-6 border-[3px] border-black bg-zoop-yellow/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
                  Demo Starter
                </p>
                <p className="mt-2 text-sm font-black">{roleDemo.name}</p>
                <p className="text-sm font-black">{roleDemo.email}</p>
                <p className="text-sm font-bold text-black/70">{roleDemo.password}</p>
              </div>
              <button
                type="button"
                onClick={restoreDemoValues}
                className="border-2 border-black bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                Refill
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">
                Display Name
              </label>
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
                className="w-full border-[3px] border-black bg-white p-4 text-sm font-bold outline-none transition-all focus:bg-zoop-yellow/10"
                placeholder={selectedRole === 'shop_owner' ? 'Your Shop Name' : 'Full Name'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">
                Email Address
              </label>
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black">
                  Password
                </label>
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
                  className="w-full border-[3px] border-black bg-white p-4 text-sm font-bold outline-none transition-all focus:bg-zoop-yellow/10"
                  placeholder="Min 6 chars"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black">
                  Confirm
                </label>
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
                  className="w-full border-[3px] border-black bg-white p-4 text-sm font-bold outline-none transition-all focus:bg-zoop-yellow/10"
                  placeholder="Repeat it"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, rotate: 1 }}
              whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: 'none' }}
              className="group flex h-[60px] w-full items-center justify-center gap-3 bg-black px-4 text-lg font-black uppercase italic tracking-tighter text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] transition-all disabled:bg-zinc-800 disabled:shadow-none"
            >
              {isSubmitting ? (
                'Onboarding...'
              ) : (
                <>
                  Join ZoopIn <ArrowRight className="transition-transform group-hover:translate-x-2" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-sm font-bold uppercase italic tracking-tighter">
              Dashing already?{' '}
              <Link
                to={`/login?role=${selectedRole}`}
                className="text-black underline decoration-zoop-yellow decoration-4 underline-offset-4 hover:bg-zoop-yellow"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
