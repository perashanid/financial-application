import { Category, defaultCategories } from '../models/Category';

interface CreateCategoryData {
  name: string;
  nameLocal?: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export class CategoryService {
  async seedDefaultCategories(): Promise<void> {
    const count = await Category.countDocuments({ isDefault: true });
    if (count === 0) {
      await Category.insertMany(defaultCategories);
    }
  }

  async getAllCategories(userId: string) {
    // Get default categories and user's custom categories
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId }],
    }).sort({ type: 1, name: 1 });
    return categories;
  }

  async getCategoryById(categoryId: string, userId: string) {
    const category = await Category.findOne({
      _id: categoryId,
      $or: [{ isDefault: true }, { userId }],
    });
    if (!category) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return category;
  }

  async createCategory(userId: string, data: CreateCategoryData) {
    const category = await Category.create({
      ...data,
      userId,
      isDefault: false,
    });
    return category;
  }

  async updateCategory(categoryId: string, userId: string, data: Partial<CreateCategoryData>) {
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (category.isDefault) {
      throw new Error('FORBIDDEN_ACTION');
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  async deleteCategory(categoryId: string, userId: string) {
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (category.isDefault) {
      throw new Error('FORBIDDEN_ACTION');
    }

    await Category.findByIdAndDelete(categoryId);
  }
}

export const categoryService = new CategoryService();
