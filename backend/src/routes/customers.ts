import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { listCustomers } from '../controllers/customersController';

const router = Router();

router.get('/', adminRequired as any, listCustomers as any);

export default router;
