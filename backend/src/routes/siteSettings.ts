import { Router } from 'express';
import { adminRequired } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

router.get('/homepage', async (_req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { key: 'homepage' } });
    return res.json({ settings: settings?.homepage || {} });
  } catch (err) {
    console.error('Get homepage settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/homepage-resolved', async (_req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { key: 'homepage' } });
    return res.json({ settings: settings?.homepage || {} });
  } catch (err) {
    console.error('Get homepage resolved error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/homepage', adminRequired as any, async (req, res) => {
  try {
    const homepage = req.body || {};
    const existing = await prisma.siteSettings.findFirst({ where: { key: 'homepage' } });
    let settings;
    if (existing) {
      settings = await prisma.siteSettings.update({ where: { id: existing.id }, data: { homepage } });
    } else {
      settings = await prisma.siteSettings.create({ data: { key: 'homepage', homepage } });
    }
    return res.json({ settings: settings.homepage });
  } catch (err) {
    console.error('Upsert homepage settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
