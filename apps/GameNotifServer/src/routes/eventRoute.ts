import { Router } from 'express';
import { getActiveEvents, createEvent } from '../controllers/eventController.js';
import { authenticateService } from '../middleware/authenticate.js';

const router: Router = Router();
router.get('/active', authenticateService, getActiveEvents);
router.post('/create', authenticateService, createEvent);

export default router;