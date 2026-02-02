"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
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
      staggerChildren: 0.08,
      delayChildren: 0.15,
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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', formData);
      router.push('/login');
    } catch (err: any) {
      setError("Erreur lors de l'inscription. Vérifiez que l'email n'est pas déjà utilisé.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--antigrafity-bg)] via-[var(--antigrafity-surface)] to-[var(--antigrafity-bg)]" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/3 -right-32 w-72 h-72 bg-[var(--antigrafity-accent)]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -left-32 w-72 h-72 bg-[var(--antigrafity-accent)]/5 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-lg mx-auto"
        >
          {/* Card with glass effect */}
          <motion.div
            variants={itemVariants}
            className="relative p-8 md:p-10 rounded-2xl md:rounded-tl-3xl md:rounded-br-3xl md:rounded-tr-lg md:rounded-bl-lg bg-[var(--antigrafity-surface)]/90 backdrop-blur-xl border border-[var(--antigrafity-border)] shadow-2xl shadow-black/30"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[var(--antigrafity-accent)]/10 border border-[var(--antigrafity-accent)]/20">
                <Sparkles className="w-4 h-4 text-[var(--antigrafity-accent)]" />
                <span className="text-sm text-[var(--antigrafity-accent)]">Rejoignez la communauté</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--antigrafity-text)] font-serif mb-2">
                Créez votre compte
              </h1>
              <p className="text-[var(--antigrafity-text-secondary)]">
                Posez des questions à votre <span className="text-[var(--antigrafity-accent)]">ville</span>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name fields - side by side */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  type="text"
                  label="Prénom"
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
                <Input
                  name="lastName"
                  type="text"
                  label="Nom"
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </motion.div>

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
                  autoComplete="new-password"
                  minLength={6}
                />
                <p className="mt-2 text-xs text-[var(--antigrafity-text-muted)]">
                  Minimum 6 caractères
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full gap-2"
                >
                  Créer mon compte
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
                S'inscrire avec Google
              </Button>
            </motion.div>

            {/* Footer link */}
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-[var(--antigrafity-text-secondary)] mt-8"
            >
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-[var(--antigrafity-accent)] font-medium hover:underline underline-offset-4 transition-colors"
              >
                Se connecter
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}