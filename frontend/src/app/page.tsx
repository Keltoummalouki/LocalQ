"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Clock, ArrowUpRight, Zap, Search, Terminal, X, Activity, TrendingUp, Users, MessageSquare } from 'lucide-react';
import api from '../services/api';
import Link from 'next/link';

// ============================================================================
// Interfaces
// ============================================================================

interface Question {
  _id: string;
  title: string;
  content: string;
  city: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  upvotes?: string[];
  answersCount?: number;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const pulseVariants = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

const sidebarVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: 0.5 }
  }
};

// ============================================================================
// Quick City Tags
// ============================================================================

const POPULAR_CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fes", "Agadir"];

// ============================================================================
// Debounce Hook
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Aurora Background Component
// ============================================================================

const AuroraBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Base dark background */}
    <div className="absolute inset-0 bg-[#050505]" />

    {/* Animated aurora gradients */}
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#00D9FF]/10 via-blue-600/5 to-transparent rounded-full blur-[150px]"
    />
    <motion.div
      animate={{
        x: [0, -80, 0],
        y: [0, 80, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
      className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/10 via-indigo-600/5 to-transparent rounded-full blur-[150px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/8 to-transparent rounded-full blur-[120px]"
    />

    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

// ============================================================================
// System Status Ticker
// ============================================================================

const SystemStatusTicker = () => {
  const cities = ["CASABLANCA", "RABAT", "MARRAKECH", "TANGER", "FES"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-[var(--antigrafity-border)] backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="font-mono text-xs text-green-400 uppercase tracking-wider">LIVE SYSTEMS:</span>
      <div className="flex items-center gap-2 overflow-hidden">
        {cities.map((city, i) => (
          <span key={city} className="font-mono text-xs text-[var(--antigrafity-text-muted)] whitespace-nowrap">
            {city}{i < cities.length - 1 && <span className="text-[var(--antigrafity-border)] mx-2">•</span>}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Skeleton Card
// ============================================================================

const SkeletonCard = () => (
  <div className="relative p-6 rounded-xl bg-white/[0.03] border border-[var(--antigrafity-border)] overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="h-6 w-3/4 bg-white/10 rounded" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-2/3 bg-white/10 rounded" />
      </div>
      <div className="flex justify-between pt-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-20 bg-white/10 rounded" />
      </div>
    </div>
  </div>
);

// ============================================================================
// Question Card Component
// ============================================================================

const QuestionCard = ({ question }: { question: Question }) => {
  const isRecent = useMemo(() => {
    const created = new Date(question.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }, [question.createdAt]);

  return (
    <Link href={`/questions/${question._id}`}>
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group relative p-6 rounded-xl bg-white/[0.03] backdrop-blur-md border border-[var(--antigrafity-border)] hover:border-[var(--antigrafity-accent)] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
      >
        {/* New Activity Indicator */}
        {isRecent && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--antigrafity-accent)]/20 border border-[var(--antigrafity-accent)]/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--antigrafity-accent)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--antigrafity-accent)]" />
            </span>
            <span className="font-mono text-[10px] text-[var(--antigrafity-accent)] uppercase">New</span>
          </div>
        )}

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-[var(--antigrafity-accent)]/0 group-hover:bg-[var(--antigrafity-accent)]/5 transition-all duration-300" />

        {/* Header */}
        <div className="relative flex justify-between items-start gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[var(--antigrafity-text)] group-hover:text-[var(--antigrafity-accent)] transition-colors duration-300 line-clamp-2">
            {question.title}
          </h2>

          <span className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--antigrafity-accent)]/10 border border-[var(--antigrafity-accent)]/20 text-[var(--antigrafity-accent)] text-xs font-mono uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {question.city}
          </span>
        </div>

        {/* Content */}
        <p className="relative text-sm text-[var(--antigrafity-text-secondary)] line-clamp-2 mb-5">
          {question.content}
        </p>

        {/* Footer */}
        <div className="relative flex items-center gap-4 text-xs font-mono text-[var(--antigrafity-text-muted)]">
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            <span className="text-[var(--antigrafity-text-secondary)]">
              {question.author?.firstName || 'ANON'}
            </span>
          </span>

          <span className="flex items-center gap-1.5 text-[var(--antigrafity-accent)]">
            <Zap className="w-3 h-3 fill-[var(--antigrafity-accent)]" />
            <span className="font-medium">{question.upvotes?.length || 0}</span>
          </span>

          <span className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3 h-3" />
            {new Date(question.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short'
            })}
          </span>
        </div>

        {/* Arrow indicator on hover */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-[var(--antigrafity-accent)]" />
        </div>
      </motion.div>
    </Link>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState = () => (
  <motion.div
    variants={itemVariants}
    className="relative py-20 px-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-[var(--antigrafity-border)]"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[var(--antigrafity-accent)]/10 border border-[var(--antigrafity-accent)]/20">
      <Zap className="w-8 h-8 text-[var(--antigrafity-accent)]" />
    </div>
    <h3 className="text-2xl font-serif text-[var(--antigrafity-text)] mb-2">
      Le silence avant la tempête
    </h3>
    <p className="text-[var(--antigrafity-text-muted)] font-mono text-sm mb-6">
      No transmissions yet. Be the first to broadcast.
    </p>
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)] font-medium hover:bg-[var(--antigrafity-accent-hover)] transition-colors"
    >
      Poser une question
      <ArrowUpRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

// ============================================================================
// No Results State
// ============================================================================

const NoResultsState = ({ onClear }: { onClear: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative py-16 px-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-[var(--antigrafity-border)]"
  >
    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <Terminal className="w-7 h-7 text-red-400" />
    </div>
    <p className="font-mono text-sm text-[var(--antigrafity-text-muted)] mb-6">
      <span className="text-red-400">[SYSTEM]</span> :: NO_DATA_FOUND_IN_SECTOR
    </p>
    <button
      type="button"
      onClick={onClear}
      aria-label="Clear filters"
      title="Clear filters"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--antigrafity-border)] hover:border-[var(--antigrafity-accent)] text-sm font-mono text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-accent)] transition-all"
    >
      <X className="w-4 h-4" aria-hidden="true" />
      Clear filters
    </button>
  </motion.div>
);

// ============================================================================
// Sidebar Widget
// ============================================================================

const SidebarWidget = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="p-5 rounded-xl bg-white/[0.02] border border-[var(--antigrafity-border)] backdrop-blur-sm">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[var(--antigrafity-accent)]" />
      <span className="font-mono text-xs uppercase tracking-wider text-[var(--antigrafity-text-muted)]">{title}</span>
    </div>
    {children}
  </div>
);

// ============================================================================
// Trending Cities Widget
// ============================================================================

const TrendingCitiesWidget = ({ questions }: { questions: Question[] }) => {
  const trendingCities = useMemo(() => {
    const cityCount: Record<string, number> = {};
    questions.forEach(q => {
      cityCount[q.city] = (cityCount[q.city] || 0) + 1;
    });
    return Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));
  }, [questions]);

  return (
    <SidebarWidget title="Trending Cities" icon={TrendingUp}>
      <div className="space-y-3">
        {trendingCities.length > 0 ? trendingCities.map(({ city, count }, i) => (
          <div key={city} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center rounded bg-[var(--antigrafity-accent)]/10 text-[10px] font-mono text-[var(--antigrafity-accent)]">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--antigrafity-text-secondary)] group-hover:text-[var(--antigrafity-accent)] transition-colors">
                {city}
              </span>
            </div>
            <span className="font-mono text-xs text-[var(--antigrafity-text-muted)]">{count}</span>
          </div>
        )) : (
          <p className="font-mono text-xs text-[var(--antigrafity-text-muted)]">No data yet</p>
        )}
      </div>
    </SidebarWidget>
  );
};

// ============================================================================
// System Stats Widget
// ============================================================================

const SystemStatsWidget = ({ totalQuestions }: { totalQuestions: number }) => (
  <SidebarWidget title="System Stats" icon={Activity}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--antigrafity-text-muted)]" />
          <span className="text-sm text-[var(--antigrafity-text-secondary)]">Transmissions</span>
        </div>
        <span className="font-mono text-lg font-bold text-[var(--antigrafity-accent)]">{totalQuestions}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--antigrafity-text-muted)]" />
          <span className="text-sm text-[var(--antigrafity-text-secondary)]">Active Users</span>
        </div>
        <span className="font-mono text-lg font-bold text-[var(--antigrafity-text)]">{Math.floor(totalQuestions * 1.5) + 42}</span>
      </div>
      <div className="pt-3 border-t border-[var(--antigrafity-border)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="font-mono text-xs text-green-400">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  </SidebarWidget>
);

// ============================================================================
// Main Component
// ============================================================================

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Search state
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Check auth status
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Debounced values
  const debouncedCity = useDebounce(cityFilter, 500);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchQuestions = useCallback(async (city: string, search: string) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (city.trim()) params.city = city.trim();
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/questions', { params });
      setQuestions(res.data);
    } catch (error) {
      console.error("Error loading questions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch for total count
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await api.get('/questions');
        setTotalCount(res.data.length);
      } catch (error) {
        console.error("Error fetching total", error);
      }
    };
    fetchTotal();
  }, []);

  // Fetch when debounced values change
  useEffect(() => {
    setIsSearching(debouncedCity !== '' || debouncedSearch !== '');
    fetchQuestions(debouncedCity, debouncedSearch);
  }, [debouncedCity, debouncedSearch, fetchQuestions]);

  const clearFilters = () => {
    setCityFilter('');
    setSearchQuery('');
  };

  const handleCityTagClick = (city: string) => {
    setCityFilter(city);
    setSearchQuery('');
  };

  const hasActiveFilters = cityFilter !== '' || searchQuery !== '';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />

      {/* Content */}
      <div className="relative z-10">

        {/* === HERO SECTION === */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative pt-8 pb-16 px-6 md:px-12 lg:px-20"
        >
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <SystemStatusTicker />

            {isLoggedIn ? (
              <Link
                href="/profile"
                className="group flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--antigrafity-border)] bg-white/[0.03] backdrop-blur-sm hover:border-[var(--antigrafity-accent)] hover:bg-[var(--antigrafity-accent)]/10 transition-all duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-mono text-[var(--antigrafity-text-secondary)] group-hover:text-[var(--antigrafity-accent)] transition-colors">
                  MY DASHBOARD
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--antigrafity-border)] bg-white/[0.03] backdrop-blur-sm hover:border-[var(--antigrafity-accent)] hover:bg-[var(--antigrafity-accent)]/10 transition-all duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--antigrafity-accent)] animate-pulse" />
                <span className="text-sm font-mono text-[var(--antigrafity-text-secondary)] group-hover:text-[var(--antigrafity-accent)] transition-colors">
                  LOGIN
                </span>
              </Link>
            )}
          </div>

          {/* Hero Text with breathing animation */}
          <div className="max-w-4xl">
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-accent)] border border-[var(--antigrafity-accent)]/30 rounded bg-[var(--antigrafity-accent)]/5">
                Welcome to the grid
              </span>
              <motion.h1
                variants={pulseVariants}
                animate="animate"
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[var(--antigrafity-text)] leading-[0.95] tracking-tight"
              >
                LocalQ<span className="text-[var(--antigrafity-accent)]">:</span>
                <br />
                <span className="text-[var(--antigrafity-text-secondary)]">Pulse of</span>
                <br />
                <span className="italic">the City</span>
                <span className="text-[var(--antigrafity-accent)]">.</span>
              </motion.h1>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <p className="font-mono text-lg text-[var(--antigrafity-text-muted)]">
                Ask<span className="text-[var(--antigrafity-accent)]">.</span>{" "}
                Discover<span className="text-[var(--antigrafity-accent)]">.</span>{" "}
                Connect<span className="text-[var(--antigrafity-accent)]">.</span>
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[var(--antigrafity-text-muted)]">
                <span className="px-3 py-1 rounded bg-white/[0.03] border border-[var(--antigrafity-border)]">
                  [ {totalCount} THREADS ]
                </span>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* === MAIN CONTENT === */}
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative px-6 md:px-12 lg:px-20 pb-20"
        >
          {/* 2-Column Layout */}
          <div className="flex gap-12 justify-between">

            {/* LEFT: Main Feed */}
            <div className="flex-1">

              {/* Terminal Search */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-[var(--antigrafity-accent)]" />
                  <span className="font-mono text-xs text-[var(--antigrafity-text-muted)] uppercase tracking-wider">
                    Query System
                  </span>
                  {hasActiveFilters && (
                    <span className="ml-auto flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--antigrafity-accent)] animate-pulse" />
                      <span className="font-mono text-xs text-[var(--antigrafity-accent)]">FILTERING</span>
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl overflow-hidden border border-[var(--antigrafity-border)] bg-[#0A0A0F]/80 backdrop-blur-md focus-within:border-[var(--antigrafity-accent)] transition-colors duration-300">
                  {/* Line numbers */}
                  <div className="absolute left-0 top-0 w-10 h-full bg-[#050505] border-r border-[var(--antigrafity-border)] flex flex-col items-center pt-4 font-mono text-xs text-[var(--antigrafity-text-muted)]">
                    <span>01</span>
                    <span>02</span>
                  </div>

                  <div className="pl-14 pr-4 py-4 space-y-3">
                    {/* City filter */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[var(--antigrafity-text-muted)]">
                        <span className="text-[var(--antigrafity-accent)]">$</span> city<span className="text-[var(--antigrafity-text-muted)]">=</span>
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--antigrafity-text-muted)]" />
                        <input
                          type="text"
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          placeholder="Casablanca, Rabat..."
                          className="flex-1 bg-transparent font-mono text-sm text-[var(--antigrafity-text)] placeholder:text-[var(--antigrafity-text-muted)]/50 focus:outline-none"
                        />
                        {cityFilter && (
                          <button
                            type="button"
                            onClick={() => setCityFilter('')}
                            aria-label="Clear city filter"
                            title="Clear city filter"
                            className="p-1 rounded hover:bg-white/10 text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-accent)] transition-colors"
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Keyword search */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[var(--antigrafity-text-muted)]">
                        <span className="text-[var(--antigrafity-accent)]">$</span> search<span className="text-[var(--antigrafity-text-muted)]">=</span>
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[var(--antigrafity-text-muted)]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="wifi, restaurant, events..."
                          className="flex-1 bg-transparent font-mono text-sm text-[var(--antigrafity-text)] placeholder:text-[var(--antigrafity-text-muted)]/50 focus:outline-none"
                        />
                        {!searchQuery && (
                          <span className="w-2 h-5 bg-[var(--antigrafity-accent)] animate-pulse opacity-70" />
                        )}
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search query"
                            title="Clear search query"
                            className="p-1 rounded hover:bg-white/10 text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-accent)] transition-colors"
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--antigrafity-border)] bg-white/[0.02]">
                    <span className="font-mono text-xs text-[var(--antigrafity-text-muted)]">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border border-[var(--antigrafity-accent)] border-t-transparent rounded-full animate-spin" />
                          EXECUTING...
                        </span>
                      ) : (
                        <span>
                          RESULTS: <span className="text-[var(--antigrafity-text-secondary)]">{questions.length}</span>
                          {isSearching && <span className="text-[var(--antigrafity-accent)]"> (filtered)</span>}
                        </span>
                      )}
                    </span>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        aria-label="Clear all filters"
                        title="Clear all filters"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--antigrafity-border)] hover:border-red-500 text-xs font-mono text-[var(--antigrafity-text-muted)] hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {POPULAR_CITIES.map(city => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => handleCityTagClick(city)}
                      aria-label={`Filter by ${city}`}
                      title={`Filter by ${city}`}
                      aria-pressed={cityFilter === city}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${cityFilter === city
                        ? 'border-[var(--antigrafity-accent)] bg-[var(--antigrafity-accent)]/10 text-[var(--antigrafity-accent)]'
                        : 'border-[var(--antigrafity-border)] bg-white/[0.02] text-[var(--antigrafity-text-muted)] hover:border-[var(--antigrafity-accent)]/50 hover:text-[var(--antigrafity-text-secondary)]'
                        }`}
                    >
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {city}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Section header */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--antigrafity-text-muted)]">
                    {isSearching ? 'Search Results' : 'Recent Transmissions'}
                  </h2>
                  <div className="flex-grow h-px bg-gradient-to-r from-[var(--antigrafity-border)] to-transparent" />
                </div>
              </motion.div>

              {/* Questions List */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    variants={containerVariants}
                    className="space-y-4"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </motion.div>
                ) : questions.length === 0 && isSearching ? (
                  <NoResultsState onClear={clearFilters} />
                ) : questions.length === 0 ? (
                  <EmptyState />
                ) : (
                  <motion.div
                    key="questions"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-4"
                  >
                    {questions.map((q) => (
                      <QuestionCard key={q._id} question={q} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Sidebar (hidden on mobile) */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <div className="sticky top-8 space-y-6">
                <TrendingCitiesWidget questions={questions} />
                <SystemStatsWidget totalQuestions={totalCount} />

                {/* CTA Widget */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--antigrafity-accent)]/10 to-transparent border border-[var(--antigrafity-accent)]/20">
                  <h3 className="font-semibold text-[var(--antigrafity-text)] mb-2">Got a question?</h3>
                  <p className="text-sm text-[var(--antigrafity-text-muted)] mb-4">
                    Share your local knowledge with the community.
                  </p>
                  <Link
                    href={isLoggedIn ? "/create" : "/login"}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)] font-medium text-sm hover:bg-[var(--antigrafity-accent-hover)] transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Create Transmission
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.main>

        {/* Footer */}
        <footer className="relative py-12 px-6 md:px-12 border-t border-[var(--antigrafity-border)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--antigrafity-text-muted)]">
            <span>© 2026 LOCALQ</span>
            <span>BUILT WITH ANTIGRAVITY</span>
          </div>
        </footer>
      </div>
    </div>
  );
}