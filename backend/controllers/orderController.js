import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';
import sendEmail from '../utils/sendEmail.js';

const stripe = new Stripe(process.env.STRIPE_SECRET || 'sk_test_mock_secret_key_12345');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    couponCode,
    discountAmount,
    redeemedPoints,
  } = req.body;

  try {
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      return next(new Error('No order items'));
    } else {
      // Resolve agent details and calculate commissions for each item
      const resolvedOrderItems = [];
      let totalCommission = 0;

      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404);
          return next(new Error(`Product ${item.product} not found`));
        }

        const isAgent = product.isAgentProduct;
        const commission = isAgent ? Number((product.price * item.qty * 0.05).toFixed(2)) : 0;

        resolvedOrderItems.push({
          name: product.name,
          qty: item.qty,
          image: product.image,
          price: product.price,
          product: product._id,
          isAgentProduct: isAgent,
          agentId: isAgent ? product.user : undefined,
          commission: commission,
        });

        totalCommission += commission;
      }

      const order = new Order({
        orderItems: resolvedOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discountAmount: discountAmount || 0,
        redeemedPoints: redeemedPoints || 0,
        totalCommission: Number(totalCommission.toFixed(2)),
      });

      // Deduct redeemed points from user
      if (redeemedPoints > 0) {
        req.user.ecoPoints = Math.max(0, req.user.ecoPoints - redeemedPoints);
        await req.user.calculateTier();
      }

      const createdOrder = await order.save();

      // Decrement product stock levels
      for (const item of resolvedOrderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock = Math.max(0, product.countInStock - item.qty);
          await product.save();
        }
      }

      // Format items for email
      const itemsHtml = resolvedOrderItems.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price}</td>
        </tr>
      `).join('');

      // Send Order Confirmation Email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">NexusCart Order Confirmation</h2>
          <p>Hi there,</p>
          <p>Thank you for your order! Your order <strong>#${createdOrder._id}</strong> has been successfully placed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Product</th>
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${itemsPrice}</p>
            <p style="margin: 5px 0;"><strong>Shipping:</strong> $${shippingPrice}</p>
            <p style="margin: 5px 0; color: #16a34a;"><strong>Discount:</strong> -$${discountAmount}</p>
            <h3 style="margin: 10px 0 0 0; border-top: 1px solid #cbd5e1; padding-top: 10px;">Total: $${totalPrice}</h3>
          </div>
          
          <p style="margin-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
            If you have any questions, reply to this email or use our live chat on the website.
          </p>
        </div>
      `;

      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmation - ${createdOrder._id}`,
        html: emailHtml,
      });

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      // Check authorization (must be admin or the order owner)
      if (
        req.user.isAdmin ||
        order.user._id.toString() === req.user._id.toString()
      ) {
        res.json(order);
      } else {
        res.status(401);
        return next(new Error('Not authorized to view this order'));
      }
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || 'mock_stripe_charge_id',
        status: req.body.status || 'succeeded',
        update_time: req.body.update_time || new Date().toISOString(),
        email_address: req.body.email_address || req.user.email,
      };

      // Award points (e.g., 1 point per $1 spent)
      const pointsEarned = Math.floor(order.totalPrice);
      if (pointsEarned > 0) {
        req.user.ecoPoints += pointsEarned;
        await req.user.calculateTier();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();

      // Emit real-time notification to the user
      const io = req.app.get('io');
      if (io) {
        io.to(order.user.toString()).emit('order_status_update', {
          orderId: order._id,
          status: 'Delivered',
          message: `Your order ${order._id.toString().substring(0, 8)} has been delivered!`,
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/payment-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  const { amount } = req.body;

  try {
    // Return a real payment intent if STRIPE_SECRET is valid, or mock clientSecret
    let clientSecret = 'mock_secret_client_key_for_testing_123';
    if (process.env.STRIPE_SECRET && !process.env.STRIPE_SECRET.startsWith('sk_test_mock')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
      });
      clientSecret = paymentIntent.client_secret;
    }
    res.json({ clientSecret });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a promo code / coupon
// @route   POST /api/orders/coupon
// @access  Private
const validateCoupon = async (req, res, next) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    res.status(400);
    return next(new Error('Please provide a coupon code'));
  }

  const upperCode = code.toUpperCase().trim();
  let discount = 0;
  let message = '';

  if (upperCode === 'ECO20') {
    discount = Number((cartTotal * 0.2).toFixed(2));
    message = '20% Eco-Discount Applied';
  } else if (upperCode === 'NEXUS10') {
    discount = Number((cartTotal * 0.1).toFixed(2));
    message = '10% Nexus-Discount Applied';
  } else if (upperCode === 'WELCOME5') {
    discount = Math.min(5.0, cartTotal);
    message = '$5.00 Welcome Discount Applied';
  } else {
    res.status(400);
    return next(new Error('Invalid coupon code'));
  }

  res.json({
    code: upperCode,
    discount,
    message,
    newTotal: Number((cartTotal - discount).toFixed(2))
  });
};

// @desc    Update order to cancelled
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check authorization (must be admin or the order owner)
      if (
        !req.user.isAdmin &&
        order.user.toString() !== req.user._id.toString()
      ) {
        res.status(401);
        return next(new Error('Not authorized to cancel this order'));
      }

      if (order.isDelivered) {
        res.status(400);
        return next(new Error('Delivered orders cannot be cancelled. You can request a return instead.'));
      }

      if (order.isCancelled) {
        res.status(400);
        return next(new Error('Order is already cancelled'));
      }

      // Check if order was created more than 12 hours ago
      const hoursElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursElapsed > 12) {
        res.status(400);
        return next(new Error('Orders can only be cancelled within 12 hours of creation.'));
      }

      order.isCancelled = true;
      order.cancelledAt = Date.now();

      // Restore product stock counts
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.qty;
          await product.save();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Request order return
// @route   PUT /api/orders/:id/return
// @access  Private
const requestOrderReturn = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check authorization (must be admin or the order owner)
      if (
        !req.user.isAdmin &&
        order.user.toString() !== req.user._id.toString()
      ) {
        res.status(401);
        return next(new Error('Not authorized to request return for this order'));
      }

      if (!order.isDelivered) {
        res.status(400);
        return next(new Error('Order must be delivered before requesting a return'));
      }

      if (order.isCancelled) {
        res.status(400);
        return next(new Error('Cancelled orders cannot be returned'));
      }

      if (order.isReturnRequested) {
        res.status(400);
        return next(new Error('Return has already been requested for this order'));
      }

      order.isReturnRequested = true;
      order.returnRequestedAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
const updateOrderToShipped = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isShipped = true;
      order.shippedAt = Date.now();

      const updatedOrder = await order.save();

      // Emit real-time notification to the user
      const io = req.app.get('io');
      if (io) {
        io.to(order.user.toString()).emit('order_status_update', {
          orderId: order._id,
          status: 'Shipped',
          message: `Your order ${order._id.toString().substring(0, 8)} has been shipped!`,
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid (manually by Admin)
// @route   PUT /api/orders/:id/pay-admin
// @access  Private/Admin
const updateOrderToPaidAdmin = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify if user purchased a product and it was delivered
// @route   GET /api/orders/verify-purchase/:productId
// @access  Private
const verifyProductPurchase = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      isDelivered: true,
      'orderItems.product': req.params.productId,
    });

    res.json({ canReview: orders.length > 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (
        !req.user.isAdmin &&
        order.user.toString() !== req.user._id.toString()
      ) {
        res.status(401);
        return next(new Error('Not authorized to delete this order'));
      }

      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: 'Order removed' });
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent earnings and sales stats
// @route   GET /api/orders/agent/earnings
// @access  Private/Agent
const getAgentEarnings = async (req, res, next) => {
  try {
    const orders = await Order.find({
      isPaid: true,
      'orderItems.agentId': req.user._id,
    });

    let totalSales = 0;
    let totalCommission = 0;
    let totalQtySold = 0;

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.agentId && item.agentId.toString() === req.user._id.toString()) {
          const itemRevenue = item.price * item.qty;
          totalSales += itemRevenue;
          totalCommission += item.commission || 0;
          totalQtySold += item.qty;
        }
      });
    });

    const myEarnings = totalSales - totalCommission;

    res.json({
      totalSales: Number(totalSales.toFixed(2)),
      totalCommission: Number(totalCommission.toFixed(2)),
      myEarnings: Number(myEarnings.toFixed(2)),
      totalQtySold,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales data for analytics
// @route   GET /api/orders/sales-data
// @access  Private/Admin
const getSalesData = async (req, res, next) => {
  try {
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          adminCommission: { $sum: "$totalCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for Recharts
    const formattedData = salesData.map(data => ({
      date: data._id,
      sales: Number(data.totalSales.toFixed(2)),
      orders: data.totalOrders,
      adminCommission: Number((data.adminCommission || 0).toFixed(2))
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

export {
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
};
