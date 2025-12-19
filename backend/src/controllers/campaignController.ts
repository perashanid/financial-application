import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { campaignService } from '../services/campaignService';
import { logger } from '../utils/logger';

export class CampaignController {
  async createCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const campaign = await campaignService.createCampaign(userId, req.body);
      res.status(201).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Create campaign error:', error);
      next(error);
    }
  }

  async getCampaigns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        category: req.query.category,
        creatorId: req.query.creatorId,
      };

      const result = await campaignService.getCampaigns(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get campaigns error:', error);
      next(error);
    }
  }

  async getCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Get campaign error:', error);
      next(error);
    }
  }

  async updateCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const campaign = await campaignService.updateCampaign(req.params.id, userId, req.body);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Update campaign error:', error);
      next(error);
    }
  }

  async deleteCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      await campaignService.deleteCampaign(req.params.id, userId);
      res.status(200).json({ success: true, message: 'Campaign cancelled successfully' });
    } catch (error: any) {
      logger.error('Delete campaign error:', error);
      next(error);
    }
  }

  async contribute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const campaign = await campaignService.contribute(req.params.id, userId, req.body);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Contribute error:', error);
      next(error);
    }
  }

  async addUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const { title, content } = req.body;
      const campaign = await campaignService.addUpdate(req.params.id, userId, title, content);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Add update error:', error);
      next(error);
    }
  }

  async flagCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const { reason } = req.body;
      const campaign = await campaignService.flagCampaign(req.params.id, userId, reason);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Flag campaign error:', error);
      next(error);
    }
  }
}

export const campaignController = new CampaignController();
