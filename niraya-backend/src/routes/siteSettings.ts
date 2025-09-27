import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
// Use require to avoid TS named import resolution glitches during dev
// eslint-disable-next-line @typescript-eslint/no-var-requires
const site = require('../controllers/siteSettingsController');

const router = Router();

router.get('/homepage', site.getHomepageSettings as any);
router.get('/homepage-resolved', site.getHomepageResolved as any);
router.put('/homepage', adminRequired as any, site.upsertHomepageSettings as any);

export default router;
