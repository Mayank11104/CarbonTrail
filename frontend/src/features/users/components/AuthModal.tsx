import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'At least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // TODO: Wire up Firebase Auth here
    console.log(`${mode} with:`, formData);

    // Simulate network delay for now
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // TODO: Wire up Firebase Google Auth
    console.log('Google Sign-In initiated');
    setTimeout(() => setIsLoading(false), 1500);
  };

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setErrors({});
    setShowPassword(false);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative bg-[#F5F3EF] rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden border border-[#E8D5B0]/40"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/30 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="pt-8 pb-5 px-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src="/logo.svg" alt="CarbonTrail" className="w-8 h-8" />
                <span
                  className="font-semibold text-lg tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  CarbonTrail
                </span>
              </div>

              <h2
                className="text-[22px] lg:text-[26px] font-bold tracking-tight text-[#1C1C1E]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mode === 'login' ? 'Welcome back' : 'Start your trail'}
              </h2>
              <p
                className="text-[13px] lg:text-[14px] text-[#1C1C1E]/40 mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {mode === 'login'
                  ? 'Log in to continue your journey'
                  : 'Create an account to track your impact'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="mx-8 mb-5">
              <div className="flex bg-white rounded-xl border border-[#E8D5B0]/40 p-1">
                {(['login', 'signup'] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setErrors({}); setShowPassword(false); }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] lg:text-[14px] font-semibold transition-all duration-200 ${
                      mode === m
                        ? 'bg-[#1B4332] text-white shadow-sm'
                        : 'text-[#1C1C1E]/40 hover:text-[#1C1C1E]/60'
                    }`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-3">
              <div className="space-y-3">
                {/* Name field (signup only) */}
                <AnimatePresence mode="popLayout">
                  {mode === 'signup' && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider text-[#1C1C1E]/35 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1C1E]/25" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className={`w-full bg-white border ${
                            errors.name ? 'border-[#E05252]' : 'border-[#E8D5B0]/50'
                          } rounded-xl py-3 pl-10 pr-4 text-[14px] text-[#1C1C1E] placeholder:text-[#1C1C1E]/25 focus:outline-none focus:border-[#40916C] focus:ring-2 focus:ring-[#95D5B2]/20 transition-all`}
                          style={{ fontFamily: "var(--font-body)" }}
                        />
                        {errors.name && (
                          <p className="text-[11px] text-[#E05252] mt-1 ml-1">{errors.name}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email field */}
                <div>
                  <label className="block text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider text-[#1C1C1E]/35 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1C1E]/25" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full bg-white border ${
                        errors.email ? 'border-[#E05252]' : 'border-[#E8D5B0]/50'
                      } rounded-xl py-3 pl-10 pr-4 text-[14px] text-[#1C1C1E] placeholder:text-[#1C1C1E]/25 focus:outline-none focus:border-[#40916C] focus:ring-2 focus:ring-[#95D5B2]/20 transition-all`}
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-[#E05252] mt-1 ml-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider text-[#1C1C1E]/35 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1C1E]/25" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      className={`w-full bg-white border ${
                        errors.password ? 'border-[#E05252]' : 'border-[#E8D5B0]/50'
                      } rounded-xl py-3 pl-10 pr-11 text-[14px] text-[#1C1C1E] placeholder:text-[#1C1C1E]/25 focus:outline-none focus:border-[#40916C] focus:ring-2 focus:ring-[#95D5B2]/20 transition-all`}
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1C1C1E]/25 hover:text-[#1C1C1E]/50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && (
                      <p className="text-[11px] text-[#E05252] mt-1 ml-1">{errors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Forgot password link (login only) */}
              {mode === 'login' && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    className="text-[12px] font-medium text-[#40916C] hover:text-[#1B4332] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-[#1B4332] text-white py-3.5 rounded-xl text-[14px] lg:text-[15px] font-semibold shadow-md hover:shadow-lg hover:bg-[#1B4332]/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    {mode === 'login' ? 'Log in' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 px-8 py-4">
              <div className="flex-1 h-px bg-[#E8D5B0]/40" />
              <span className="text-[11px] font-medium text-[#1C1C1E]/25 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#E8D5B0]/40" />
            </div>

            {/* Google Sign In */}
            <div className="px-8 pb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#E8D5B0]/50 text-[#1C1C1E] py-3.5 rounded-xl text-[14px] font-semibold hover:border-[#E8D5B0] hover:shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>

            {/* Switch mode text */}
            <div className="border-t border-[#E8D5B0]/30 py-4 text-center">
              <p className="text-[13px] text-[#1C1C1E]/40" style={{ fontFamily: "var(--font-body)" }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={switchMode}
                  className="text-[#40916C] font-semibold hover:text-[#1B4332] transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
