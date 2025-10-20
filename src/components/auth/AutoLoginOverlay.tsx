/**
 * @fileoverview Auto-Login Loading Overlay - Full screen loading animation during automatic login
 */

import React from 'react';
import { Loader2, Shield, Sparkles, CheckCircle, Search } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface AutoLoginOverlayProps {
  email: string;
  isVisible: boolean;
  mode?: 'checking' | 'logging-in'; // New prop to distinguish between checking and logging in
}

export const AutoLoginOverlay: React.FC<AutoLoginOverlayProps> = ({ 
  email, 
  isVisible, 
  mode = 'checking' 
}) => {
  const { t } = useTranslations();

  if (!isVisible) return null;

  const isChecking = mode === 'checking';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-md animate-fadeIn">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-md mx-4">
        {/* Animated logo/spinner */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-32 h-32 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full"></div>
          </div>
          
          {/* Middle ring */}
          <div className="absolute inset-2 animate-spin-reverse">
            <div className="w-28 h-28 border-4 border-transparent border-t-indigo-400 border-l-blue-400 rounded-full"></div>
          </div>
          
          {/* Inner content */}
          <div className="relative flex items-center justify-center w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl">
              {isChecking ? (
                <Search className="h-8 w-8 text-white animate-pulse" />
              ) : (
                <Shield className="h-8 w-8 text-white animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Text content - Different based on mode */}
        {isChecking ? (
          // Checking device state
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {t('auth.deviceCheck.title', 'Checking Device')}
              </h2>
              
              <div className="flex items-center justify-center gap-2 text-blue-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-lg font-medium">
                  {t('auth.deviceCheck.subtitle', 'Looking for saved account...')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-base text-blue-100 animate-pulse">
                {t('auth.deviceCheck.message', 'Checking if your device has an account')}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-blue-300/80">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t('auth.deviceCheck.pleaseWait', 'This will only take a moment')}</span>
              </div>
            </div>
          </div>
        ) : (
          // Logging in state (device found)
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                <h2 className="text-3xl font-bold text-white">
                  {t('auth.autoLogin.title', 'Welcome Back!')}
                </h2>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
              
              <div className="flex items-center justify-center gap-2 text-blue-200">
                <CheckCircle className="h-4 w-4" />
                <p className="text-lg font-medium">
                  {t('auth.autoLogin.recognized', 'Device Recognized')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {email && (
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <p className="text-sm text-white/90 font-medium">
                    {email}
                  </p>
                </div>
              )}
              
              <p className="text-base text-blue-100 animate-pulse">
                {t('auth.autoLogin.loggingIn', 'Logging you in automatically...')}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-blue-300/80">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t('auth.autoLogin.pleaseWait', 'Please wait a moment')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

