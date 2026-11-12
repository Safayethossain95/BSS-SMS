import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  X,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import type { AuthUser } from '../types';
import { DEMO_USER } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

type AuthStep = 'login' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  isDark,
  onToggleTheme,
}) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Forgot password lookup state
  const [lookupUsername, setLookupUsername] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanUsername === 'admin' && cleanPassword === 'admin') {
        setIsLoading(false);
        onLogin(DEMO_USER);
      } else {
        setIsLoading(false);
        setToastMessage('Invalid username or password. Use demo account: admin / admin');
      }
    }, 450);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupUsername.trim().toLowerCase() === 'admin') {
      setForgotSuccess(true);
    } else {
      setToastMessage('Account not found. For demo access, use username "admin".');
    }
  };

  const handleAutofill = () => {
    setUsername('admin');
    setPassword('admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative bg-bg text-ink transition-colors duration-200">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-600 text-white shadow-xl shadow-red-500/20 border border-red-500">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-white" />
              <span className="text-xs sm:text-sm font-medium leading-snug truncate">
                {toastMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Theme toggle switch */}
      <button
        type="button"
        onClick={onToggleTheme}
        className={`theme-toggle !fixed !top-5 !right-5 !z-50 ${isDark ? 'active' : ''}`}
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 50 }}
        aria-label="Toggle dark mode"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="theme-knob">
          {isDark ? (
            <Moon className="w-3 h-3 text-white" />
          ) : (
            <Sun className="w-3 h-3 text-white" />
          )}
        </div>
      </button>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-surface rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-card border border-gray-200 dark:border-zinc-800 transition-colors">
        {step === 'login' && (
          <div>
            {/* Brand Header */}
            <div className="flex flex-col items-center gap-2 mb-6 text-center select-none">
              <img
                src={isDark ? '/assets/images/logo/logo_white.webp' : '/assets/images/logo/logo_black.webp'}
                alt="BSS Logo"
                width={120}
                height={120}
                className="w-28 h-28 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-lg font-bold font-serif text-ink tracking-tight">
                  BSS SMS Portal
                </h1>
                <div className="text-xs text-ink-muted mt-0.5">
                  Sign in to your portal &mdash; Est. 2004
                </div>
              </div>
            </div>

            {/* Demo Credentials Pill */}
            <div className="mb-5 p-3 rounded-xl bg-surface-2 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-ink-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Demo:</span>
                <span className="font-mono font-semibold text-ink">admin</span>
                <span className="text-ink-faint">/</span>
                <span className="font-mono font-semibold text-ink">admin</span>
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[11px] font-semibold text-[#1b1e42] dark:text-accent hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    autoFocus
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl pl-3.5 pr-10 py-2.5 text-sm outline-none transition-colors"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-full bg-[#1b1e42] hover:bg-[#25285a] dark:bg-accent dark:hover:bg-[#8286E2] text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Forgot password link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLookupUsername(username);
                    setForgotSuccess(false);
                    setStep('forgot');
                  }}
                  className="text-xs text-ink-muted hover:text-[#1b1e42] dark:hover:text-accent hover:underline transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW: FORGOT PASSWORD / IDENTIFY */}
        {step === 'forgot' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setStep('login')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3 border border-red-200 dark:border-red-900">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink">Find Your Account</h2>
              <p className="text-xs text-ink-muted mt-1.5 max-w-xs mx-auto">
                Please enter your username to search for your account.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 border border-gray-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Account Identified</span>
                  </div>
                  <div className="text-xs text-ink-muted leading-relaxed">
                    Demo Administrator Account found. The default credentials are:
                  </div>
                  <div className="p-2.5 bg-surface rounded-lg border border-gray-200 dark:border-zinc-800 font-mono text-xs flex justify-between">
                    <span>Username: <strong>admin</strong></span>
                    <span>Password: <strong>admin</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                    setStep('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#1b1e42] hover:bg-[#25285a] dark:bg-accent text-white font-semibold text-xs transition cursor-pointer"
                >
                  Continue to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none">
                    Username / ID
                  </label>
                  <input
                    type="text"
                    value={lookupUsername}
                    onChange={(e) => setLookupUsername(e.target.value)}
                    placeholder="e.g. admin"
                    autoFocus
                    required
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!lookupUsername.trim()}
                  className="w-full py-2.5 px-4 rounded-full bg-[#1b1e42] hover:bg-[#25285a] dark:bg-accent text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Search Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
