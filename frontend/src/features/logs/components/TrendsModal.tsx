import { motion, AnimatePresence } from 'framer-motion';
import { X, Train, Utensils, Zap, ShoppingBag, TrendingUp, Calendar, Info } from 'lucide-react';
import type { CarbonLog } from '../api/logs';

interface TrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyLogs: CarbonLog[];
}

const CATEGORY_CONFIG = {
  transport: {
    title: 'Transport',
    Icon: Train,
    color: '#40916C',
    bgColor: 'bg-[#40916C]/10',
  },
  food: {
    title: 'Food',
    Icon: Utensils,
    color: '#C07B52',
    bgColor: 'bg-[#C07B52]/10',
  },
  energy: {
    title: 'Energy',
    Icon: Zap,
    color: '#D97706',
    bgColor: 'bg-[#D97706]/10',
  },
  shopping: {
    title: 'Shopping',
    Icon: ShoppingBag,
    color: '#1B4332',
    bgColor: 'bg-[#1B4332]/10',
  },
} as const;

export const TrendsModal = ({ isOpen, onClose, weeklyLogs }: TrendsModalProps) => {
  // Generate the last 7 days keys & names
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  // Calculate daily totals
  const dailyTotals = last7Days.map((date) => {
    const dateStr = date.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    const total = weeklyLogs
      .filter((log) => new Date(log.timestamp).toDateString() === dateStr)
      .reduce((sum, log) => sum + log.carbonImpact, 0);
    return { dayName, dayNum, total };
  });

  const dailyBudget = 15; // kg CO2 budget
  // Cap the minimum chart scale at the daily budget to keep budget line within bounds
  const maxDaily = Math.max(...dailyTotals.map((d) => d.total), dailyBudget);

  // Calculate category totals over 7 days
  const categoryTotals = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };
  let totalWeeklyEmissions = 0;

  weeklyLogs.forEach((log) => {
    const cat = log.category as keyof typeof categoryTotals;
    if (cat && categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += log.carbonImpact;
      totalWeeklyEmissions += log.carbonImpact;
    }
  });

  const weeklyAverage = Number((totalWeeklyEmissions / 7).toFixed(1));
  const underBudgetDays = dailyTotals.filter((d) => d.total <= dailyBudget).length;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
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
          {/* Internal CSS */}
          <style>{`
            .trends-modal-container {
              max-width: 500px;
              height: 500px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .trends-scroll-area {
              height: 247px;
              overflow-y: auto;
              padding-left: 2rem;
              padding-right: 2rem;
              padding-top: 1.25rem;
              padding-bottom: 1.25rem;
              scrollbar-width: thin;
            }
            .trends-stats-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 0.75rem;
              margin-bottom: 1.5rem;
            }
            .chart-container {
              position: relative;
              height: 120px;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              padding-left: 0.5rem;
              padding-right: 0.5rem;
              padding-top: 1.5rem;
              border-bottom: 1px solid rgba(232, 213, 176, 0.3);
              padding-bottom: 0.25rem;
              margin-bottom: 1.5rem;
            }
            .budget-line {
              position: absolute;
              left: 0;
              right: 0;
              border-top: 1px dashed rgba(220, 38, 38, 0.4) !important;
              z-index: 1;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              pointer-events: none;
            }
            .budget-line-label {
              font-size: 8px !important;
              font-weight: 700 !important;
              color: rgba(220, 38, 38, 0.8) !important;
              background-color: #F5F3EF !important;
              padding: 0 4px !important;
              transform: translateY(-50%) !important;
              margin-right: 8px !important;
            }
            .chart-bar-item {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-left: 0.25rem;
              margin-right: 0.25rem;
              position: relative;
              z-index: 10;
              height: 100%;
              justify-content: flex-end;
            }
            .chart-bar {
              width: 100%;
              max-width: 24px;
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }
            .chart-bar.under-budget {
              background-color: rgba(64, 145, 108, 0.7) !important;
            }
            .chart-bar.under-budget:hover {
              background-color: rgba(64, 145, 108, 1) !important;
            }
            .chart-bar.over-budget {
              background-color: rgba(186, 26, 26, 0.7) !important;
            }
            .chart-bar.over-budget:hover {
              background-color: rgba(186, 26, 26, 1) !important;
            }
            .chart-tooltip {
              position: absolute;
              bottom: 100%;
              margin-bottom: 6px;
              background-color: #1C1C1E !important;
              color: #FFFFFF !important;
              font-size: 8px !important;
              font-weight: 700 !important;
              padding: 2px 6px !important;
              border-radius: 4px !important;
              opacity: 0 !important;
              pointer-events: none;
              transition: opacity 0.2s ease, transform 0.2s ease;
              transform: translateY(4px);
              white-space: nowrap;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
              z-index: 50;
            }
            .chart-bar-item:hover .chart-tooltip {
              opacity: 1 !important;
              transform: translateY(0);
            }
            .chart-label-day {
              font-size: 9px !important;
              font-weight: 700 !important;
              color: rgba(28, 28, 30, 0.6) !important;
              margin-top: 6px !important;
              line-height: 1 !important;
            }
            .chart-label-date {
              font-size: 8px !important;
              font-weight: 500 !important;
              color: rgba(28, 28, 30, 0.3) !important;
              line-height: 1.2 !important;
            }
          `}</style>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" />

          {/* Modal Container */}
          <motion.div
            className="relative bg-[#F5F3EF] rounded-3xl shadow-2xl w-full overflow-hidden border border-[#E8D5B0]/40 z-10 trends-modal-container"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/30 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="pt-8 pb-4 px-8 border-b border-[#E8D5B0]/20">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-tight font-display">
                  Emissions Trends
                </h2>
              </div>
              <p className="text-[13px] text-[#1C1C1E]/45 font-medium ml-9">
                Analysis of your daily logs and category breakdown over the last 7 days.
              </p>
            </div>

            {/* Content Scroll Area */}
            <div className="trends-scroll-area">
              {/* Daily Bar Chart */}
              <div>
                <h3 className="text-[11px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  7-Day Emissions History
                </h3>

                <div className="chart-container">
                  {/* Budget line representation */}
                  <div
                    className="budget-line"
                    style={{ bottom: `${(dailyBudget / maxDaily) * 100}%` }}
                  >
                    <span className="budget-line-label">
                      Budget Limit (15 kg)
                    </span>
                  </div>

                  {dailyTotals.map((d, i) => {
                    const heightPercent = `${(d.total / maxDaily) * 100}%`;
                    const isOver = d.total > dailyBudget;
                    return (
                      <div key={i} className="chart-bar-item">
                        {/* Tooltip */}
                        <div className="chart-tooltip">
                          {d.total.toFixed(1)} kg CO2
                        </div>

                        {/* Bar */}
                        <motion.div
                          className={`chart-bar ${isOver ? 'over-budget' : 'under-budget'}`}
                          style={{ height: heightPercent }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                        />

                        {/* Labels */}
                        <span className="chart-label-day">
                          {d.dayName}
                        </span>
                        <span className="chart-label-date">
                          {d.dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="trends-stats-grid">
                <div className="bg-white/50 border border-[#E8D5B0]/30 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-0.5">
                    Weekly Total
                  </p>
                  <p className="text-[18px] font-extrabold text-[#1C1C1E] tracking-tight">
                    {totalWeeklyEmissions.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-[#1C1C1E]/50 font-medium">kg CO2</p>
                </div>

                <div className="bg-white/50 border border-[#E8D5B0]/30 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-0.5">
                    Daily Average
                  </p>
                  <p className="text-[18px] font-extrabold text-[#1C1C1E] tracking-tight">
                    {weeklyAverage}
                  </p>
                  <p className="text-[9px] text-[#1C1C1E]/50 font-medium">kg / day</p>
                </div>

                <div className="bg-white/50 border border-[#E8D5B0]/30 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-0.5">
                    Budget Days
                  </p>
                  <p className="text-[18px] font-extrabold text-primary tracking-tight">
                    {underBudgetDays}/7
                  </p>
                  <p className="text-[9px] text-[#1C1C1E]/50 font-medium">under limit</p>
                </div>
              </div>

              {/* Category Breakdown list */}
              <div>
                <h3 className="text-[11px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Category Breakdown (7 Days)
                </h3>

                <div className="space-y-2">
                  {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((key) => {
                    const conf = CATEGORY_CONFIG[key];
                    const Icon = conf.Icon;
                    const amount = categoryTotals[key];
                    const percentage = totalWeeklyEmissions > 0
                      ? Math.round((amount / totalWeeklyEmissions) * 100)
                      : 0;

                    return (
                      <div key={key} className="flex items-center gap-3 bg-white/40 border border-[#E8D5B0]/20 p-2.5 rounded-2xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white`} style={{ backgroundColor: conf.color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-semibold text-xs text-[#1C1C1E]">{conf.title}</span>
                            <span className="text-[10px] font-bold text-[#1C1C1E]/70">
                              {amount.toFixed(1)} kg ({percentage}%)
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-neutral-200/50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: conf.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/30 border-t border-[#E8D5B0]/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary/95 shadow-sm transition-all active:scale-[0.97]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
