const Product = require('../models/Product');
const User = require('../models/User');

const OWNERLESS_PRODUCT_FILTER = {
  $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
};

const syncLegacyProductOwnership = async () => {
  const ownerlessProducts = await Product.countDocuments(OWNERLESS_PRODUCT_FILTER);

  if (ownerlessProducts === 0) {
    return;
  }

  const shopOwners = await User.find({ role: 'shop_owner' })
    .sort({ createdAt: 1 })
    .limit(2)
    .select('_id email name');

  if (shopOwners.length !== 1) {
    return;
  }

  const [shopOwner] = shopOwners;

  await Product.updateMany(OWNERLESS_PRODUCT_FILTER, {
    $set: {
      ownerId: shopOwner._id,
      ownerEmail: shopOwner.email,
      ownerName: shopOwner.name,
    },
  });
};

module.exports = {
  syncLegacyProductOwnership,
};
