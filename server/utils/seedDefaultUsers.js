const bcrypt = require('bcryptjs');
const User = require('../models/User');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const getDefaultAccounts = () =>
  [
    {
      role: 'admin',
      name: process.env.ADMIN_NAME || 'Platform Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
    {
      role: 'shop_owner',
      name: process.env.SHOP_OWNER_NAME || 'Demo Shop Owner',
      email: process.env.SHOP_OWNER_EMAIL,
      password: process.env.SHOP_OWNER_PASSWORD,
    },
  ].filter((account) => account.email && account.password);

const resolvePasswordHash = async (password) => {
  if (BCRYPT_HASH_PATTERN.test(password)) {
    return password;
  }

  return bcrypt.hash(password, 10);
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

    if (!existingUser.name && account.name) {
      existingUser.name = account.name;
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
