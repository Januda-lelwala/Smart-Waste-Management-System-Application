import { Router, Request, Response } from 'express';
import { alerts } from '../data/seed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(alerts);
});

// Mark a single alert as read
router.patch('/:id/read', (req: Request, res: Response) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.read = true;
  res.json(alert);
});

// Mark all alerts as read
router.patch('/read-all', (_req: Request, res: Response) => {
  alerts.forEach(a => { a.read = true; });
  res.json({ updated: alerts.length });
});

export default router;