import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import Button from './Button';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-[100] animate-in slide-in-from-bottom-8 duration-500 fade-in">
      <div className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-colors">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-50 dark:bg-dark-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-450 border border-primary-100 dark:border-dark-700">
              <Cookie size={20} />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">We Value Your Privacy</h4>
              <button 
                onClick={handleDecline}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAccept} variant="primary" className="flex-1 py-2 text-xs">
                Accept All
              </Button>
              <Button onClick={handleDecline} variant="outline" className="flex-1 py-2 text-xs">
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
