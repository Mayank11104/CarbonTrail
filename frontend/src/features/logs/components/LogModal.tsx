import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, Train, Utensils, Zap, ShoppingBag } from 'lucide-react';
import { saveLog } from '../api/logs';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../config/firebase';
import { APP_CONSTANTS } from '../../../config/constants';

export type LogCategory = 'transport' | 'food' | 'energy' | 'shopping' | 'all' | null;

interface LogModalProps {
  category: LogCategory;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  transport: {
    title: 'Transport',
    Icon: Train,
    color: '#40916C',
    blobColor: 'bg-[#94D4B1]/20',
    textColor: 'text-[#40916C]',
    options: ['Car', 'Bus', 'Metro', 'Walk/Bike'],
    inputLabel: 'Distance (km)',
  },
  food: {
    title: 'Food',
    Icon: Utensils,
    color: '#C07B52',
    blobColor: 'bg-[#E8D5B0]/30',
    textColor: 'text-[#C07B52]',
    options: ['Beef/Lamb', 'Chicken/Pork', 'Vegetarian', 'Vegan'],
    inputLabel: 'Meals',
  },
  energy: {
    title: 'Energy',
    Icon: Zap,
    color: '#D97706',
    blobColor: 'bg-[#FFD180]/20',
    textColor: 'text-[#D97706]',
    options: ['AC (Hours)', 'Heater (Hours)', 'General Usage'],
    inputLabel: 'Hours / Amount',
  },
  shopping: {
    title: 'Shopping',
    Icon: ShoppingBag,
    color: '#1B4332',
    blobColor: 'bg-[#95D5B2]/15',
    textColor: 'text-[#1B4332]',
    options: ['Electronics', 'Clothing', 'Home Goods', 'Other'],
    inputLabel: 'Items',
  },
};

const LogModal = ({ category, isOpen, onClose }: LogModalProps) => {
  const [user] = useAuthState(auth);
  const [internalCategory, setInternalCategory] = useState<Exclude<LogCategory, 'all'> | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amountError, setAmountError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    if (isOpen && category) {
      if (category === 'all') {
        setInternalCategory(null);
      } else {
        setInternalCategory(category as Exclude<LogCategory, 'all' | null>);
        setSelectedOption(CATEGORY_CONFIG[category as Exclude<LogCategory, 'all' | null>].options[0]);
      }
      setAmount('');
      setAmountError('');
      setSubmitted(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, category]);

  if (!category) return null;

  const currentCategory = internalCategory;
  const config = currentCategory ? CATEGORY_CONFIG[currentCategory] : null;

  const handleCategorySelect = (cat: Exclude<LogCategory, 'all' | null>) => {
    setInternalCategory(cat);
    setSelectedOption(CATEGORY_CONFIG[cat].options[0]);
    setAmount('');
  };

  const handleBack = () => {
    setInternalCategory(null);
    setAmount('');
    setAmountError('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');

    // Validate
    if (!currentCategory || !user) return;
    if (!amount.trim()) {
      setAmountError('Please enter a value.');
      return;
    }
    const num = Number(amount);
    if (isNaN(num)) {
      setAmountError('Must be a valid number.');
      return;
    }
    if (num <= APP_CONSTANTS.LOGS.MIN_AMOUNT) {
      setAmountError('Value must be greater than 0.');
      return;
    }
    if (num > APP_CONSTANTS.LOGS.MAX_AMOUNT) {
      setAmountError(`Value seems too large. Max is ${APP_CONSTANTS.LOGS.MAX_AMOUNT}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveLog(user.uid, currentCategory, selectedOption, Number(amount));
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, APP_CONSTANTS.LOGS.SUCCESS_TIMEOUT_MS);
    } catch (error) {
      // Failed to save log
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop — exactly like AuthModal */}
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" />

          {/* Modal shell — exactly like AuthModal */}
          <motion.div
            className="relative bg-[#F5F3EF] rounded-3xl shadow-2xl w-full overflow-hidden border border-[#E8D5B0]/40 z-10"
            style={{ maxWidth: '500px', height: '500px' }}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">

              {/* ── CATEGORY SELECTION ── */}
              {!currentCategory && !submitted && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/30 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all z-10"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* Header */}
                  <div className="pt-8 pb-2 px-8">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-xl">🌿</span>
                      <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        Daily Check-in
                      </h2>
                    </div>
                    <p className="text-[13px] text-[#1C1C1E]/45 font-medium ml-9">What would you like to log?</p>
                  </div>

                  {/* Cards grid — styled exactly like dashboard data tiles */}
                  <div className="p-6 grid grid-cols-2 gap-3">
                    {(['transport', 'food', 'energy', 'shopping'] as const).map((cat, i) => {
                      const { Icon, blobColor, textColor, title } = CATEGORY_CONFIG[cat];
                      return (
                        <motion.button
                          key={cat}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleCategorySelect(cat)}
                          className="rounded-xl p-5 bg-[#FAFAF8] text-left flex flex-col justify-between h-32 border border-outline-variant/30 shadow-sm relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]"
                        >
                          {/* Decorative blob — same as dashboard */}
                          <div className={`absolute top-0 right-0 w-16 h-16 ${blobColor} rounded-bl-full -translate-y-3 translate-x-3 pointer-events-none`} />
                          <Icon className={`w-6 h-6 ${textColor}`} />
                          <span
                            className="font-bold text-[13px] text-[#1C1C1E] uppercase tracking-wider"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {title}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── SUCCESS STATE ── */}
              {submitted && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  className="flex flex-col items-center justify-center py-16 px-8 gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: config?.color }}
                  >
                    <Check className="w-8 h-8" />
                  </motion.div>
                  <p className="text-[18px] font-bold text-[#1C1C1E] tracking-tight">Logged!</p>
                  <p className="text-[13px] text-[#1C1C1E]/50 text-center">Your {config?.title.toLowerCase()} activity has been saved.</p>
                </motion.div>
              )}

              {/* ── LOG FORM ── */}
              {currentCategory && !submitted && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Back + Close */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <button
                      onClick={handleBack}
                      aria-label="Go back to categories"
                      className="w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/40 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={onClose}
                      aria-label="Close modal"
                      className="w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/30 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Header — same card style as dashboard */}
                  <div className="pt-8 px-8 pb-5">
                    <div className="rounded-xl p-5 bg-[#FAFAF8] border border-outline-variant/30 shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-20 h-20 ${config?.blobColor} rounded-bl-full -translate-y-4 translate-x-4 pointer-events-none`} />
                      {config && <config.Icon className={`w-7 h-7 ${config.textColor} mb-3`} />}
                      <p className="text-[11px] font-bold text-[#1C1C1E]/40 uppercase tracking-widest">Logging</p>
                      <p className="text-[20px] font-bold text-[#1C1C1E] tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                        {config?.title}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                    {/* Type selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1C1C1E]/35 mb-2.5">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {config?.options.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedOption(option)}
                            className="py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all border text-left cursor-pointer hover:opacity-80"
                            style={
                              selectedOption === option
                                ? { backgroundColor: '#fff', borderColor: config.color, color: config.color, boxShadow: `0 0 0 1px ${config.color}25` }
                                : { backgroundColor: 'transparent', borderColor: '#E8D5B0', color: '#1C1C1E99' }
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount input */}
                    <div style={{ marginBottom: '24px' }}>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1C1C1E]/35 mb-2.5">
                        {config?.inputLabel}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          if (amountError) setAmountError('');
                        }}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full bg-white rounded-xl py-3.5 px-4 text-[16px] font-bold text-[#1C1C1E] focus:outline-none transition-all"
                        style={{
                          border: `2px solid ${amountError ? '#E05252' : amount ? config?.color : '#E8D5B0'}`,
                          outline: 'none',
                        }}
                      />
                      {amountError && (
                        <p className="text-[11px] font-semibold mt-1.5 ml-1" style={{ color: '#E05252' }}>
                          {amountError}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-4 rounded-xl text-[15px] font-bold text-white transition-all duration-200 shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: config?.color }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${config?.color}55`;
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.filter = '';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                        (e.currentTarget as HTMLButtonElement).style.transform = '';
                      }}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" /> Save {config?.title}
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogModal;
