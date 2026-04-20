import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import roomRoutes from './rooms';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);

export default router;
