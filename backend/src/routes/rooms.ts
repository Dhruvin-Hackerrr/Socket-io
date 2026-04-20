import { Router } from 'express';
import { body } from 'express-validator';
import { getRooms, createRoom, getRoomMessages } from '../controllers/roomController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // all room routes require auth

router.get('/', getRooms);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Room name is required').isLength({ min: 2, max: 50 }),
    body('description').optional().isLength({ max: 200 }),
    body('isPrivate').optional().isBoolean(),
  ],
  createRoom
);

router.get('/:roomId/messages', getRoomMessages);

export default router;
