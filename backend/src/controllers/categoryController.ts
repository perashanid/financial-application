import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { categoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

export class CategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const categories = await categoryService.getAllCategories(userId);
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      logger.error('Get categories error:', error);
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const category = await categoryService.getCategoryById(id, userId);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      logger.error('Get category error:', error);
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name, nameLocal, type, icon, color } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!name || !type) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Name and type are required' },
        });
        return;
      }

      const category = await categoryService.createCategory(userId, { name, nameLocal, type, icon, color });
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      logger.error('Create category error:', error);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, nameLocal, type, icon, color } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const category = await categoryService.updateCategory(id, userId, { name, nameLocal, type, icon, color });
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      logger.error('Update category error:', error);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      await categoryService.deleteCategory(id, userId);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      logger.error('Delete category error:', error);
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
