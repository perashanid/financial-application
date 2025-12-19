import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { safeRedis } from '../config/redis';

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class TwoFactorService {
  async enable(userId: string): Promise<TwoFactorSetup> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.twoFactorEnabled) {
      throw new Error('2FA_ALREADY_ENABLED');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Financial Ledger (${user.email})`,
      issuer: 'Financial Ledger SaaS',
      length: 32,
    });

    // Store the secret temporarily (not activated yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      manualEntryKey: secret.base32,
    };
  }

  async verifyAndActivate(userId: string, token: string): Promise<{ message: string }> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.twoFactorSecret) {
      throw new Error('2FA_NOT_SETUP');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('AUTH_2FA_INVALID');
    }

    // Activate 2FA
    user.twoFactorEnabled = true;
    await user.save();

    return {
      message: '2FA enabled successfully',
    };
  }

  async disable(userId: string, token: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('2FA_NOT_ENABLED');
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('AUTH_2FA_INVALID');
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
  }

  async verifyLogin(emailOrPhone: string, password: string, token: string): Promise<AuthTokens> {
    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new Error('AUTH_CREDENTIALS_INVALID');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('AUTH_CREDENTIALS_INVALID');
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('2FA_NOT_ENABLED');
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('AUTH_2FA_INVALID');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const userId = String(user._id);

    // Generate tokens
    const payload = {
      userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in Redis
    await safeRedis.setEx(`refresh_token:${userId}`, 7 * 24 * 60 * 60, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const twoFactorService = new TwoFactorService();
