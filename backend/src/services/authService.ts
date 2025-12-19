import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { safeRedis } from '../config/redis';

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'individual' | 'business';
}

interface LoginData {
  emailOrPhone: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: any; // Full user object without sensitive fields
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
      throw new Error('PHONE_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role || 'individual',
    });

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

    // Return user without sensitive fields
    const userObject: any = user.toObject();
    delete userObject.passwordHash;
    delete userObject.twoFactorSecret;

    return {
      accessToken,
      refreshToken,
      user: userObject,
    };
  }

  async login(data: LoginData): Promise<AuthTokens> {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: data.emailOrPhone }, { phone: data.emailOrPhone }],
    });

    if (!user) {
      throw new Error('AUTH_CREDENTIALS_INVALID');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error('AUTH_CREDENTIALS_INVALID');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      throw new Error('AUTH_2FA_REQUIRED');
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

    // Return user without sensitive fields
    const userObject: any = user.toObject();
    delete userObject.passwordHash;
    delete userObject.twoFactorSecret;

    return {
      accessToken,
      refreshToken,
      user: userObject,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const storedToken = await safeRedis.get(`refresh_token:${payload.userId}`);
    if (storedToken && storedToken !== refreshToken) {
      throw new Error('AUTH_TOKEN_INVALID');
    }

    // Generate new access token
    const accessToken = generateAccessToken(payload);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await safeRedis.del(`refresh_token:${userId}`);
  }
}

export const authService = new AuthService();
