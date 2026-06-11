import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createPaymentIntent,
  validateCoupon,
  cancelOrder,
  requestOrderReturn,
  updateOrderToShipped,
  updateOrderToPaidAdmin,
  verifyProductPurchase,
  getAgentEarnings,
  getSalesData,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin, agent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/coupon').post(protect, validateCoupon);
router.route('/myorders').get(protect, getMyOrders);
router.route('/sales-data').get(protect, admin, getSalesData);
router.route('/payment-intent').post(protect, createPaymentIntent);
router.route('/verify-purchase/:productId').get(protect, verifyProductPurchase);
router.route('/agent/earnings').get(protect, agent, getAgentEarnings);
router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/return').put(protect, requestOrderReturn);
router.route('/:id/ship').put(protect, admin, updateOrderToShipped);
router.route('/:id/pay-admin').put(protect, admin, updateOrderToPaidAdmin);

export default router;
