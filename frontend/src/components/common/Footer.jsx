import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/20 dark:from-dark-950 dark:via-dark-950 dark:to-indigo-950/10 border-t border-slate-200 dark:border-dark-900 mt-auto transition-colors duration-300 overflow-hidden">
      {/* Absolute top glowing animated color-bar */}
      <div className="h-[2px] bg-gradient-to-r from-primary-500 via-fuchsia-500 to-pink-500/50 w-full opacity-70"></div>

      {/* Dynamic Background Mesh Glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/5 dark:bg-primary-500/3 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-500/5 dark:bg-fuchsia-500/3 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl">
                <ShoppingBag size={20} />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                Nexus<span className="text-primary-600 dark:text-primary-400 font-extrabold">Cart</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
              Experience the next generation of e-commerce. Seamless payments, real-time analytics, and premium quality products.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white dark:bg-dark-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-800 hover:border-slate-355 dark:hover:border-slate-600 transition-all shadow-sm dark:shadow-none">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 bg-white dark:bg-dark-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-800 hover:border-slate-355 dark:hover:border-slate-600 transition-all shadow-sm dark:shadow-none">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 bg-white dark:bg-dark-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-800 hover:border-slate-355 dark:hover:border-slate-600 transition-all shadow-sm dark:shadow-none">
                <Github size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/shop" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=Electronics" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">Electronics</Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">Fashion</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">About Us</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-dark-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} NexusCart Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-slate-600 text-xs">Stripe Secured</span>
            <span className="text-slate-600 text-xs">MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
