import express from 'express';
import {
  registerUser,
  authUser,
  googleLogin,
  subscribeNewsletter,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/newsletter', subscribeNewsletter);
router.route('/profile').get(protect, getUserProfile);

export default router;
