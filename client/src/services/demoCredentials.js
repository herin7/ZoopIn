export const DEMO_CREDENTIALS = {
  buyer: {
    name: 'Demo Buyer',
    email: 'demo@buyer.com',
    password: 'demo123',
  },
  shop_owner: {
    name: 'Demo Shop Owner',
    email: 'demo@owner.com',
    password: 'demo123',
  },
  admin: {
    name: 'Platform Admin',
    email: 'demo@admin.com',
    password: 'demo123',
  },
};

export const getDemoCredentials = (role = 'buyer') =>
  DEMO_CREDENTIALS[role] || DEMO_CREDENTIALS.buyer;

export const getDemoRegisterValues = (role = 'buyer') => {
  const demoCredentials = getDemoCredentials(role);

  return {
    name: demoCredentials.name,
    email: demoCredentials.email,
    password: demoCredentials.password,
    confirmPassword: demoCredentials.password,
  };
};
