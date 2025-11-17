import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
  purchaseFromCart,
} from '../controllers/domainCartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', getCart);

// Clear all items from cart (must come before /:id routes)
router.delete('/clear/all', clearCart);

// Add domain to cart
router.post('/', addToCart);

// Purchase all domains from cart
router.post('/purchase', purchaseFromCart);

// Update cart item
router.put('/:id', updateCartItem);

// Remove domain from cart (by ID)
router.delete('/:id', removeFromCart);

// Remove domain from cart (by domain name in body) - this will only match if no ID is provided
router.delete('/', removeFromCart);

export default router;

