import { Router } from 'express';
import { campaignController } from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, campaignController.createCampaign.bind(campaignController));
router.get('/', campaignController.getCampaigns.bind(campaignController));
router.get('/:id', campaignController.getCampaign.bind(campaignController));
router.put('/:id', authenticate, campaignController.updateCampaign.bind(campaignController));
router.delete('/:id', authenticate, campaignController.deleteCampaign.bind(campaignController));
router.post('/:id/contribute', authenticate, campaignController.contribute.bind(campaignController));
router.post('/:id/updates', authenticate, campaignController.addUpdate.bind(campaignController));
router.post('/:id/flag', authenticate, campaignController.flagCampaign.bind(campaignController));

export default router;
