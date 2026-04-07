export const getDefaultRouteForRole = (role) => {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'shop_owner') {
    return '/studio';
  }

  return '/buyer';
};

export const getLoginRouteForRole = (role) =>
  role ? `/login?role=${encodeURIComponent(role)}` : '/login';
