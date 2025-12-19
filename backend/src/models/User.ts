import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'individual' | 'business' | 'admin';
  profilePhoto?: string;
  currency: string;
  language: 'en' | 'bn';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisible: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['individual', 'business', 'admin'], default: 'individual' },
    profilePhoto: { type: String },
    currency: { type: String, default: 'BDT' },
    language: { type: String, enum: ['en', 'bn'], default: 'bn' },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
      },
      privacy: {
        profileVisible: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
