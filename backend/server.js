import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

// Connect to MongoDB Database
connectDB().then(async () => {
  // Proactively seed database if empty
  try {
    const userCount = await User.countDocuments({});
    let adminUser;

    if (userCount === 0) {
      // Create a default admin user
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('Default Admin Account Created: admin@ecommerce.com / admin123');

      // Create a default customer user
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        isAdmin: false,
      });
      console.log('Default Customer Account Created: john@example.com / user123');
    } else {
      adminUser = await User.findOne({ isAdmin: true });
    }

    const productCount = await Product.countDocuments({});
    if (productCount === 0 && adminUser) {
      const sampleProducts = [
        {
          name: 'iPhone 15 Pro Max',
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
          description: 'The latest iPhone with titanium design, powerful A17 Pro chip, and advanced camera system.',
          brand: 'Apple',
          category: 'Electronics',
          price: 1199,
          countInStock: 10,
          rating: 4.8,
          numReviews: 2,
          user: adminUser._id,
          reviews: [
            { name: 'Alice Smith', rating: 5, comment: 'Amazing performance and battery life!', user: adminUser._id },
            { name: 'Bob Johnson', rating: 4.6, comment: 'Camera is incredible, but very expensive.', user: adminUser._id }
          ]
        },
        {
          name: 'Sony WH-1000XM5 Headphones',
          image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
          description: 'Industry-leading noise canceling wireless over-ear headphones with exceptional audio fidelity.',
          brand: 'Sony',
          category: 'Electronics',
          price: 349,
          countInStock: 15,
          rating: 4.7,
          numReviews: 1,
          user: adminUser._id,
          reviews: [
            { name: 'Charlie', rating: 5, comment: 'Best noise cancellation I have ever experienced!', user: adminUser._id }
          ]
        },
        {
          name: 'Nike Air Max Running Shoes',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
          description: 'Comfortable sport shoes for daily running and workouts with active cushion sole design.',
          brand: 'Nike',
          category: 'Fashion',
          price: 129,
          countInStock: 20,
          rating: 4.5,
          numReviews: 1,
          user: adminUser._id,
          reviews: [
            { name: 'David Lee', rating: 4, comment: 'Very comfortable but runs a bit small.', user: adminUser._id }
          ]
        },
        {
          name: 'Mechanical Gaming Keyboard',
          image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600', // fallbacks or specific images
          description: 'Hot-swappable tactile blue switches keyboard with vibrant RGB custom backlight configurations.',
          brand: 'Keychron',
          category: 'Accessories',
          price: 89,
          countInStock: 8,
          rating: 4.6,
          numReviews: 0,
          user: adminUser._id,
          reviews: []
        },
        {
          name: 'Classic Leather Wallet',
          image: 'https://images.unsplash.com/photo-1627124765135-5653012670b1?auto=format&fit=crop&q=80&w=600',
          description: 'Handcrafted genuine leather wallet with multiple card slots and RFID protection technology.',
          brand: 'Timberland',
          category: 'Fashion',
          price: 45,
          countInStock: 12,
          rating: 4.3,
          numReviews: 0,
          user: adminUser._id,
          reviews: []
        },
        {
          name: 'Smart Watch Series 9',
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600',
          description: 'Advanced health tracking, workout analytics, and instant notifications on a bright retina display.',
          brand: 'Apple',
          category: 'Electronics',
          price: 399,
          countInStock: 5,
          rating: 4.9,
          numReviews: 0,
          user: adminUser._id,
          reviews: []
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io); // Make io accessible in routes/controllers

io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Users can join a room based on their user ID to receive direct notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Main Root Endpoint
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Routes configuration
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
