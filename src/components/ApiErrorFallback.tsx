'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApiErrorFallbackProps {
  error: string;
  onRetry: () => void;
  retryDelay?: number; // seconds
}

export default function ApiErrorFallback({ error, onRetry, retryDelay = 10 }: ApiErrorFallbackProps) {
  const [countdown, setCountdown] = useState(retryDelay);
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    if (!autoRetry) return;
    if (countdown <= 0) {
      onRetry();
      setCountdown(retryDelay);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, autoRetry, onRetry, retryDelay]);

  const handleManualRetry = useCallback(() => {
    setAutoRetry(false);
    onRetry();
  }, [onRetry]);

  const progress = ((retryDelay - countdown) / retryDelay) * 100;

  return (
    <div className="animate-fade-in">
      <div
        className="relative rounded-xl p-6 overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Progress bar */}
        {autoRetry && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear rounded-r-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">API Error</h3>
            <p className="text-sm text-zinc-400 mb-3 break-words">{error}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRetry}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Retry Now
              </button>

              {autoRetry && (
                <span className="text-xs text-zinc-500">
                  Auto-retry in{' '}
                  <span className="text-amber-400 font-mono font-semibold">{countdown}s</span>
                </span>
              )}

              {autoRetry && (
                <button
                  onClick={() => setAutoRetry(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel auto-retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
