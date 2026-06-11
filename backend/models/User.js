import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAgent: {
      type: Boolean,
      required: true,
      default: false,
    },
    ecoPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    tier: {
      type: String,
      required: true,
      default: 'Bronze',
      enum: ['Bronze', 'Silver', 'Gold'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to recalculate tier based on current points
userSchema.methods.calculateTier = async function () {
  const points = this.ecoPoints;
  let newTier = 'Bronze';

  if (points >= 2000) {
    newTier = 'Gold';
  } else if (points >= 500) {
    newTier = 'Silver';
  }

  if (this.tier !== newTier) {
    this.tier = newTier;
    await this.save();
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
