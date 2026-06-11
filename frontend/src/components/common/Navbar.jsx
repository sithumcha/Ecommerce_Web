import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, ShoppingBag, Sun, Moon, Search, Heart, Briefcase, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems, setIsCartOpen } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const { currency, setCurrency, CURRENCY_RATES } = useCurrency();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // Search Autocomplete State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value.trim()) {
      try {
        const { data } = await api.get(`/products/autocomplete?keyword=${value}`);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Dark/Light Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-dark-950/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-dark-900/50 transition-colors duration-300">
      {/* Absolute top glowing animated color-bar */}
      <div className="h-[3px] bg-gradient-to-r from-primary-500 via-fuchsia-500 to-pink-500 w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl group-hover:bg-primary-600/20 group-hover:scale-105 transition-all duration-300">
              <ShoppingBag size={22} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
              Nexus<span className="text-primary-600 dark:text-primary-400 font-extrabold">Cart</span>
            </span>
          </Link>

          {/* Search Autocomplete Bar */}
          <div className="hidden md:block relative w-64 lg:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder={t('navbar.search')}
                value={searchKeyword}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full form-input py-1.5 pl-4 pr-4 text-xs font-semibold"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 mt-2 w-full rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 border-b border-slate-100 dark:border-dark-800/60 mb-1">
                  Product Suggestions
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        navigate(`/product/${item._id}`);
                        setSearchKeyword('');
                      }}
                      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-left hover:bg-primary-50/60 dark:hover:bg-primary-950/20 group transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200/50 dark:border-dark-800 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                          in {item.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/shop" className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all duration-300 font-medium">
              {t('navbar.shop')}
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/profile?tab=wishlist"
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 rounded-xl transition-all duration-300"
              title="My Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Messages Link */}
            {userInfo && (
              <Link
                to="/messages"
                className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 rounded-xl transition-all duration-300"
                title="Messages"
              >
                <MessageSquare size={20} />
              </Link>
            )}

            {/* Cart Link */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 rounded-xl transition-all duration-300"
              title="View Cart"
            >
              <ShoppingCart size={20} />
              {totalCartQty > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-primary-600 to-fuchsia-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {totalCartQty}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all duration-300"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language Selector */}
            <select
              value={i18n.language}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                localStorage.setItem('language', e.target.value);
              }}
              className="p-2 rounded-xl text-sm font-semibold bg-slate-50/50 dark:bg-dark-900/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all cursor-pointer outline-none"
              title="Select Language"
            >
              <option value="en" className="bg-white dark:bg-dark-950 text-slate-900 dark:text-slate-200">EN</option>
              <option value="si" className="bg-white dark:bg-dark-950 text-slate-900 dark:text-slate-200">සිං</option>
            </select>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="p-2 rounded-xl text-sm font-semibold bg-slate-50/50 dark:bg-dark-900/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all cursor-pointer outline-none"
              title="Select Currency"
            >
              {Object.keys(CURRENCY_RATES).map((code) => (
                <option key={code} value={code} className="bg-white dark:bg-dark-950 text-slate-900 dark:text-slate-200">
                  {code} ({CURRENCY_RATES[code].symbol})
                </option>
              ))}
            </select>

            {/* Auth Dropdown / Buttons */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-300 font-medium"
                >
                  <User size={18} />
                  <span>{userInfo.name}</span>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {userInfo.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-650 dark:text-slate-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    {userInfo.isAgent && (
                      <Link
                        to="/agent/products"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-650 dark:text-slate-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Briefcase size={16} />
                        Agent Portal
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-650 dark:text-slate-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <User size={16} />
                      {t('navbar.profile')}
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/15 hover:shadow-primary-600/25 transition-all duration-300"
              >
                {t('navbar.login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-600 dark:text-slate-400" title="View Cart">
              <ShoppingCart size={22} />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-fuchsia-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-dark-900 bg-white dark:bg-dark-950 px-4 pt-2 pb-4 space-y-2 shadow-inner">
          <Link
            to="/shop"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Shop
          </Link>
          {userInfo ? (
            <>
              {userInfo.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Admin Dashboard
                </Link>
              )}
              {userInfo.isAgent && (
                <Link
                  to="/agent/products"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-slate-900 dark:hover:text-white transition-all font-semibold"
                >
                  Agent Portal
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
