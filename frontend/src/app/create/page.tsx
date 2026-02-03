"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, MapPin, FileText, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Link from 'next/link';

// Animation variants
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

// Success animation component
const SuccessAnimation = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--antigrafity-bg)]/90 backdrop-blur-md"
    >
        <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center"
        >
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-500/20 border border-green-500/40"
            >
                <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-serif text-[var(--antigrafity-text)] mb-2">
                Transmission envoyée
            </h2>
            <p className="font-mono text-sm text-green-500">
                [SUCCESS] :: QUESTION_CREATED
            </p>
        </motion.div>
    </motion.div>
);

export default function CreateQuestionPage() {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        city: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthChecked(true);
        }
    }, [router]);

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, content: e.target.value });

        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await api.post('/questions', formData);
            setShowSuccess(true);

            // Redirect after animation
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } catch (err: any) {
            setError('[ERROR] :: SYSTEM_REJECTED — ' + (err.response?.data?.message || 'Unknown error'));
            setIsSubmitting(false);
        }
    };

    // Don't render until auth check is complete
    if (!isAuthChecked) {
        return (
            <div className="min-h-screen bg-[var(--antigrafity-bg)] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-[var(--antigrafity-accent)] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <>
            {/* Success overlay */}
            <AnimatePresence>
                {showSuccess && <SuccessAnimation />}
            </AnimatePresence>

            <div className="relative min-h-screen overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-[#0A0A0F]" />
                <div className="fixed inset-0 bg-gradient-to-br from-[#0F0F14] via-[#0A0A0F] to-[#12121A]" />

                {/* Accent glows */}
                <div className="fixed top-1/3 right-0 w-80 h-80 bg-[var(--antigrafity-accent)]/5 rounded-full blur-[120px]" />
                <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px]" />

                {/* Content */}
                <div className="relative z-10 min-h-screen px-6 md:px-12 lg:px-20 py-12">

                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-12"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-mono text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-accent)] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>// BACK TO FEED</span>
                        </Link>
                    </motion.div>

                    {/* Form container - asymmetric layout */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-3xl md:ml-12 lg:ml-24"
                    >
                        {/* Header */}
                        <motion.div variants={itemVariants} className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Terminal className="w-5 h-5 text-[var(--antigrafity-accent)]" />
                                <span className="text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-accent)]">
                                    NEW TRANSMISSION
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--antigrafity-text)] leading-tight">
                                Posez votre
                                <br />
                                <span className="italic text-[var(--antigrafity-text-secondary)]">question</span>
                                <span className="text-[var(--antigrafity-accent)]">.</span>
                            </h1>
                        </motion.div>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="font-mono text-sm text-red-400">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Title field */}
                            <motion.div variants={itemVariants} className="relative">
                                <label className="block mb-2 text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-text-muted)]">
                                    <span className="text-[var(--antigrafity-accent)]">&gt;</span> TITLE
                                </label>
                                <input
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Votre question en quelques mots..."
                                    required
                                    className="w-full bg-transparent border-0 border-b-2 border-[var(--antigrafity-border)] py-4 text-2xl font-serif text-[var(--antigrafity-text)] placeholder:text-[var(--antigrafity-text-muted)]/50 focus:outline-none focus:border-[var(--antigrafity-accent)] transition-colors"
                                />
                            </motion.div>

                            {/* Content field */}
                            <motion.div variants={itemVariants} className="relative">
                                <label className="block mb-2 text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-text-muted)]">
                                    <span className="text-[var(--antigrafity-accent)]">&gt;</span> CONTENT
                                </label>
                                <div className="relative">
                                    <FileText className="absolute top-4 left-0 w-4 h-4 text-[var(--antigrafity-text-muted)]" />
                                    <textarea
                                        ref={textareaRef}
                                        name="content"
                                        value={formData.content}
                                        onChange={handleTextareaChange}
                                        placeholder="Décrivez votre question en détail..."
                                        required
                                        rows={4}
                                        className="w-full bg-transparent border-0 border-b-2 border-[var(--antigrafity-border)] py-4 pl-8 font-mono text-[var(--antigrafity-text)] placeholder:text-[var(--antigrafity-text-muted)]/50 focus:outline-none focus:border-[var(--antigrafity-accent)] transition-colors resize-none overflow-hidden"
                                    />
                                </div>
                            </motion.div>

                            {/* City field */}
                            <motion.div variants={itemVariants} className="relative max-w-xs">
                                <label className="block mb-2 text-xs font-mono uppercase tracking-widest text-[var(--antigrafity-text-muted)]">
                                    <span className="text-[var(--antigrafity-accent)]">&gt;</span> CITY
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute top-4 left-0 w-4 h-4 text-[var(--antigrafity-text-muted)]" />
                                    <input
                                        name="city"
                                        type="text"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="ex: Paris, Lyon..."
                                        required
                                        className="w-full bg-transparent border-0 border-b-2 border-[var(--antigrafity-border)] py-4 pl-8 font-mono text-[var(--antigrafity-text)] placeholder:text-[var(--antigrafity-text-muted)]/50 focus:outline-none focus:border-[var(--antigrafity-accent)] transition-colors"
                                    />
                                </div>
                            </motion.div>

                            {/* Submit button with cyber effect */}
                            <motion.div variants={itemVariants} className="pt-8">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative px-8 py-4 rounded-lg bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)] font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {/* Glitch/cyber effect layers */}
                                    <span className="absolute inset-0 bg-[var(--antigrafity-accent-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    {/* Glitch lines on hover */}
                                    <span className="absolute left-0 top-1/4 w-full h-px bg-white/30 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500" />
                                    <span className="absolute left-0 top-3/4 w-full h-px bg-white/20 opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:-translate-x-full transition-all duration-700" />

                                    <span className="relative flex items-center justify-center gap-3">
                                        {isSubmitting ? (
                                            <>
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                                />
                                                <span className="font-mono">TRANSMITTING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                <span>Envoyer la question</span>
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </motion.div>

                        </form>

                        {/* Terminal-style footer hint */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-12 pt-8 border-t border-[var(--antigrafity-border)]"
                        >
                            <p className="font-mono text-xs text-[var(--antigrafity-text-muted)]">
                                <span className="text-[var(--antigrafity-accent)]">$</span> Votre question sera visible par toute la communauté de votre ville.
                            </p>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </>
    );
}
