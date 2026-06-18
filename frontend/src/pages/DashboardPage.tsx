import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { logoutUser } from '../features/users/api/auth';
import { useState, useEffect } from 'react';
import { LogOut, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import LogModal, { type LogCategory } from '../features/logs/components/LogModal';
import { subscribeToDailyLogs, type CarbonLog } from '../features/logs/api/logs';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const DashboardPage = () => {
  const [user] = useAuthState(auth);
  const [activeLogCategory, setActiveLogCategory] = useState<LogCategory>(null);
  const [dailyLogs, setDailyLogs] = useState<CarbonLog[]>([]);
  const [totalCarbonToday, setTotalCarbonToday] = useState(0);

  const dailyBudget = 15.0; // Hardcoded daily budget (kg CO2)

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToDailyLogs(user.uid, (logs) => {
      setDailyLogs(logs);
      const total = logs.reduce((sum, log) => sum + log.carbonImpact, 0);
      setTotalCarbonToday(total);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate progress circle properties
  const progressPercent = Math.min(totalCarbonToday / dailyBudget, 1);
  const circleCircumference = 339.29; // 2 * PI * 54
  const strokeDashoffset = circleCircumference * (1 - progressPercent);

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1C1C1E] font-sans pb-20 selection:bg-[#95D5B2]/30">
      
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-[#F5F3EF]/90 backdrop-blur-md border-b border-[#E8D5B0]/40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            CarbonTrail
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#1C1C1E]/60 hidden sm:block">
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Eco Warrior'}
          </span>
          <button 
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-white border border-[#E8D5B0]/50 flex items-center justify-center text-[#1C1C1E]/40 hover:text-[#E05252] hover:border-[#E05252]/30 transition-all active:scale-95 shadow-sm"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </header>

      {/* ─── Main Content Wrapper ─── */}
      <main className="max-w-md mx-auto pt-8 px-6 space-y-8">
        
        {/* ─── Progress Ring Section ─── */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-[#E8D5B0]/50 shadow-xl shadow-[#1C1C1E]/[0.03] flex flex-col items-center relative overflow-hidden"
        >
          {/* Dynamic Background Gradients */}
          <div 
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-[50px] transition-colors duration-1000"
            style={{ backgroundColor: progressPercent > 0.8 ? '#E0525220' : '#95D5B220' }}
          />
          <div 
            className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[50px] transition-colors duration-1000"
            style={{ backgroundColor: progressPercent > 0.8 ? '#C07B5215' : '#40916C10' }}
          />

          <div className="relative z-10 w-full text-center mb-6 flex justify-between items-center">
             <div className="text-left">
               <p className="text-[12px] font-semibold uppercase tracking-wider text-[#1C1C1E]/40">Daily Budget</p>
               <h2 className="text-[20px] font-bold mt-0.5 text-[#1C1C1E]" style={{ fontFamily: "var(--font-display)" }}>
                 {progressPercent > 0.9 ? 'Careful today ⚠️' : 'Looking good 🌿'}
               </h2>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#95D5B2]/15 text-[#40916C]">
                <span className="text-[14px]">🔥</span>
                <span className="text-[12px] font-bold tracking-tight">7d</span>
             </div>
          </div>

          {/* Dynamic Ring */}
          <div className="relative w-52 h-52 mb-2">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90 drop-shadow-md">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#E8D5B0" strokeWidth="8" opacity="0.3" />
              <motion.circle
                cx="64" cy="64" r="54" fill="none"
                stroke={progressPercent > 0.8 ? '#E05252' : '#95D5B2'} 
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circleCircumference}
                initial={{ strokeDashoffset: circleCircumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <motion.span
                key={totalCarbonToday}
                className="text-[48px] font-bold text-[#1C1C1E] leading-none tracking-tighter"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {totalCarbonToday.toFixed(1)}
              </motion.span>
              <span className="text-[13px] text-[#1C1C1E]/40 font-semibold uppercase tracking-widest mt-1">
                of {dailyBudget} kg
              </span>
            </div>
          </div>
        </motion.section>

        {/* ─── Quick Logging Tiles ─── */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-bold text-[#1C1C1E]" style={{ fontFamily: "var(--font-display)" }}>Quick Log</h3>
          </div>
          <motion.div 
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { id: 'transport', icon: '🚇', label: 'Transport', color: '#40916C', bg: '#40916C' },
              { id: 'food', icon: '🥗', label: 'Food', color: '#C07B52', bg: '#C07B52' },
              { id: 'energy', icon: '⚡', label: 'Energy', color: '#D97706', bg: '#D97706' },
              { id: 'shopping', icon: '🛍️', label: 'Shopping', color: '#1B4332', bg: '#1B4332' },
            ].map((cat) => (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveLogCategory(cat.id as LogCategory)}
                className="bg-white/80 backdrop-blur-sm border border-[#E8D5B0]/40 rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg hover:shadow-[#1C1C1E]/[0.02] hover:border-[#E8D5B0]/80 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shadow-sm"
                  style={{ backgroundColor: `${cat.bg}15` }}
                >
                  {cat.icon}
                </div>
                <span className="font-semibold text-[14px] text-[#1C1C1E]/80">{cat.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* ─── AI Insights Placeholder ─── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div className="border-l-[4px] border-[#40916C] bg-white rounded-r-2xl p-5 shadow-sm border-y border-r border-y-[#E8D5B0]/40 border-r-[#E8D5B0]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#95D5B2]/10 rounded-full blur-[20px] -mr-10 -mt-10" />
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#95D5B2]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="w-4 h-4 text-[#40916C]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#1C1C1E]/70 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  <span className="font-bold text-[#40916C]">AI Coach:</span> You're doing great! Once you log more data, I'll generate personalized insights for you here.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* ─── Modals ─── */}
      <LogModal 
        category={activeLogCategory} 
        isOpen={!!activeLogCategory} 
        onClose={() => setActiveLogCategory(null)} 
      />

    </div>
  );
};

export default DashboardPage;
