import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import sendEmail from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, isAgent } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const user = await User.create({
      name,
      email,
      password,
      isAgent: !!isAgent,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        ecoPoints: user.ecoPoints,
        tier: user.tier,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        ecoPoints: user.ecoPoints,
        tier: user.tier,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google login / register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  const { credential } = req.body; // Expect Google credential token

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400);
      return next(new Error('Invalid Google Token'));
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, return token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        ecoPoints: user.ecoPoints,
        tier: user.tier,
        token: generateToken(user._id),
      });
    } else {
      // User doesn't exist, create one with a randomized password
      const generatedPassword = Math.random().toString(36).slice(-8) + googleId.slice(0, 4);
      user = await User.create({
        name,
        email,
        password: generatedPassword,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isAgent: user.isAgent,
          ecoPoints: user.ecoPoints,
          tier: user.tier,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        return next(new Error('Invalid Google user data'));
      }
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401);
    next(new Error('Failed to verify Google token'));
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/auth/newsletter
// @access  Public
const subscribeNewsletter = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    return next(new Error('Please provide an email address'));
  }

  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f8fafc; border-radius: 10px;">
        <h1 style="color: #4f46e5; margin-bottom: 20px;">Welcome to NexusCart! 🌱</h1>
        <p style="font-size: 18px; color: #334155; margin-bottom: 15px;">Thank you for subscribing to our newsletter!</p>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">You are now on the list to be the first to know about our latest premium products, exclusive eco-friendly offers, and sustainable initiatives.</p>
        <div style="margin: 30px 0;">
          <a href="#" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit NexusCart</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">If you didn't subscribe to this, please ignore this email.</p>
      </div>
    `;

    const success = await sendEmail({
      email,
      subject: 'Welcome to the NexusCart Newsletter!',
      html: emailHtml,
    });

    // Award points if the subscriber is a registered user
    const user = await User.findOne({ email });
    if (user) {
      user.ecoPoints += 100;
      await user.calculateTier();
    }

    if (success) {
      res.status(200).json({ message: 'Newsletter subscription successful. Email sent.' });
    } else {
      res.status(500);
      return next(new Error('Failed to send confirmation email. Please try again later.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        ecoPoints: user.ecoPoints,
        tier: user.tier,
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

export { registerUser, authUser, googleLogin, subscribeNewsletter, getUserProfile };
