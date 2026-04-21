import { Router, Request, Response } from 'express';
import { zones } from '../data/seed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(zones);
});

router.get('/:id', (req: Request, res: Response) => {
  const zone = zones.find(z => z.id === req.params.id);
  if (!zone) return res.status(404).json({ error: 'Zone not found' });
  res.json(zone);
});

export default router;