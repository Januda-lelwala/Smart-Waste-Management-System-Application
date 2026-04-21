import { Router, Request, Response } from 'express';
import { bins } from '../data/seed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(bins);
});

router.get('/:id', (req: Request, res: Response) => {
  const bin = bins.find(b => b.id === req.params.id);
  if (!bin) return res.status(404).json({ error: 'Bin not found' });
  res.json(bin);
});

export default router;