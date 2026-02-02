"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, Clock, ArrowUpRight, Zap } from 'lucide-react';
import api from '../services/api';
import Link from 'next/link';

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
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const heroTextVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
};

// Skeleton loader component
const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    variants={itemVariants}
    className={`relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border-l-4 border-[var(--antigrafity-border)] overflow-hidden ${index % 2 === 0 ? 'md:translate-x-0' : 'md:translate-x-8'
      }`}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
  </motion.div>
);

// Question Card Component
const QuestionCard = ({ question, index }: { question: Question; index: number }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2 }
    }}
    className={`group relative p-6 rounded-xl bg-white/5 backdrop-blur-md border-l-4 border-[var(--antigrafity-accent)] hover:bg-white/10 transition-all duration-300 cursor-pointer ${index % 2 === 0 ? 'md:translate-x-0' : 'md:translate-x-12'
      } ${index % 3 === 0 ? 'md:mr-16' : 'md:ml-8'}`}
  >
    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl bg-[var(--antigrafity-accent)]/0 group-hover:bg-[var(--antigrafity-accent)]/5 transition-all duration-300" />

    {/* Header */}
    <div className="relative flex justify-between items-start gap-4 mb-4">
      <h2 className="text-xl font-semibold text-[var(--antigrafity-text)] group-hover:text-[var(--antigrafity-accent)] transition-colors duration-300 line-clamp-2">
        {question.title}
      </h2>

      {/* City Tag */}
      <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--antigrafity-accent)]/20 border border-[var(--antigrafity-accent)]/30 text-[var(--antigrafity-accent)] text-xs font-mono uppercase tracking-wider">
        <MapPin className="w-3 h-3" />
        {question.city}
      </span>
    </div>

    {/* Content */}
    <p className="relative text-[var(--antigrafity-text-secondary)] line-clamp-2 mb-6">
      {question.content}
    </p>

    {/* Footer - Monospace style */}
    <div className="relative flex justify-between items-center text-xs font-mono text-[var(--antigrafity-text-muted)]">
      <span className="flex items-center gap-2">
        <User className="w-3 h-3" />
        <span className="text-[var(--antigrafity-text-secondary)]">
          {question.author?.firstName || 'ANON'}
        </span>
      </span>
      <span className="flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {new Date(question.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        })}
      </span>
    </div>

    {/* Arrow indicator on hover */}
    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <ArrowUpRight className="w-5 h-5 text-[var(--antigrafity-accent)]" />
    </div>
  </motion.div>
);

// Empty State Component
const EmptyState = () => (
  <motion.div
    variants={itemVariants}
    className="relative py-20 px-8 text-center rounded-2xl bg-white/5 backdrop-blur-sm border border-dashed border-[var(--antigrafity-border)]"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[var(--antigrafity-accent)]/10 border border-[var(--antigrafity-accent)]/20">
      <Zap className="w-8 h-8 text-[var(--antigrafity-accent)]" />
    </div>
    <h3 className="text-2xl font-serif text-[var(--antigrafity-text)] mb-2">
      Le silence avant la tempête
    </h3>
    <p className="text-[var(--antigrafity-text-muted)] font-mono text-sm mb-6">
      // No questions yet. Be the first to break the silence.
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

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/questions');
        setQuestions(res.data);
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-[#0A0A0F]" />
      <div className="fixed inset-0 bg-gradient-to-br from-[#0F0F14] via-[#0A0A0F] to-[#12121A]" />

      {/* Gradient mesh accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[var(--antigrafity-accent)]/5 rounded-full blur-[150px]" />
      <div className="fixed bottom-1/4 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10">

        {/* === HERO SECTION === */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative pt-16 pb-24 px-6 md:px-12 lg:px-20"
        >
          {/* Top bar with login */}
          <motion.div variants={heroTextVariants} className="flex justify-end mb-16">
            <Link
              href="/login"
              className="group flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--antigrafity-border)] bg-white/5 backdrop-blur-sm hover:border-[var(--antigrafity-accent)] hover:bg-[var(--antigrafity-accent)]/10 transition-all duration-300"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--antigrafity-accent)] animate-pulse" />
              <span className="text-sm font-mono text-[var(--antigrafity-text-secondary)] group-hover:text-[var(--antigrafity-accent)] transition-colors">
                LOGIN // JOIN
              </span>
            </Link>
          </motion.div>

          {/* Broken grid layout */}
          <div className="max-w-7xl">
            {/* Main headline - left aligned */}
            <motion.div variants={heroTextVariants} className="mb-8">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-accent)] border border-[var(--antigrafity-accent)]/30 rounded">
                v1.0 // BETA
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[var(--antigrafity-text)] leading-[0.9] tracking-tight">
                LocalQ<span className="text-[var(--antigrafity-accent)]">:</span>
                <br />
                <span className="text-[var(--antigrafity-text-secondary)]">Pulse of</span>
                <br />
                <span className="italic">the City</span>
                <span className="text-[var(--antigrafity-accent)]">.</span>
              </h1>
            </motion.div>

            {/* Subtext - right aligned, offset */}
            <motion.div
              variants={heroTextVariants}
              className="flex flex-col items-end md:mr-12 lg:mr-24"
            >
              <p className="font-mono text-lg md:text-xl text-[var(--antigrafity-text-muted)] tracking-wider">
                Ask<span className="text-[var(--antigrafity-accent)]">.</span>
                Discover<span className="text-[var(--antigrafity-accent)]">.</span>
                Connect<span className="text-[var(--antigrafity-accent)]">.</span>
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[var(--antigrafity-text-muted)]">
                <span>[ {questions.length} THREADS ]</span>
                <span className="w-8 h-px bg-[var(--antigrafity-border)]" />
                <span>LIVE</span>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* === FEED SECTION === */}
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative px-6 md:px-12 lg:px-20 pb-20"
        >
          {/* Section header */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--antigrafity-text-muted)]">
                // Recent Threads
              </h2>
              <div className="flex-grow h-px bg-gradient-to-r from-[var(--antigrafity-border)] to-transparent" />
            </div>
          </motion.div>

          {/* Questions grid/list */}
          <div className="max-w-4xl">
            {loading ? (
              // Skeleton loading state
              <motion.div variants={containerVariants} className="space-y-6">
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonCard key={i} index={i} />
                ))}
              </motion.div>
            ) : questions.length === 0 ? (
              // Empty state
              <EmptyState />
            ) : (
              // Questions list with offset/asymmetric layout
              <motion.div variants={containerVariants} className="space-y-6">
                {questions.map((q, index) => (
                  <QuestionCard key={q._id} question={q} index={index} />
                ))}
              </motion.div>
            )}
          </div>
        </motion.main>

        {/* Footer accent */}
        <footer className="relative py-12 px-6 md:px-12 border-t border-[var(--antigrafity-border)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--antigrafity-text-muted)]">
            <span>© 2026 LOCALQ</span>
            <span>BUILT WITH RAWNESS</span>
          </div>
        </footer>
      </div>
    </div>
  );
}