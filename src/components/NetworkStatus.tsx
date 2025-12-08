import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Auto-hide the "Back Online" message after 3 seconds
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Stable Online State (Hidden)
  if (isOnline && !showBackOnline) {
    return null; 
  }

  // 2. Just Reconnected State (Green Toast)
  if (isOnline && showBackOnline) {
    return (
      <div className="bg-green-900/90 backdrop-blur-md border-b border-green-700 px-4 py-2 text-sm text-green-100 flex items-center justify-center gap-2 sticky top-0 z-[100] animate-in slide-in-from-top-2 shadow-lg shadow-green-900/20">
        <Wifi size={16} />
        <span className="font-bold">Back Online.</span>
        <span className="opacity-80 text-xs hidden sm:inline">Syncing pending data...</span>
      </div>
    );
  }

  // 3. Offline State (Red Warning)
  return (
    <div className="bg-red-900/90 backdrop-blur-md border-b border-red-700 px-4 py-2 text-sm text-red-100 flex items-center justify-center gap-2 sticky top-0 z-[100] animate-in slide-in-from-top-2 shadow-lg shadow-red-900/20">
      <WifiOff size={16} />
      <span className="font-bold">You are Offline.</span>
      <span className="opacity-80 text-xs hidden sm:inline">You can continue working; data will sync later.</span>
    </div>
  );
};