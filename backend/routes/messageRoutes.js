import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  deleteConversation,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/conversations').get(protect, getConversations);
router.route('/:userId').get(protect, getMessagesWithUser).delete(protect, deleteConversation);

export default router;
