import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, LogOut, Flame, Train, Utensils, 
  Zap, ShoppingBag, Users, Trophy, ChevronRight, Sparkles, User, Bike
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { logoutUser } from '../features/users/api/auth';
import LogModal, { type LogCategory } from '../features/logs/components/LogModal';
import { subscribeToDailyLogs } from '../features/logs/api/logs';

const DashboardPage = () => {
  const [user] = useAuthState(auth);
  const [activeLogCategory, setActiveLogCategory] = useState<LogCategory>(null);
  const [totalCarbonToday, setTotalCarbonToday] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToDailyLogs(user.uid, (total) => {
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

  // Ring logic
  const dailyBudget = 15;
  const progressPercent = Math.min(totalCarbonToday / dailyBudget, 1);
  const radius = 110;
  const circleCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = circleCircumference * (1 - progressPercent);

  return (
    <div className="font-body-md text-on-surface">
      
      {/* ─── Ambient Background Orbs ─── */}
      <div className="mesh-gradient">
        <div className="orb w-[600px] h-[600px] bg-[#95D5B2] -top-20 -left-20" />
        <div className="orb w-[500px] h-[500px] bg-[#E8D5B0] -bottom-20 -right-20" style={{ animationDelay: '-5s' }} />
        <div className="orb w-[400px] h-[400px] bg-[#C1ECD4] top-1/2 left-1/3" style={{ animationDelay: '-10s' }} />
      </div>

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-outline-variant/40 bg-surface/80 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-[20px] md:px-[40px] h-14 lg:h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
            </div>
            <span className="font-semibold text-base lg:text-lg tracking-tight font-display-lg text-primary">CarbonTrail</span>
          </div>
          {/* ─── Center Links ─── */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface/45">
            <a href="#" className="hover:text-primary transition-colors duration-200">Dashboard</a>
            <a href="#" className="hover:text-primary transition-colors duration-200">Impact</a>
            <a href="#" className="hover:text-primary transition-colors duration-200">Community</a>
          </div>

          {/* ─── Right Side (User Actions) ─── */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-on-surface/60 mr-2">
              Hi, {user?.displayName || 'Eco Warrior'}
            </span>
            <button onClick={handleLogout} className="text-sm font-medium text-on-surface/45 hover:text-error transition-colors flex items-center gap-1.5" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-white overflow-hidden shadow-sm bg-surface-container flex items-center justify-center ml-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-outline" />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="max-w-[1280px] mx-auto pt-32 pb-20 px-[20px] md:px-[40px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          
          {/* ─── Left Column ─── */}
          <section className="lg:col-span-8 flex flex-col gap-[24px]">
            
            {/* Hero Progress Card */}
            <div className="glass-card rounded-xl p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[400px]">
              <div className="absolute top-8 right-8 bg-secondary-container/30 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                <Flame className="w-5 h-5 text-[#E65100]" />
                <span className="font-label-md text-label-md text-on-secondary-container">7-day streak</span>
              </div>
              
              <div className="flex flex-col gap-4 text-center md:text-left z-10">
                <h1 className="font-headline-lg text-[40px] text-primary mb-2" style={{ fontFamily: "var(--font-headline-lg)" }}>
                  {progressPercent > 0.9 ? 'Careful today ⚠️' : 'Looking good 🌿'}
                </h1>
                <p className="text-on-surface-variant max-w-xs font-body-lg text-[18px]">
                  {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Eco Warrior'}. You're making great progress on your daily footprint.
                </p>
                <div className="mt-8 flex justify-center md:justify-start gap-4">
                  <button className="bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-full transition-all hover:shadow-lg hover:scale-105 active:scale-95">
                    Daily Check-in
                  </button>
                  <button className="border border-primary text-primary font-label-md text-label-md px-8 py-4 rounded-full transition-all hover:bg-primary/5 active:scale-95">
                    View Trends
                  </button>
                </div>
              </div>
              
              <div className="relative w-64 h-64 flex items-center justify-center mt-12 md:mt-0 z-10">
                <svg viewBox="0 0 256 256" className="w-full h-full -rotate-90">
                  <circle cx="128" cy="128" r={radius} fill="transparent" stroke="var(--color-surface-container-high)" strokeWidth="12" />
                  <motion.circle 
                    cx="128" cy="128" r={radius} fill="transparent" 
                    stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    initial={{ strokeDashoffset: circleCircumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-lg text-[64px] leading-none text-primary tracking-tighter" style={{ fontFamily: "var(--font-display-lg)" }}>
                    {Number(totalCarbonToday || 0).toFixed(1)}
                  </span>
                  <span className="font-label-md text-[14px] text-on-surface-variant mt-1 uppercase tracking-wider font-bold">
                    of {dailyBudget} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {/* Community Card */}
              <div className="glass-card rounded-lg p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-lg text-[28px] text-primary font-bold">Community</h3>
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/40 p-3 rounded-lg hover:bg-white/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-on-secondary-container" />
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-[14px] leading-tight mb-1">Sarah joined the local tree planting event</p>
                      <p className="text-[12px] text-outline">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/40 p-3 rounded-lg hover:bg-white/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-on-primary-fixed" />
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-[14px] leading-tight mb-1">Marcus saved 12kg of CO2 this week</p>
                      <p className="text-[12px] text-outline">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Card */}
              <div className="glass-card rounded-lg p-8 bg-primary text-[#1C1C1E] flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                <div>
                  <h3 className="font-headline-lg text-[28px] font-bold mb-2">Join a Challenge</h3>
                  <p className="opacity-80 text-[16px]">Compete with friends to reduce your footprint. Top 10 users earn the Earth Badge.</p>
                </div>
                <button className="bg-[#1C1C1E] text-white font-label-md text-[14px] font-bold w-full py-4 rounded-full mt-8 hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
                  Browse Challenges
                </button>
              </div>
            </div>
          </section>

          {/* ─── Right Column ─── */}
          <section className="lg:col-span-4 flex flex-col gap-[24px]">
            
            {/* Tactile Logging Tiles */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveLogCategory('transport')} className="tactile-tile group rounded-lg p-6 h-40 bg-[#94D4B1] text-primary flex flex-col justify-between transition-all duration-300">
                <Train className="w-8 h-8 self-start transition-transform group-hover:scale-110" />
                <span className="font-label-md text-[14px] font-bold uppercase tracking-wider text-left">Transport</span>
              </button>
              <button onClick={() => setActiveLogCategory('food')} className="tactile-tile group rounded-lg p-6 h-40 bg-[#E8D5B0] text-[#5D4037] flex flex-col justify-between transition-all duration-300">
                <Utensils className="w-8 h-8 self-start transition-transform group-hover:scale-110" />
                <span className="font-label-md text-[14px] font-bold uppercase tracking-wider text-left">Food</span>
              </button>
              <button onClick={() => setActiveLogCategory('energy')} className="tactile-tile group rounded-lg p-6 h-40 bg-[#FFD180] text-[#E65100] flex flex-col justify-between transition-all duration-300">
                <Zap className="w-8 h-8 self-start transition-transform group-hover:scale-110" />
                <span className="font-label-md text-[14px] font-bold uppercase tracking-wider text-left">Energy</span>
              </button>
              <button onClick={() => setActiveLogCategory('shopping')} className="tactile-tile group rounded-lg p-6 h-40 bg-primary-container text-tertiary-fixed flex flex-col justify-between transition-all duration-300">
                <ShoppingBag className="w-8 h-8 self-start transition-transform group-hover:scale-110" />
                <span className="font-label-md text-[14px] font-bold uppercase tracking-wider text-left">Shopping</span>
              </button>
            </div>

            {/* AI Coach Card */}
            <div className="rounded-lg p-8 bg-gradient-to-br from-primary-container to-secondary shadow-xl relative overflow-hidden min-h-[200px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-tertiary-fixed/10 rounded-full translate-y-12 -translate-x-12 blur-[30px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-label-md text-[14px] font-bold text-white/70 uppercase tracking-widest">AI Coach</span>
              </div>
              <p className="font-body-lg text-[18px] text-white leading-relaxed relative z-10">
                Based on your 3 metro rides this week — your transport is <span className="font-bold text-tertiary-fixed">22% below average</span>. Keep going!
              </p>
            </div>

            {/* Recommended Actions */}
            <div className="glass-card rounded-lg p-8 flex flex-col gap-6">
              <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest">Recommended Actions</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-white/50">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-secondary" />
                    <span className="font-label-md text-[14px] font-bold text-on-surface">Switch to LED bulbs</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-white/50">
                  <div className="flex items-center gap-3">
                    <Bike className="w-5 h-5 text-secondary" />
                    <span className="font-label-md text-[14px] font-bold text-on-surface">Weekend bike trip</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline" />
                </div>
              </div>
            </div>

          </section>
        </div>
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
