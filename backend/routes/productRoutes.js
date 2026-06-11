import express from 'express';
import {
  getProducts,
  getProductById,
  createProductReview,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductSuggestions,
  getMyProducts,
} from '../controllers/productController.js';
import { protect, admin, agent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, agent, createProduct);
router.route('/autocomplete').get(getProductSuggestions);
router.route('/myproducts').get(protect, agent, getMyProducts);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, agent, updateProduct)
  .delete(protect, agent, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

export default router;
