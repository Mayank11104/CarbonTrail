import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, TrendingDown, ArrowRight, Sparkles,
  Train, Utensils, Zap, ShoppingBag, ChevronRight,
  Target, MessageCircle, Flame, ArrowDownRight, TreePine, Check,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { logoutUser } from '../features/users/api/auth';
import AuthModal from '../features/users/components/AuthModal';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Radial Progress Ring ─── */
const DailyRing = ({ value, max }: { value: number; max: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-40 h-40 lg:w-48 lg:h-48 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#E8D5B0" strokeWidth="7" opacity="0.35" />
        <motion.circle
          cx="64" cy="64" r={radius} fill="none"
          stroke="#95D5B2" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[36px] lg:text-[42px] font-bold text-on-surface font-display-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          {value}
        </motion.span>
        <span className="text-[11px] lg:text-[13px] text-on-surface/40 font-medium uppercase tracking-wider">
          of {max} kg
        </span>
      </div>
    </div>
  );
};

/* ─── Landing Page ─── */
const LandingPage = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const openAuth = (mode: 'login' | 'signup') => setAuthModal({ isOpen: true, mode });

  const closeAuth = () => setAuthModal((prev) => ({ ...prev, isOpen: false }));
  
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen text-on-surface selection:bg-primary/30 font-body-md">
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
            <a href="#features" className="hover:text-primary transition-colors duration-200">Features</a>
            <a href="#how" className="hover:text-primary transition-colors duration-200">How it works</a>
            <a href="#insights" className="hover:text-primary transition-colors duration-200">AI Insights</a>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 animate-pulse bg-[#E8D5B0]/30 rounded-full" />
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm font-medium text-on-surface/60 mr-2">
                  Hi, {user.displayName || 'Eco Warrior'}
                </span>
                <button onClick={handleLogout} className="text-sm font-medium text-on-surface/45 hover:text-error transition-colors flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all active:scale-[0.97] shadow-sm ml-2">
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="hidden sm:block text-sm font-medium text-on-surface/45 hover:text-on-surface transition-colors">Log in</button>
                <button onClick={() => openAuth('signup')} className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all active:scale-[0.97] shadow-sm">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* ─── Hero Section ─── */}
      <section className="pt-20 lg:pt-20 pb-14 lg:pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-label-md text-label-md mb-5 lg:mb-6"
              style={{ backgroundColor: 'rgba(27, 67, 50, 0.06)', border: '1px solid rgba(27, 67, 50, 0.1)', color: '#40916C' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Vertex AI & Genkit
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[40px] lg:text-[64px] font-bold tracking-tight leading-[1.08] mb-4 lg:mb-6 font-headline-lg"
              style={{ fontFamily: "var(--font-headline-lg)" }}
            >
              Track less.{' '}
              <span className="text-primary">Live more.</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="font-body-lg text-[18px] mb-7 lg:mb-9 max-w-md lg:max-w-lg mx-auto lg:mx-0 leading-relaxed text-on-surface-variant"
            >
              Your AI-powered coach that turns everyday habits into climate wins — with zero guilt and one simple action at a time.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary text-white px-7 py-3.5 lg:px-8 lg:py-4 rounded-full font-label-md text-label-md shadow-md hover:shadow-xl hover:shadow-[#1B4332]/10 transition-all duration-300 active:scale-[0.97]">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              ) : (
                <button onClick={() => openAuth('signup')} className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary text-white px-7 py-3.5 lg:px-8 lg:py-4 rounded-full font-label-md text-label-md shadow-md hover:shadow-xl hover:shadow-[#1B4332]/10 transition-all duration-300 active:scale-[0.97]">
                  Start your trail
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              )}
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="mt-8 lg:mt-12 flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="flex -space-x-2">
                {['#C07B52', '#40916C', '#1B4332', '#D97706'].map((color, i) => (
                  <div key={i} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#F5F3EF] flex items-center justify-center text-white text-[10px] lg:text-[11px] font-bold" style={{ backgroundColor: color }}>
                    {['A', 'R', 'P', 'S'][i]}
                  </div>
                ))}
              </div>
              <p className="text-[12px] lg:text-[13px] text-on-surface/40 font-body-md">
                <span className="font-semibold text-on-surface/60">2,400+</span> people tracking in Pune
              </p>
            </motion.div>
          </div>

          {/* Right: Dashboard Preview Card */}
          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex-1 w-full max-w-sm lg:max-w-md"
          >
            <div className="glass-card rounded-[2rem] p-6 lg:p-8">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] lg:text-[12px] font-medium uppercase tracking-wider text-on-surface/30">Today's Budget</p>
                  <p className="text-[18px] lg:text-[22px] font-bold mt-0.5 font-display-lg">Looking good 🌿</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/15 text-secondary">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="text-[11px] lg:text-[12px] font-semibold">7 day streak</span>
                </div>
              </div>

              {/* Daily Ring */}
              <DailyRing value={4.2} max={12} />
              <p className="text-center text-[12px] lg:text-[14px] text-on-surface/40 mt-3 mb-7 font-body-md">
                You've used 4.2 of your 12 kg daily budget
              </p>

              {/* Quick Log Tiles */}
              <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-6">
                {[
                  { icon: <Train className="w-4 h-4 lg:w-5 lg:h-5" />, label: 'Transport', color: '#40916C' },
                  { icon: <Utensils className="w-4 h-4 lg:w-5 lg:h-5" />, label: 'Food', color: '#C07B52' },
                  { icon: <Zap className="w-4 h-4 lg:w-5 lg:h-5" />, label: 'Energy', color: '#D97706' },
                  { icon: <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />, label: 'Shopping', color: '#1B4332' },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    className="flex flex-col items-center gap-2 py-3 lg:py-4 rounded-xl border border-outline-variant/40 hover:shadow-md hover:border-outline-variant hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.95] bg-background"
                  >
                    <span style={{ color: cat.color }}>{cat.icon}</span>
                    <span className="text-[10px] lg:text-[12px] font-medium text-on-surface/45">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* AI Insight Card */}
              <div className="border-l-[3px] border-[#40916C] bg-background rounded-r-xl p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Leaf className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[12px] lg:text-[14px] font-medium text-on-surface/65 leading-relaxed font-body-md">
                      Based on your 3 metro rides this week — your transport is <strong className="text-secondary font-semibold">22% below average</strong>. Keep going!
                    </p>
                    <button className="text-[11px] lg:text-[13px] font-semibold text-secondary mt-2.5 hover:text-primary transition-colors flex items-center gap-1">
                      Add goal <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Impact Stats ─── */}
      <section className="py-12 lg:py-16 px-6">
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5"
        >
          {[
            { value: '47K', label: 'kg CO₂ saved', icon: <ArrowDownRight className="w-5 h-5 text-secondary" />, accent: '#40916C' },
            { value: '2.4K', label: 'active users', icon: <Sparkles className="w-5 h-5 text-tertiary" />, accent: '#C07B52' },
            { value: '12K', label: 'tree-days earned', icon: <TreePine className="w-5 h-5 text-secondary" />, accent: '#40916C' },
            { value: '94%', label: 'weekly retention', icon: <Flame className="w-5 h-5 text-tertiary" />, accent: '#C07B52' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              className="bg-white rounded-2xl border border-outline-variant/40 p-5 lg:p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${stat.accent}10` }}>
                {stat.icon}
              </div>
              <span className="text-[28px] lg:text-[36px] font-bold text-on-surface block font-display-lg">{stat.value}</span>
              <p className="text-[12px] lg:text-[14px] text-on-surface/35 font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features: Understand · Track · Reduce ─── */}
      <section id="features" className="py-20 lg:py-28 px-6 bg-white border-y border-outline-variant/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14 lg:mb-20"
          >
            <p className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary mb-3">Three Layers</p>
            <h2 className="text-[22px] lg:text-[36px] font-bold tracking-tight font-display-lg">
              Understand. Track. Reduce.
            </h2>
            <p className="text-[14px] lg:text-[16px] text-on-surface/40 mt-3 max-w-lg mx-auto font-body-md">
              Three layers working together to turn awareness into lasting behavior change.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                icon: <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />,
                bg: 'bg-[#E8D5B0]/25',
                iconColor: 'text-tertiary',
                title: 'Understand',
                desc: 'AI translates raw emissions into tangible comparisons — "equal to driving Pune to Mumbai 8 times" — not numbers on a spreadsheet.',
              },
              {
                icon: <Target className="w-5 h-5 lg:w-6 lg:h-6" />,
                bg: 'bg-primary-container/15',
                iconColor: 'text-secondary',
                title: 'Track',
                desc: 'Log transport, food, and energy in under 30 seconds. Smart defaults learn your routine — just tap to confirm.',
              },
              {
                icon: <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6" />,
                bg: 'bg-primary/5',
                iconColor: 'text-primary',
                title: 'Reduce',
                desc: 'One daily action ranked by impact × ease. Not "use less energy" — but "skip the AC tonight, it\'s 23°C outside."',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-2xl p-6 lg:p-8 border border-outline-variant/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group bg-background"
              >
                <div className={`w-11 h-11 lg:w-14 lg:h-14 ${feature.bg} rounded-xl flex items-center justify-center ${feature.iconColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-[16px] lg:text-[20px] font-bold mb-2 font-display-lg">{feature.title}</h3>
                <p className="text-[13px] lg:text-[15px] leading-relaxed text-on-surface/45 font-body-md">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how" className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14 lg:mb-20"
          >
            <p className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary mb-3">Simple as 1-2-3</p>
            <h2 className="text-[22px] lg:text-[36px] font-bold tracking-tight font-display-lg">
              How CarbonTrail works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              { step: '01', title: 'Tell us about your day', desc: 'Quick tap tiles or snap a photo of your electricity bill. Takes 30 seconds, not 5 minutes.' },
              { step: '02', title: 'AI finds your patterns', desc: 'Gemini analyzes your habits across transport, food, and energy — spotting what matters most.' },
              { step: '03', title: 'Get your daily nudge', desc: 'One specific, achievable action — with the exact CO₂ you\'ll save. Progress you can feel.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i + 1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white rounded-2xl border border-outline-variant/30 p-6 lg:p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center md:text-left"
              >
                <span className="inline-block text-[42px] lg:text-[56px] font-bold text-[#E8D5B0] mb-2 font-display-lg">{item.step}</span>
                <h3 className="text-[16px] lg:text-[20px] font-bold mb-2 font-display-lg">{item.title}</h3>
                <p className="text-[13px] lg:text-[15px] leading-relaxed text-on-surface/45 font-body-md">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Insights Section ─── */}
      <section id="insights" className="py-20 lg:py-28 px-6 bg-white border-y border-outline-variant/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14 lg:mb-20"
          >
            <p className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary mb-3">AI Coach</p>
            <h2 className="text-[22px] lg:text-[36px] font-bold tracking-tight font-display-lg">
              A coach who watches your patterns
            </h2>
            <p className="text-[14px] lg:text-[16px] text-on-surface/40 mt-3 max-w-lg mx-auto font-body-md">
              Not a chatbot that just read your data. Every insight cites what it's based on, so you always know why.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {/* Weekly summary card */}
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-background rounded-2xl p-6 lg:p-8 border border-outline-variant/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-[11px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary">Weekly Summary</p>
              </div>
              <p className="text-[14px] lg:text-[16px] leading-relaxed text-on-surface/60 font-body-md">
                "You reduced by <strong className="text-secondary font-semibold">18% this week</strong> — mostly from 4 meatless days. Your energy spiked Thursday. Try keeping transport under 20 kg next week."
              </p>
            </motion.div>

            {/* Daily nudge card */}
            <motion.div
              custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-background rounded-2xl p-6 lg:p-8 border border-outline-variant/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#E8D5B0]/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-tertiary" />
                </div>
                <p className="text-[11px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary">Daily Nudge</p>
              </div>
              <p className="text-[14px] lg:text-[16px] leading-relaxed text-on-surface/60 font-body-md">
                "Based on your 14 rides this month, switching <strong className="text-secondary font-semibold">3 rides/week to metro</strong> saves 8 kg CO₂. That's 2 trees working for a month."
              </p>
            </motion.div>

            {/* Route comparison card */}
            <motion.div
              custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-2 bg-background rounded-2xl p-6 lg:p-8 border border-outline-variant/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center">
                  <Train className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] lg:text-[13px] font-semibold uppercase tracking-wider text-tertiary">Route Comparison</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 lg:p-6 border border-outline-variant/30">
                  <p className="text-[12px] lg:text-[14px] font-medium text-on-surface/40 mb-2">🚗 Driving</p>
                  <p className="text-[24px] lg:text-[32px] font-bold text-on-surface font-display-lg">
                    1.8 <span className="text-[14px] lg:text-[16px] font-medium text-on-surface/40">kg CO₂/day</span>
                  </p>
                </div>
                <div className="bg-primary-container/10 rounded-xl p-5 lg:p-6 border border-[#95D5B2]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[12px] lg:text-[14px] font-medium text-secondary">🚇 Metro</p>
                    <span className="text-[10px] lg:text-[11px] font-semibold bg-primary-container/20 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Recommended
                    </span>
                  </div>
                  <p className="text-[24px] lg:text-[32px] font-bold text-primary font-display-lg">
                    0.3 <span className="text-[14px] lg:text-[16px] font-medium text-secondary">kg CO₂/day</span>
                  </p>
                </div>
              </div>
              <p className="text-[13px] lg:text-[15px] text-secondary font-medium mt-5 text-center font-body-md">
                Switching saves <strong>46 kg CO₂/month</strong> — that's 10 trees working for you 🌳
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 lg:py-24 px-6">
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-primary rounded-3xl p-10 sm:p-12 lg:p-16 text-center text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/10 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-[22px] lg:text-[36px] font-bold mb-4 tracking-tight font-display-lg">
              {user ? 'Continue your trail' : 'Ready to see your trail?'}
            </h2>
            <p className="text-[14px] lg:text-[18px] text-white/50 mb-8 lg:mb-10 max-w-lg mx-auto font-body-md">
              No lectures. No guilt. Just your data, your actions, and a coach that actually gets you.
            </p>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2.5 bg-white text-primary px-8 py-4 lg:px-10 lg:py-5 rounded-full text-[14px] lg:text-[16px] font-semibold hover:shadow-xl transition-all duration-300 active:scale-[0.97]">
                Go to Dashboard
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            ) : (
              <button onClick={() => openAuth('signup')} className="inline-flex items-center gap-2.5 bg-white text-primary px-8 py-4 lg:px-10 lg:py-5 rounded-full text-[14px] lg:text-[16px] font-semibold hover:shadow-xl transition-all duration-300 active:scale-[0.97]">
                Start for free
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 lg:py-10 px-6 border-t border-outline-variant/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
            </div>
            <span className="font-semibold text-[13px] lg:text-[14px] font-display-lg">CarbonTrail</span>
          </div>
          <p className="text-[11px] lg:text-[12px] text-on-surface/30 font-body-md">
            Built with Vertex AI · Firebase Genkit · Google Maps APIs
          </p>
        </div>
      </footer>

      {/* ─── Auth Modal ─── */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuth}
        initialMode={authModal.mode}
      />

    </div>
  );
};

export default LandingPage;
