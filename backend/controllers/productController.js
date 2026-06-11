import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Fetch all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, pageNumber, pageSize } = req.query;

    const page = Number(pageNumber) || 1;
    const limit = Number(pageSize) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query).limit(limit).skip(skip);

    res.json({ products, page, pages: Math.ceil(count / limit), totalProducts: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  const { rating, comment, image } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        return next(new Error('Product already reviewed'));
      }

      // Check if user has purchased the product and order is delivered
      const hasPurchased = await Order.findOne({
        user: req.user._id,
        isDelivered: true,
        'orderItems.product': req.params.id,
      });

      if (!hasPurchased) {
        res.status(400);
        return next(new Error('You can only review products you have purchased and received.'));
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        image,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      // Award 50 points for leaving a review
      req.user.ecoPoints += 50;
      await req.user.calculateTier();

      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Agent
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Enforce agent ownership check
      if (!req.user.isAdmin && product.user.toString() !== req.user._id.toString()) {
        res.status(401);
        return next(new Error('Not authorized to delete this product'));
      }

      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Agent
const createProduct = async (req, res, next) => {
  try {
    const product = new Product({
      name: 'Sample Name',
      price: 0,
      user: req.user._id,
      image: '/images/sample.jpg',
      brand: 'Sample Brand',
      category: 'Sample Category',
      countInStock: 0,
      description: 'Sample description',
      isAgentProduct: req.user.isAgent ? true : false,
      agentName: req.user.isAgent ? req.user.name : undefined,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Agent
const updateProduct = async (req, res, next) => {
  const { name, price, shippingPrice, description, image, brand, category, countInStock } =
    req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Enforce agent ownership check
      if (!req.user.isAdmin && product.user.toString() !== req.user._id.toString()) {
        res.status(401);
        return next(new Error('Not authorized to update this product'));
      }

      product.name = name || product.name;
      product.price = price === undefined ? product.price : Number(price);
      product.shippingPrice = shippingPrice === undefined ? product.shippingPrice : Number(shippingPrice);
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock =
        countInStock === undefined ? product.countInStock : Number(countInStock);

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get autocomplete product suggestions
// @route   GET /api/products/autocomplete
// @access  Public
const getProductSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.json([]);
    }
    const suggestions = await Product.find({
      name: { $regex: keyword, $options: 'i' }
    })
      .select('_id name category image')
      .limit(6);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in agent products
// @route   GET /api/products/myproducts
// @access  Private/Agent
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProductById,
  createProductReview,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductSuggestions,
  getMyProducts,
};
