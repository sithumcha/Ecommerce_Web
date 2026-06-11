import express from 'express';
import {
  getAdminOverview,
  getAllUsers,
  toggleUserRole,
  deleteUser,
  toggleUserAgent,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/overview', getAdminOverview);
router.get('/users', getAllUsers);
router.put('/users/:id/role', toggleUserRole);
router.put('/users/:id/agent', toggleUserAgent);
router.delete('/users/:id', deleteUser);

export default router;
