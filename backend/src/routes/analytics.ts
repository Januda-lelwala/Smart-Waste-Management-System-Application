import { Router, Request, Response } from 'express';
import { bins, alerts } from '../data/seed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyCollections = days.map(day => ({
    day,
    count: Math.floor(Math.random() * 40) + 15,
  }));

  const zoneIds = [...new Set(bins.map(b => b.zone))];
  const fillRateByZone = zoneIds.map(zId => {
    const zoneBins = bins.filter(b => b.zone === zId);
    const avg = Math.round(zoneBins.reduce((s, b) => s + b.fill, 0) / zoneBins.length);
    return { zone: zId, avg };
  });

  const alertsByType = (['critical', 'warning', 'info'] as const).map(type => ({
    type,
    count: alerts.filter(a => a.sev === type).length,
  }));

  res.json({
    weeklyCollections,
    fillRateByZone,
    alertsByType,
    totalCollectionsThisMonth: 487,
    avgFillOnCollection: 76,
    fuelSavedLitres: 312,
    co2SavedKg: 748,
  });
});

export default router;