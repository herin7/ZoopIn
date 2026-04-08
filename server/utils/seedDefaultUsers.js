const bcrypt = require('bcryptjs');
const User = require('../models/User');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const getDefaultAccounts = () =>
  [
    {
      role: 'admin',
      name: process.env.ADMIN_NAME || 'Platform Admin',
      email: process.env.ADMIN_EMAIL || 'demo@admin.com',
      password: process.env.ADMIN_PASSWORD || 'demo123',
    },
    {
      role: 'shop_owner',
      name: process.env.SHOP_OWNER_NAME || 'Demo Shop Owner',
      email: process.env.SHOP_OWNER_EMAIL || 'demo@owner.com',
      password: process.env.SHOP_OWNER_PASSWORD || 'demo123',
    },
    {
      role: 'buyer',
      name: process.env.BUYER_NAME || 'Demo Buyer',
      email: process.env.BUYER_EMAIL || 'demo@buyer.com',
      password: process.env.BUYER_PASSWORD || 'demo123',
    },
  ].filter((account) => account.email && account.password);

const resolvePasswordHash = async (password) => {
  if (BCRYPT_HASH_PATTERN.test(password)) {
    return password;
  }

  return bcrypt.hash(password, 10);
};

const isConfiguredPasswordApplied = async (user, configuredPassword) => {
  if (BCRYPT_HASH_PATTERN.test(configuredPassword)) {
    return user.password === configuredPassword;
  }

  return user.comparePassword(configuredPassword);
};

const ensureDefaultUsers = async () => {
  const accounts = getDefaultAccounts();

  for (const account of accounts) {
    const email = account.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const passwordHash = await resolvePasswordHash(account.password);

      await User.create({
        name: account.name,
        email,
        password: passwordHash,
        role: account.role,
      });
      continue;
    }

    let hasChanges = false;

    if (existingUser.role !== account.role) {
      existingUser.role = account.role;
      hasChanges = true;
    }

    if (account.name && existingUser.name !== account.name) {
      existingUser.name = account.name;
      hasChanges = true;
    }

    const hasExpectedPassword = await isConfiguredPasswordApplied(existingUser, account.password);
    if (!hasExpectedPassword) {
      existingUser.password = account.password;
      hasChanges = true;
    }

    if (hasChanges) {
      await existingUser.save();
    }
  }
};

module.exports = {
  ensureDefaultUsers,
};
