"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Animation variants for staggered fade-in
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

// Internal component to handle search params (Google Callback)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Detect if returning from Google with token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      router.push('/');
    }

    // If Google returns an error
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError("Échec de l'authentification Google.");
    }
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/');
    } catch (err: any) {
      setError("Email ou mot de passe incorrect.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-md"
    >
      {/* Card with glass effect */}
      <motion.div
        variants={itemVariants}
        className="relative p-8 md:p-10 rounded-2xl md:rounded-tl-3xl md:rounded-br-3xl md:rounded-tr-lg md:rounded-bl-lg bg-[var(--antigrafity-surface)]/90 backdrop-blur-xl border border-[var(--antigrafity-border)] shadow-2xl shadow-black/30"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--antigrafity-text)] font-serif mb-2">
            Bon retour
          </h1>
          <p className="text-[var(--antigrafity-text-secondary)]">
            Connectez-vous à <span className="text-[var(--antigrafity-accent)]">LocalQ</span>
          </p>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-[var(--antigrafity-error-bg)] border border-[var(--antigrafity-error)]/20"
          >
            <p className="text-sm text-[var(--antigrafity-error)]">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <Input
              name="email"
              type="email"
              label="Email"
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              name="password"
              type="password"
              label="Mot de passe"
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2"
            >
              Se connecter
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </form>

        {/* Separator */}
        <motion.div variants={itemVariants} className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-[var(--antigrafity-border)]" />
          <span className="flex-shrink-0 mx-4 text-[var(--antigrafity-text-muted)] text-sm uppercase tracking-wider">
            ou
          </span>
          <div className="flex-grow border-t border-[var(--antigrafity-border)]" />
        </motion.div>

        {/* Google Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            className="w-full gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </Button>
        </motion.div>

        {/* Footer link */}
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-[var(--antigrafity-text-secondary)] mt-8"
        >
          Pas encore de compte ?{' '}
          <Link
            href="/signup"
            className="text-[var(--antigrafity-accent)] font-medium hover:underline underline-offset-4 transition-colors"
          >
            Créer un compte
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// Main component (Suspense wrapper required for useSearchParams in Next.js)
export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--antigrafity-bg)] via-[var(--antigrafity-surface)] to-[var(--antigrafity-bg)]" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[var(--antigrafity-accent)]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[var(--antigrafity-accent)]/5 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-[var(--antigrafity-accent)] border-t-transparent rounded-full"
              />
            </div>
          }
        >
          <div className="flex justify-center">
            <LoginForm />
          </div>
        </Suspense>
      </div>
    </div>
  );
}