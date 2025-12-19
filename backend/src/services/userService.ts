import { User } from '../models/User';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

interface UpdateProfileData {
  name?: string;
  language?: 'en' | 'bn';
  currency?: string;
}

interface UpdateSettingsData {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  privacy?: {
    profileVisible?: boolean;
  };
}

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-passwordHash -twoFactorSecret');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (data.name) user.name = data.name;
    if (data.language) user.language = data.language;
    if (data.currency) user.currency = data.currency;

    await user.save();
    return user;
  }

  async uploadProfilePhoto(userId: string, fileBuffer: Buffer) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Delete old photo if exists
    if (user.profilePhoto) {
      const publicId = user.profilePhoto.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await deleteFromCloudinary(`profile_photos/${publicId}`);
        } catch (error) {
          // Continue even if deletion fails
        }
      }
    }

    // Upload new photo
    const { url } = await uploadToCloudinary(fileBuffer, 'profile_photos');
    user.profilePhoto = url;
    await user.save();

    return { profilePhoto: url };
  }

  async updateSettings(userId: string, data: UpdateSettingsData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (data.notifications) {
      user.settings.notifications = { ...user.settings.notifications, ...data.notifications };
    }

    if (data.privacy) {
      user.settings.privacy = { ...user.settings.privacy, ...data.privacy };
    }

    await user.save();
    return user;
  }

  async deleteAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Delete profile photo if exists
    if (user.profilePhoto) {
      const publicId = user.profilePhoto.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await deleteFromCloudinary(`profile_photos/${publicId}`);
        } catch (error) {
          // Continue even if deletion fails
        }
      }
    }

    await User.findByIdAndDelete(userId);
  }
}

export const userService = new UserService();
