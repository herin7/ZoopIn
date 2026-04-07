const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['buyer', 'shop_owner', 'admin'],
      default: 'buyer',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function handlePasswordHash() {
  if (!this.isModified('password') || BCRYPT_HASH_PATTERN.test(this.password)) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
