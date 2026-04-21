import { Router, Request, Response } from 'express';
import { pickupRoutes } from '../data/seed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(pickupRoutes);
});

router.get('/:id', (req: Request, res: Response) => {
  const route = pickupRoutes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json(route);
});

export default router;