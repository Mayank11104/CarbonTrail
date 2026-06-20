import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, LogOut, Flame, Train, Utensils,
  Zap, ShoppingBag, Users, Trophy, ChevronRight, Sparkles, User, Bike, RefreshCw, Camera
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { logoutUser } from '../features/users/api/auth';
import LogModal, { type LogCategory } from '../features/logs/components/LogModal';
import { ScanModal } from '../features/logs/components/ScanModal';
import { TrendsModal } from '../features/logs/components/TrendsModal';
import { subscribeToDailyLogs, subscribeToStreak, subscribeToWeeklyLogs, type CarbonLog } from '../features/logs/api/logs';
import { fetchCoachInsight, fetchPersonalizedChallenge, type AICoachResponse, type AIChallengeResponse } from '../features/ai/api/coach';

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_META = {
  transport: { label: 'Transport', Icon: Train, color: '#40916C', blob: 'bg-[#94D4B1]/20' },
  food: { label: 'Food', Icon: Utensils, color: '#C07B52', blob: 'bg-[#E8D5B0]/30' },
  energy: { label: 'Energy', Icon: Zap, color: '#D97706', blob: 'bg-[#FFD180]/20' },
  shopping: { label: 'Shopping', Icon: ShoppingBag, color: '#1B4332', blob: 'bg-[#95D5B2]/15' },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

const DashboardPage = () => {
  const [user] = useAuthState(auth);
  const [activeLogCategory, setActiveLogCategory] = useState<LogCategory>(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [weeklyLogs, setWeeklyLogs] = useState<CarbonLog[]>([]);

  // ── Real data state ──────────────────────────────────────────────────────
  const [todayLogs, setTodayLogs] = useState<CarbonLog[]>([]);
  const [streak, setStreak] = useState(0);

  // ── AI Coach state ───────────────────────────────────────────────────────
  const [aiCoach, setAiCoach] = useState<AICoachResponse | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // ── AI Challenge state ───────────────────────────────────────────────────
  const [aiChallenge, setAiChallenge] = useState<AIChallengeResponse | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>([false, false, false]);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);

  // ── Subscriptions ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsubLogs = subscribeToDailyLogs(user.uid, setTodayLogs);
    const unsubStreak = subscribeToStreak(user.uid, setStreak);
    const unsubWeeklyLogs = subscribeToWeeklyLogs(user.uid, setWeeklyLogs);
    return () => { unsubLogs(); unsubStreak(); unsubWeeklyLogs(); };
  }, [user]);

  // ── Computed values ──────────────────────────────────────────────────────
  const totalCarbonToday = todayLogs.reduce((sum, l) => sum + l.carbonImpact, 0);

  const categoryTotals = (Object.keys(CATEGORY_META) as CategoryKey[]).reduce(
    (acc, cat) => {
      acc[cat] = todayLogs
        .filter((l) => l.category === cat)
        .reduce((s, l) => s + l.carbonImpact, 0);
      return acc;
    },
    {} as Record<CategoryKey, number>
  );

  const getPercentage = (cat: CategoryKey) =>
    totalCarbonToday > 0
      ? Math.round((categoryTotals[cat] / totalCarbonToday) * 100)
      : 0;

  // ── Ring logic ───────────────────────────────────────────────────────────
  const dailyBudget = 15;
  const progressPercent = Math.min(totalCarbonToday / dailyBudget, 1);
  const radius = 110;
  const circleCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = circleCircumference * (1 - progressPercent);

  // ── AI Coach fetch ───────────────────────────────────────────────────────
  const loadCoachInsight = useCallback(async () => {
    if (!user) return;
    setIsLoadingCoach(true);
    setCoachError(null);
    try {
      const token = await user.getIdToken();
      const result = await fetchCoachInsight(token);
      setAiCoach(result);
    } catch {
      setCoachError('Could not load insight. Try again.');
    } finally {
      setIsLoadingCoach(false);
    }
  }, [user]);

  // ── AI Challenge fetch & persistence ─────────────────────────────────────
  const loadChallenge = useCallback(async (forceFetch = false) => {
    if (!user) return;
    const storageKey = `carbontrail_challenge_${user.uid}`;
    
    if (!forceFetch) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAiChallenge(parsed.challenge);
          setIsChallengeActive(parsed.active);
          setCheckedTasks(parsed.checked || [false, false, false]);
          setIsChallengeCompleted(parsed.completed || false);
          return;
        } catch (e) {
          console.error('Error parsing stored challenge:', e);
        }
      }
    }

    setIsLoadingChallenge(true);
    setChallengeError(null);
    try {
      const token = await user.getIdToken();
      const result = await fetchPersonalizedChallenge(token);
      setAiChallenge(result);
      setIsChallengeActive(false);
      setCheckedTasks([false, false, false]);
      setIsChallengeCompleted(false);
      
      // Save initial state to storage
      localStorage.setItem(storageKey, JSON.stringify({
        challenge: result,
        active: false,
        checked: [false, false, false],
        completed: false
      }));
    } catch {
      setChallengeError('Could not load challenge. Try again.');
    } finally {
      setIsLoadingChallenge(false);
    }
  }, [user]);

  const handleAcceptChallenge = () => {
    if (!user || !aiChallenge) return;
    const storageKey = `carbontrail_challenge_${user.uid}`;
    setIsChallengeActive(true);
    const updated = {
      challenge: aiChallenge,
      active: true,
      checked: [false, false, false],
      completed: false
    };
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleToggleTask = (index: number) => {
    if (!user || !aiChallenge) return;
    const storageKey = `carbontrail_challenge_${user.uid}`;
    const newChecked = [...checkedTasks];
    newChecked[index] = !newChecked[index];
    setCheckedTasks(newChecked);

    const allCompleted = newChecked.every(v => v === true);
    setIsChallengeCompleted(allCompleted);

    const updated = {
      challenge: aiChallenge,
      active: true,
      checked: newChecked,
      completed: allCompleted
    };
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleAbandonOrNewChallenge = () => {
    loadChallenge(true);
  };

  // Auto-fetch on first load
  useEffect(() => {
    if (user) {
      loadCoachInsight();
      loadChallenge();
    }
  }, [user, loadCoachInsight, loadChallenge]);

  const handleLogout = async () => { await logoutUser(); };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface/45">
            <button className="hover:text-primary transition-colors duration-200">Dashboard</button>
            <button className="hover:text-primary transition-colors duration-200">Impact</button>
            <button className="hover:text-primary transition-colors duration-200">Community</button>
          </div>
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
      <main className="max-w-[1280px] mx-auto pt-[72px] pb-20 px-[20px] md:px-[40px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">

          {/* ─── Left Column ─── */}
          <section className="lg:col-span-8 flex flex-col gap-[24px]">

            {/* Hero Progress Card */}
            <div className="glass-card rounded-xl p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[400px]">
              {/* Streak badge — real data */}
              <div className="absolute top-8 right-8 bg-secondary-container/30 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                <Flame className="w-5 h-5 text-[#E65100]" />
                <span className="font-label-md text-label-md text-on-secondary-container">
                  {streak}-day streak
                </span>
              </div>

              <div className="flex flex-col gap-4 text-center md:text-left z-10">
                <h1 className="font-headline-lg text-[40px] text-primary mb-2" style={{ fontFamily: 'var(--font-headline-lg)' }}>
                  {progressPercent > 0.9 ? 'Careful today ⚠️' : 'Looking good 🌿'}
                </h1>
                <p className="text-on-surface-variant max-w-xs font-body-lg text-[18px]">
                  {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Eco Warrior'}. You're making great progress on your daily footprint.
                </p>
                <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                  <button
                    onClick={() => setActiveLogCategory('all')}
                    className="bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-full transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Daily Check-in
                  </button>
                  <button
                    onClick={() => setIsScanOpen(true)}
                    className="bg-white border border-primary text-primary font-label-md text-label-md px-8 py-4 rounded-full transition-all hover:bg-primary/5 active:scale-95 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Bill
                  </button>
                  <button 
                    onClick={() => setIsTrendsOpen(true)}
                    className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-8 py-4 rounded-full transition-all hover:bg-black/5 active:scale-95"
                  >
                    View Trends
                  </button>
                </div>
              </div>

              {/* Ring — real data */}
              <div className="relative w-64 h-64 flex items-center justify-center mt-12 md:mt-0 z-10">
                <svg viewBox="0 0 256 256" className="w-full h-full -rotate-90">
                  <circle cx="128" cy="128" r={radius} fill="transparent" stroke="var(--color-surface-container-high)" strokeWidth="12" />
                  <motion.circle
                    cx="128" cy="128" r={radius} fill="transparent"
                    stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    initial={{ strokeDashoffset: circleCircumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-lg text-[64px] leading-none text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display-lg)' }}>
                    {totalCarbonToday.toFixed(1)}
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
              <div className="glass-card rounded-lg p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden min-h-[340px]">
                {isLoadingChallenge ? (
                  <div className="space-y-4 animate-pulse flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-6 bg-primary/10 rounded w-2/3 mb-4" />
                      <div className="h-4 bg-primary/10 rounded w-full mb-2" />
                      <div className="h-4 bg-primary/10 rounded w-4/5" />
                    </div>
                    <div className="h-12 bg-primary/10 rounded-full w-full mt-4" />
                  </div>
                ) : challengeError ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-lg text-[22px] text-primary font-bold mb-2">Challenge Error</h3>
                      <p className="text-on-surface-variant text-[14px]">{challengeError}</p>
                    </div>
                    <button
                      onClick={() => loadChallenge(true)}
                      className="bg-primary text-white font-label-md text-[14px] font-bold w-full py-4 rounded-full mt-6 transition-all hover:bg-primary/95 active:scale-95"
                    >
                      Try Again
                    </button>
                  </div>
                ) : isChallengeCompleted ? (
                  <div className="flex-1 flex flex-col justify-between items-center text-center py-2">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4 border border-secondary/20 shadow-sm animate-bounce">
                        <Trophy className="w-7 h-7 text-[#D97706]" />
                      </div>
                      <h3 className="font-headline-lg text-[22px] text-primary font-bold mb-2">Challenge Complete!</h3>
                      <p className="text-on-surface-variant text-[13px] leading-relaxed max-w-[240px] mx-auto">
                        Fantastic job! You completed the <strong className="font-bold text-primary">{aiChallenge?.title.replace(/\*\*/g, '')}</strong> and saved an estimated <strong className="font-bold text-primary">{aiChallenge?.targetSaving} kg CO2</strong>!
                      </p>
                    </div>
                    <button
                      onClick={handleAbandonOrNewChallenge}
                      className="bg-primary text-white font-label-md text-[14px] font-bold w-full py-4 rounded-full mt-6 transition-all hover:shadow-lg active:scale-95"
                    >
                      Get Next Challenge
                    </button>
                  </div>
                ) : isChallengeActive && aiChallenge ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-label-md text-[11px] font-bold text-secondary uppercase tracking-widest">Active Challenge</span>
                        <span className="font-label-md text-[11px] font-bold text-[#D97706] uppercase tracking-widest">Save: ~{aiChallenge.targetSaving}kg</span>
                      </div>
                      <h3 className="font-headline-lg text-[22px] text-primary font-bold mb-4">{aiChallenge.title.replace(/\*\*/g, '')}</h3>
                      
                      {/* Tasks Checklist */}
                      <div className="space-y-3.5">
                        {aiChallenge.tasks.map((task, i) => (
                          <label
                            key={i}
                            className="flex items-start gap-3 p-3 bg-white/40 border border-outline-variant/20 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checkedTasks[i]}
                              onChange={() => handleToggleTask(i)}
                              className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                            />
                            <span className={`text-[13px] font-medium leading-tight ${checkedTasks[i] ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                              {task}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAbandonOrNewChallenge}
                      className="text-on-surface-variant/50 hover:text-error text-[11px] font-bold mt-6 transition-colors self-center active:scale-95"
                    >
                      Give Up & Get New Challenge
                    </button>
                  </div>
                ) : aiChallenge ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-label-md text-[11px] font-bold text-primary/60 uppercase tracking-widest">AI Weekly Challenge</span>
                        <span className="font-label-md text-[11px] font-bold text-[#D97706] uppercase tracking-widest">Save: ~{aiChallenge.targetSaving}kg</span>
                      </div>
                      <h3 className="font-headline-lg text-[22px] text-primary font-bold mb-3">{aiChallenge.title.replace(/\*\*/g, '')}</h3>
                      <p className="text-on-surface-variant text-[14px] leading-relaxed mb-4">{aiChallenge.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        onClick={handleAcceptChallenge}
                        className="bg-primary text-white font-label-md text-[14px] font-bold w-full py-4 rounded-full transition-all hover:shadow-lg active:scale-95 text-center cursor-pointer"
                      >
                        Accept Challenge
                      </button>
                      <button
                        onClick={handleAbandonOrNewChallenge}
                        className="border border-primary/20 text-primary font-label-md text-[12px] font-bold w-full py-2.5 rounded-full transition-all hover:bg-primary/5 active:scale-95 text-center cursor-pointer"
                      >
                        Suggest Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-lg text-[22px] text-primary font-bold mb-2">Weekly Challenge</h3>
                      <p className="text-on-surface-variant text-[14px] leading-relaxed">
                        Track logs to generate a personalized challenge targeting your highest footprint category.
                      </p>
                    </div>
                    <button
                      onClick={() => loadChallenge(true)}
                      className="bg-primary text-white font-label-md text-[14px] font-bold w-full py-4 rounded-full mt-6 transition-all hover:bg-opacity-90 active:scale-95"
                    >
                      Generate AI Challenge
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ─── Right Column ─── */}
          <section className="lg:col-span-4 flex flex-col gap-[24px]">

            {/* Category Data Tiles — real data */}
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(CATEGORY_META) as [CategoryKey, typeof CATEGORY_META[CategoryKey]][]).map(([cat, meta]) => {
                const { Icon, color, blob, label } = meta;
                const kg = categoryTotals[cat];
                const pct = getPercentage(cat);
                return (
                  <div
                    key={cat}
                    className="rounded-lg p-6 h-40 bg-surface flex flex-col justify-between border border-outline-variant/30 shadow-sm relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${blob} rounded-bl-full -translate-y-4 translate-x-4 pointer-events-none`} />
                    <Icon className="w-7 h-7" style={{ color }} />
                    <div>
                      <div className="flex items-end justify-between mb-1">
                        <span className="font-display-lg text-[24px] font-bold leading-none text-[#1C1C1E]">
                          {kg.toFixed(1)}
                        </span>
                        <span className="font-label-md font-bold" style={{ color }}>
                          {pct}%
                        </span>
                      </div>
                      <span className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-wider">
                        {label} (kg)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Coach Card — real AI data */}
            <div className="rounded-lg p-8 bg-gradient-to-br from-primary-container to-secondary shadow-xl relative overflow-hidden min-h-[200px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-tertiary-fixed/10 rounded-full translate-y-12 -translate-x-12 blur-[30px] pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-label-md text-[14px] font-bold text-white/70 uppercase tracking-widest">AI Coach</span>
                </div>
                <button
                  onClick={loadCoachInsight}
                  disabled={isLoadingCoach}
                  className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 transition-all"
                  title="Refresh insight"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCoach ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isLoadingCoach ? (
                <div className="relative z-10 space-y-2 animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-full" />
                  <div className="h-4 bg-white/20 rounded w-4/5" />
                  <div className="h-4 bg-white/20 rounded w-3/5" />
                </div>
              ) : coachError ? (
                <p className="font-body-lg text-[14px] text-white/60 relative z-10">{coachError}</p>
              ) : aiCoach ? (
                <div className="relative z-10">
                  <p className="font-body-lg text-[16px] text-white leading-relaxed mb-2">{aiCoach.insight}</p>
                  <p className="text-[13px] text-white/70 font-medium">💡 {aiCoach.tip}</p>
                </div>
              ) : (
                <p className="font-body-lg text-[16px] text-white/60 relative z-10">Loading your personalized insight...</p>
              )}
            </div>

            {/* Recommended Actions — real AI data */}
            <div className="glass-card rounded-lg p-8 flex flex-col gap-6">
              <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest">
                Recommended Actions
              </h3>
              <div className="flex flex-col gap-4">
                {(aiCoach?.actions ?? ['Switch to LED bulbs', 'Try a weekend bike trip']).map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-white/50"
                  >
                    <div className="flex items-center gap-3">
                      {i % 2 === 0
                        ? <Leaf className="w-5 h-5 text-secondary shrink-0" />
                        : <Bike className="w-5 h-5 text-secondary shrink-0" />
                      }
                      <span className="font-label-md text-[14px] font-bold text-on-surface">{action}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline shrink-0" />
                  </div>
                ))}
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
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />
      <TrendsModal
        isOpen={isTrendsOpen}
        onClose={() => setIsTrendsOpen(false)}
        weeklyLogs={weeklyLogs}
      />

    </div>
  );
};

export default DashboardPage;
