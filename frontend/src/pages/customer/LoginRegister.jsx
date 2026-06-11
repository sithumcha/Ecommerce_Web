import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import { GoogleLogin } from '@react-oauth/google';

const LoginRegister = () => {
  const { userInfo, login, register, loginWithGoogle, error, setError } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgent, setIsAgent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Automatically redirect if user is already signed in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
    return () => {
      setError(null);
    };
  }, [userInfo, navigate, redirect, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, isAgent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error('Google Login Error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed. Please try again.');
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="glass-panel rounded-3xl p-8 border border-slate-200/60 dark:border-dark-800 space-y-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2 bg-primary-600/15 text-primary-600 dark:text-primary-400 rounded-xl mb-1">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLogin ? 'Enter your details to sign in' : 'Sign up to start purchasing'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="flex items-center gap-2.5 py-1">
              <input
                id="isAgent"
                type="checkbox"
                checked={isAgent}
                onChange={(e) => setIsAgent(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="isAgent" className="text-xs font-semibold text-slate-650 dark:text-slate-400 select-none cursor-pointer">
                I want to register as an Agent to sell products (3% commission applies)
              </label>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-3" loading={authLoading}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100 dark:border-dark-800"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-100 dark:border-dark-800"></div>
        </div>

        {/* Google Real Login */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        {/* Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
