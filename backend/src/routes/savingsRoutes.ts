import { Router } from 'express';
import { savingsController } from '../controllers/savingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/goals', authenticate, savingsController.createGoal.bind(savingsController));
router.get('/goals', authenticate, savingsController.getGoals.bind(savingsController));
router.get('/goals/:id', authenticate, savingsController.getGoalById.bind(savingsController));
router.put('/goals/:id', authenticate, savingsController.updateGoal.bind(savingsController));
router.delete('/goals/:id', authenticate, savingsController.deleteGoal.bind(savingsController));

router.post('/goals/:id/rules', authenticate, savingsController.addRule.bind(savingsController));
router.put('/goals/:id/rules/:ruleIndex', authenticate, savingsController.updateRule.bind(savingsController));
router.delete('/goals/:id/rules/:ruleIndex', authenticate, savingsController.deleteRule.bind(savingsController));

router.post('/goals/:id/contribute', authenticate, savingsController.contribute.bind(savingsController));

export default router;
