import { useMemo, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, UserPlus, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { getDefaultRouteForRole } from '../lib/authRoutes';
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
            Start <br /> Fresh.
          </h1>
          <p className="mt-4 text-lg font-bold text-black/60 leading-tight">
            How do you want to play?
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

          <p className="mt-8 text-xs font-bold text-black/40 uppercase tracking-widest leading-loose">
            Admin accounts are restricted and managed via internal hardware keys.
          </p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-black/30">New Identity</p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tighter decoration-zoop-yellow decoration-[6px] underline underline-offset-4">
              {selectedRole === 'shop_owner' ? 'Seller Signup' : 'Buyer Signup'}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Display Name</label>
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
              <label className="text-xs font-black uppercase tracking-widest text-black">Email Address</label>
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
                <label className="text-xs font-black uppercase tracking-widest text-black">Password</label>
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
                <label className="text-xs font-black uppercase tracking-widest text-black">Confirm</label>
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
              className="group flex w-full h-[60px] items-center justify-center gap-3 bg-black px-4 text-lg font-black uppercase italic tracking-tighter text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)] disabled:bg-zinc-800 disabled:shadow-none transition-all"
            >
              {isSubmitting ? 'Onboarding...' : (
                <>
                  Join ZoopIn <ArrowRight className="group-hover:translate-x-2 transition-transform" />
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
