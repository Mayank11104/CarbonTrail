import { motion } from 'framer-motion';
import {
  Leaf, TrendingDown, ArrowRight, ScanLine, Sparkles,
  Train, Utensils, Zap, ShoppingBag, ChevronRight,
  Target, MessageCircle, Flame
} from 'lucide-react';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ─── Radial Progress Ring Component ─── */
const DailyRing = ({ value, max }: { value: number; max: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#E8D5B0" strokeWidth="8" opacity="0.4" />
        {/* Progress fill — Mint for good progress */}
        <motion.circle
          cx="64" cy="64" r={radius} fill="none"
          stroke="#95D5B2" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[32px] font-bold text-[#1C1C1E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {value}
        </motion.span>
        <span className="text-[11px] text-[#1C1C1E]/40 font-medium uppercase tracking-wider">
          of {max} kg
        </span>
      </div>
    </div>
  );
};

/* ─── Main App ─── */
const App = () => {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1C1C1E] selection:bg-[#95D5B2]/30">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-[#E8D5B0]/40" style={{ backgroundColor: 'rgba(245, 243, 239, 0.88)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CarbonTrail" className="w-7 h-7" />
            <span className="font-semibold text-base tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>CarbonTrail</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#1C1C1E]/45">
            <a href="#features" className="hover:text-[#1B4332] transition-colors">Features</a>
            <a href="#how" className="hover:text-[#1B4332] transition-colors">How it works</a>
            <a href="#insights" className="hover:text-[#1B4332] transition-colors">AI Insights</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:block text-[13px] font-medium text-[#1C1C1E]/45 hover:text-[#1C1C1E] transition-colors">Log in</button>
            <button className="text-[13px] font-semibold bg-[#1B4332] text-white px-4 py-2 rounded-full hover:bg-[#1B4332]/90 transition-all active:scale-[0.97]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-14">

          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium mb-6"
              style={{ backgroundColor: 'rgba(27, 67, 50, 0.06)', border: '1px solid rgba(27, 67, 50, 0.1)', color: '#40916C' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Vertex AI & Genkit
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[32px] sm:text-[42px] lg:text-[48px] font-bold tracking-tight leading-[1.1] mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Track less.{' '}
              <span className="text-[#1B4332]">Live more.</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[15px] mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed text-[#1C1C1E]/50"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Your AI-powered coach that turns everyday habits into climate wins — with zero guilt and one simple action at a time.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] text-white px-6 py-3 rounded-full text-[14px] font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]">
                Start your trail
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#E8D5B0] text-[#1C1C1E] px-6 py-3 rounded-full text-[14px] font-semibold hover:border-[#C07B52] hover:text-[#C07B52] transition-all active:scale-[0.97] shadow-sm">
                <ScanLine className="w-4 h-4" />
                Scan a bill
              </button>
            </motion.div>
          </div>

          {/* Right: Dashboard Preview */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="flex-1 w-full max-w-sm lg:max-w-none"
          >
            <div className="bg-white rounded-2xl border border-[#E8D5B0]/50 shadow-sm p-6">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#1C1C1E]/35">Today's Budget</p>
                  <p className="text-[18px] font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Looking good 🌿</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#95D5B2]/15 text-[#40916C]">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">7 day streak</span>
                </div>
              </div>

              {/* Daily Ring — THE hero visualization */}
              <DailyRing value={4.2} max={12} />
              <p className="text-center text-[12px] text-[#1C1C1E]/40 mt-2 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                You've used 4.2 of your 12 kg daily budget
              </p>

              {/* Quick Log Tiles — 4 category tiles */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { icon: <Train className="w-4 h-4" />, label: 'Transport', color: '#40916C' },
                  { icon: <Utensils className="w-4 h-4" />, label: 'Food', color: '#C07B52' },
                  { icon: <Zap className="w-4 h-4" />, label: 'Energy', color: '#D97706' },
                  { icon: <ShoppingBag className="w-4 h-4" />, label: 'Shopping', color: '#1B4332' },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#E8D5B0]/50 hover:shadow-sm hover:border-[#E8D5B0] transition-all active:scale-[0.95] bg-[#F5F3EF]"
                  >
                    <span style={{ color: cat.color }}>{cat.icon}</span>
                    <span className="text-[11px] font-medium text-[#1C1C1E]/50">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* AI Insight Card — Sage left border, human tone */}
              <div className="border-l-[3px] border-[#40916C] bg-[#F5F3EF] rounded-r-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#95D5B2]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 text-[#40916C]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#1C1C1E]/70 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Based on your 3 metro rides this week — your transport is <strong className="text-[#40916C] font-semibold">22% below average</strong>. Keep going!
                    </p>
                    <button className="text-[11px] font-semibold text-[#40916C] mt-2 hover:text-[#1B4332] transition-colors flex items-center gap-1">
                      Add goal <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features: Understand · Track · Reduce ─── */}
      <section id="features" className="py-20 px-6 bg-white border-y border-[#E8D5B0]/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C07B52] mb-2">Three Layers</p>
            <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Understand. Track. Reduce.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <MessageCircle className="w-5 h-5" />,
                bg: 'bg-[#E8D5B0]/25',
                iconColor: 'text-[#C07B52]',
                title: 'Understand',
                desc: 'AI translates raw emissions into tangible comparisons — "equal to driving Pune to Mumbai 8 times" — not numbers on a spreadsheet.',
              },
              {
                icon: <Target className="w-5 h-5" />,
                bg: 'bg-[#95D5B2]/15',
                iconColor: 'text-[#40916C]',
                title: 'Track',
                desc: 'Log transport, food, and energy in under 30 seconds. Smart defaults learn your routine — just tap to confirm.',
              },
              {
                icon: <TrendingDown className="w-5 h-5" />,
                bg: 'bg-[#1B4332]/5',
                iconColor: 'text-[#1B4332]',
                title: 'Reduce',
                desc: 'One daily action ranked by impact × ease. Not "use less energy" — but "skip the AC tonight, it\'s 23°C outside."',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-2xl p-6 border border-[#E8D5B0]/30 hover:shadow-sm transition-shadow group bg-[#F5F3EF]"
              >
                <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center ${feature.iconColor} mb-4 group-hover:scale-105 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-bold mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{feature.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#1C1C1E]/45" style={{ fontFamily: "'Inter', sans-serif" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C07B52] mb-2">Simple as 1-2-3</p>
            <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              How CarbonTrail works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Tell us about your day', desc: 'Quick tap tiles or snap a photo of your electricity bill. Takes 30 seconds, not 5 minutes.' },
              { step: '02', title: 'AI finds your patterns', desc: 'Gemini analyzes your habits across transport, food, and energy — spotting what matters most.' },
              { step: '03', title: 'Get your daily nudge', desc: 'One specific, achievable action — with the exact CO₂ you\'ll save. Progress you can feel.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i + 1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex flex-col items-center md:items-start text-center md:text-left"
              >
                <span className="text-[42px] font-bold text-[#E8D5B0] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.step}</span>
                <h3 className="text-[15px] font-bold mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#1C1C1E]/45" style={{ fontFamily: "'Inter', sans-serif" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Insights Section ─── */}
      <section id="insights" className="py-20 px-6 bg-white border-y border-[#E8D5B0]/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C07B52] mb-2">AI Coach</p>
            <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              A coach who watches your patterns
            </h2>
            <p className="text-[14px] text-[#1C1C1E]/45 mt-3 max-w-lg mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              Not a chatbot that just read your data. Every insight cites what it's based on, so you always know why.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Weekly summary card */}
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-[#F5F3EF] rounded-2xl p-6 border border-[#E8D5B0]/30"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C07B52] mb-3">Weekly Summary</p>
              <p className="text-[14px] leading-relaxed text-[#1C1C1E]/65" style={{ fontFamily: "'Inter', sans-serif" }}>
                "You reduced by <strong className="text-[#40916C] font-semibold">18% this week</strong> — mostly from 4 meatless days. Your energy spiked Thursday. Try keeping transport under 20 kg next week."
              </p>
            </motion.div>

            {/* Daily nudge card */}
            <motion.div
              custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-[#F5F3EF] rounded-2xl p-6 border border-[#E8D5B0]/30"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C07B52] mb-3">Daily Nudge</p>
              <p className="text-[14px] leading-relaxed text-[#1C1C1E]/65" style={{ fontFamily: "'Inter', sans-serif" }}>
                "Based on your 14 rides this month, switching <strong className="text-[#40916C] font-semibold">3 rides/week to metro</strong> saves 8 kg CO₂. That's 2 trees working for a month."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner — Earned Forest green moment ─── */}
      <section className="py-20 px-6">
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-[#1B4332] rounded-2xl p-10 sm:p-12 text-center text-white"
        >
          <h2 className="text-[22px] sm:text-[28px] font-bold mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Ready to see your trail?
          </h2>
          <p className="text-[14px] text-white/55 mb-7 max-w-md mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            No lectures. No guilt. Just your data, your actions, and a coach that actually gets you.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-[#1B4332] px-7 py-3.5 rounded-full text-[14px] font-semibold hover:shadow-lg transition-all active:scale-[0.97]">
            Start for free
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 border-t border-[#E8D5B0]/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="CarbonTrail" className="w-5 h-5" />
            <span className="font-semibold text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>CarbonTrail</span>
          </div>
          <p className="text-[11px] text-[#1C1C1E]/30" style={{ fontFamily: "'Inter', sans-serif" }}>
            Built with Vertex AI · Firebase Genkit · Google Maps APIs
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
