import { Router } from 'express';
import { analyticsController, predictionController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, analyticsController.getDashboard.bind(analyticsController));
router.get('/categories', authenticate, analyticsController.getCategoryBreakdown.bind(analyticsController));
router.get('/trends', authenticate, analyticsController.getMonthlyTrends.bind(analyticsController));
router.get('/savings-rate', authenticate, analyticsController.getSavingsRate.bind(analyticsController));

// Prediction endpoints
router.get('/predictions/expenses', authenticate, predictionController.predictExpenses.bind(predictionController));
router.get('/predictions/savings', authenticate, predictionController.predictSavingsGrowth.bind(predictionController));
router.get('/predictions/loan/:loanId/payoff', authenticate, predictionController.estimateLoanPayoff.bind(predictionController));

export default router;
