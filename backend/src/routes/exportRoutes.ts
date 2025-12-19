import { Router } from 'express';
import { exportController } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/csv', authenticate, exportController.exportCSV.bind(exportController));
router.get('/report/:year/:month', authenticate, exportController.generateMonthlyReport.bind(exportController));

export default router;
