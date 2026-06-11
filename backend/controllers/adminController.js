import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get dashboard metrics & chart data
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    // Calculate total revenue from paid orders
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Calculate total commission from paid orders
    const totalCommission = paidOrders.reduce((acc, order) => acc + (order.totalCommission || 0), 0);

    // Retrieve active (pending/not delivered) orders count
    const activeOrders = await Order.countDocuments({ isPaid: true, isDelivered: false });

    // Timeframe filter logic
    const { timeframe } = req.query;
    let dateFrom = null;
    let dateFormat = '%Y-%m'; // Default Monthly

    if (timeframe === '7days') {
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 7);
      dateFormat = '%Y-%m-%d';
    } else if (timeframe === '30days') {
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      dateFormat = '%Y-%m-%d';
    }

    const matchStage = { isPaid: true };
    if (dateFrom) {
      matchStage.createdAt = { $gte: dateFrom };
    }

    // Aggregate sales for charts dynamically
    const salesAggregation = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const chartData = salesAggregation.map((item) => ({
      month: item._id,
      revenue: item.revenue,
      orders: item.count,
    }));

    // If chartData is empty, send mock data
    const finalChartData = chartData.length > 0 ? chartData : [
      { month: 'Jan', revenue: 4000, orders: 24 },
      { month: 'Feb', revenue: 3000, orders: 18 },
      { month: 'Mar', revenue: 5000, orders: 29 },
      { month: 'Apr', revenue: 2780, orders: 20 },
      { month: 'May', revenue: 1890, orders: 15 },
      { month: 'Jun', revenue: 2390, orders: 18 },
    ];

    // Query low-stock products (less than 5 left)
    const lowStockAlerts = await Product.find({ countInStock: { $lt: 5 } }).select('name countInStock image price');

    res.json({
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        activeOrders,
        totalCommission: Number(totalCommission.toFixed(2)),
      },
      chartData: finalChartData,
      lowStockAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle admin status of a user
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const toggleUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        return next(new Error('You cannot modify your own role'));
      }
      user.isAdmin = !user.isAdmin;
      await user.save();
      res.json({ message: 'User role updated successfully', user });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        return next(new Error('You cannot delete your own admin account'));
      }
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle agent status of a user
// @route   PUT /api/admin/users/:id/agent
// @access  Private/Admin
const toggleUserAgent = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAgent = !user.isAgent;
      await user.save();
      res.json({ message: 'User agent status updated successfully', user });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

export { getAdminOverview, getAllUsers, toggleUserRole, deleteUser, toggleUserAgent };
