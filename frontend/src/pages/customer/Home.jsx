import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SkeletonProductCard } from '../../components/common/Skeleton';
import AnimatedPage from '../../components/common/AnimatedPage';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Loader from '../../components/common/Loader';
import {
  ArrowRight,
  Laptop,
  Shirt,
  Keyboard,
  Star,
  Sun,
  Moon,
  Sunset,
  Truck,
  ShieldCheck,
  Headphones,
  Leaf,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/common/Button';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: productResponse, loading, error } = useFetch('/products');
  const products = productResponse?.products || productResponse || [];
  
  // Newsletter state
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Carousel states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const carouselProducts = products ? products.slice(0, 8) : [];
  const maxIndex = Math.max(0, carouselProducts.length - itemsPerPage);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Determine current climate change visual mood based on hours
  const getClimateMood = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 18) {
      return {
        image: '/images/climate_morning.png',
        tagline: 'Morning Solar Production',
        description: 'Activating solar panels and clean grids during peak daylight hours.',
        icon: Sun,
        iconColor: 'text-amber-500',
        label: 'Daylight Mode',
      };
    } else if (hours >= 18 && hours < 21) {
      return {
        image: '/images/climate_evening.png',
        tagline: 'Evening Wind Transition',
        description: 'Harnessing wind speeds across high-capacity turbines during sunset.',
        icon: Sunset,
        iconColor: 'text-orange-500',
        label: 'Golden Mode',
      };
    } else {
      return {
        image: '/images/climate_night.png',
        tagline: 'Night Grid Smart Conservation',
        description: 'Optimizing low-load smart conservations under clean starry horizons.',
        icon: Moon,
        iconColor: 'text-indigo-400',
        label: 'Night Mode',
      };
    }
  };

  const { image, tagline, description: moodDesc, icon: MoodIcon, iconColor, label: moodLabel } = getClimateMood();

  const categories = [
    { name: 'Electronics', icon: Laptop, count: 'Over 120 items', query: 'Electronics' },
    { name: 'Fashion', icon: Shirt, count: 'Over 80 items', query: 'Fashion' },
    { name: 'Accessories', icon: Keyboard, count: 'Over 50 items', query: 'Accessories' },
    { name: 'Home & Garden', icon: Sun, count: 'Over 40 items', query: 'Home & Garden' },
    { name: 'Sports', icon: Star, count: 'Over 30 items', query: 'Sports' },
  ];

  const highlights = [
    { title: 'Free Eco-Shipping', desc: 'Carbon-neutral dispatch on orders over $100', icon: Truck },
    { title: 'Secure Checkouts', desc: 'Stripe encrypted multi-factor transactions', icon: ShieldCheck },
    { title: '24/7 Expert Support', desc: 'Direct assistant channels for order inquiries', icon: Headphones },
    { title: 'Green Packaging', desc: '100% biodegradable and recycled boxing', icon: Leaf },
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Tech Consultant',
      comment: 'NexusCart is outstanding. The iPhone 15 Pro Max arrived in bio-packaging. Payment was seamless.',
      rating: 5,
    },
    {
      name: 'Marcus Chen',
      role: 'Fashion Designer',
      comment: 'Their apparel collection is premium quality, and the carbon-neutral shipping matches our eco values!',
      rating: 5,
    },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubscribing) return;
    
    try {
      setIsSubscribing(true);
      await api.post('/auth/newsletter', { email });
      setNewsletterSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <AnimatedPage className="space-y-20 pb-20">
      
      {/* 1. HERO GRID SECTION - NEXT GEN OVERHAUL */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-dark-950 border border-slate-800 dark:border-dark-800 px-6 py-16 sm:px-12 sm:py-24 lg:px-20 transition-colors duration-500 shadow-2xl">
        {/* Massive Animated Glow Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-float"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none rotate-45 mix-blend-screen"></div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
          {/* Brand Marketing */}
          <motion.div 
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-300 text-xs font-bold uppercase tracking-widest shadow-xl"
            >
              <Star size={14} className="fill-accent-400 text-accent-400 animate-pulse" /> 
              Next-Gen Eco Retail
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.1] text-white">
              {t('home.hero_title')} <br/>
              <span className="gradient-text font-extrabold pb-2 inline-block">{t('home.hero_highlight')}</span>
            </h1>
            
            <p className="text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed font-medium">
              {t('home.hero_subtitle')} Experience the pinnacle of sustainable commerce with carbon-neutral logistics and premium products.
            </p>
            
            <motion.div 
              className="flex flex-wrap gap-5 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <button
                onClick={() => navigate('/shop')}
                className="group relative px-8 py-4 bg-white text-slate-950 font-extrabold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {t('home.shop_now')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-slate-800/40 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-600/50 text-white font-bold rounded-2xl transition-all duration-300 hover:border-slate-400 shadow-lg active:scale-95"
              >
                {t('home.join_nexus')}
              </button>
            </motion.div>
          </motion.div>

          {/* Time-of-Day Climate Awareness Graphics Card - Floating 3D effect */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          >
            <div className="relative aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl group transition-all duration-500 transform-gpu hover:-translate-y-4 hover:shadow-[0_20px_80px_rgba(79,70,229,0.3)]">
              <div className="absolute inset-0 bg-slate-900/40 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
              <img
                src={image}
                alt="Climate Awareness"
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              
              {/* Glassmorphic info panel overlay */}
              <div className="absolute inset-x-4 bottom-4 z-20 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 ${iconColor}`}>
                    <MoodIcon size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {moodLabel}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-white leading-tight">
                  {tagline}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {moodDesc}
                </p>
                
                {/* Simulated live grid metric */}
                <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Grid Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-bold">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS HIGHLIGHTS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="glass-panel rounded-2xl p-6 border border-slate-200/60 dark:border-dark-800/80 flex gap-4 items-start"
            >
              <div className="p-3 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl">
                <Icon size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. CATEGORY MAPS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('home.shop_by_collection')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('home.explore_categories')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/shop?category=${cat.query}`)}
                className="glass-panel glass-panel-hover flex items-center gap-5 p-6 rounded-2xl text-left group"
              >
                <div className="p-4 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl group-hover:bg-primary-600/20 group-hover:scale-110 transition-all duration-300">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{cat.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (CAROUSEL) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 dark:border-dark-900 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('home.featured_products')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('home.discover_best')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                disabled={maxIndex === 0}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-850 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                disabled={maxIndex === 0}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-850 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link
              to="/shop"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 flex items-center gap-1 group pb-1"
            >
              {t('home.see_all')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => <SkeletonProductCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-505 bg-red-50/10 border border-red-200 dark:border-red-500/10 rounded-2xl">{error}</div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden rounded-3xl -mx-3 px-3 py-4">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {carouselProducts.map((product) => (
                  <div
                    key={product._id}
                    className="px-3 shrink-0 transition-all duration-300"
                    style={{ width: `${100 / itemsPerPage}%` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Indicator dots */}
            {maxIndex > 0 && (
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(maxIndex + 1)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'w-6 bg-primary-650 dark:bg-primary-450'
                        : 'w-2 bg-slate-250 dark:bg-dark-800'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. ECO COMMITMENT FEATURE */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/60 dark:border-dark-800/80 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
            <Leaf size={12} /> {t('home.environmental_promise')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {t('home.eco_title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {t('home.eco_desc')}
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {t('home.eco_point_1')}
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {t('home.eco_point_2')}
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {t('home.eco_point_3')}
            </li>
          </ul>
        </div>
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-dark-800 shadow-lg bg-emerald-950">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800"
            alt="Eco Forest Reforestation"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-transparent flex flex-col justify-end p-6 text-white">
            <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-emerald-300">
              {t('home.reforestation')}
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-normal">
              {t('home.reforestation_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS & REVIEWS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('home.what_customers_say')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('home.verified_feedback')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="glass-panel rounded-2xl p-6 border border-slate-200/60 dark:border-dark-800/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{item.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm italic leading-relaxed">
                "{item.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEWSLETTER SUBSCRIPTION CARD */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/60 dark:border-dark-800/80 text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl"></div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Subscribe to NexusLetter
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-normal">
            Stay updated with special ecological events, member sales, and product catalogs.
          </p>
        </div>

        {newsletterSubscribed ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl font-semibold max-w-sm mx-auto animate-in fade-in zoom-in-95">
            🎉 Thank you for subscribing! Check your email confirmation.
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input w-full py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubscribing ? 'Sending...' : <><Send size={18} /> Subscribe</>}
            </button>
          </form>
        )}
      </section>

    </AnimatedPage>
  );
};

export default Home;
