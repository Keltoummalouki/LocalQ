"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    LogOut,
    MessageSquare,
    Radio,
    MapPin,
    Clock,
    ArrowUpRight,
    Zap,
    Plus,
    ChevronRight,
    Trash2,
    Heart,
    HeartOff,
} from "lucide-react";
import api from "../../services/api";
import Link from "next/link";

// ============================================================================
// Interfaces
// ============================================================================

interface Author {
    firstName: string;
    lastName: string;
}

interface Question {
    _id: string;
    title: string;
    content: string;
    city: string;
    author?: Author;
    createdAt: string;
    upvotes?: string[];
}

interface Answer {
    _id: string;
    content: string;
    question?: {
        _id: string;
        title: string;
    };
    createdAt: string;
}

interface DecodedToken {
    firstName?: string;
    lastName?: string;
    email?: string;
    sub?: string;
    exp?: number;
}

type TabType = "transmissions" | "signals" | "favorites";

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" as const },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 100 : -100,
        opacity: 0,
        transition: { duration: 0.2 },
    }),
};

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}

function decodeJWT(token: string): DecodedToken | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

// ============================================================================
// Skeleton Components
// ============================================================================

const CardSkeleton = () => (
    <div className="relative p-5 rounded-xl bg-white/5 border-l-4 border-[var(--antigrafity-border)] overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="space-y-3">
            <div className="h-5 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="flex gap-4">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/10 rounded" />
            </div>
        </div>
    </div>
);

// ============================================================================
// Empty State Component
// ============================================================================

const EmptyState = ({
    type,
    onAction,
}: {
    type: "transmissions" | "signals" | "favorites";
    onAction: () => void;
}) => {
    const config = {
        transmissions: {
            icon: MessageSquare,
            message: "No transmissions sent yet.",
            button: "Create New Question",
        },
        signals: {
            icon: Radio,
            message: "No signals sent yet.",
            button: "Browse Questions",
        },
        favorites: {
            icon: Heart,
            message: "No saved frequencies yet.",
            button: "Discover Questions",
        },
    };

    const { icon: Icon, message, button } = config[type];

    return (
        <motion.div
            variants={itemVariants}
            className="relative py-16 px-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-[var(--antigrafity-border)]"
        >
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-[var(--antigrafity-accent)]/10 border border-[var(--antigrafity-accent)]/20">
                <Icon className="w-7 h-7 text-[var(--antigrafity-accent)]" />
            </div>
            <p className="font-mono text-sm text-[var(--antigrafity-text-muted)] mb-6">
        // {message}
            </p>
            <button
                onClick={onAction}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)] font-medium hover:bg-[var(--antigrafity-accent-hover)] transition-colors"
            >
                <Plus className="w-4 h-4" />
                {button}
            </button>
        </motion.div>
    );
};

// ============================================================================
// Action Button Component (Delete or Unlike)
// ============================================================================

const ActionButton = ({
    onClick,
    variant = "delete",
}: {
    onClick: (e: React.MouseEvent) => void;
    variant?: "delete" | "unlike";
}) => (
    <button
        onClick={onClick}
        className={`absolute top-3 right-3 p-2 rounded-lg bg-[var(--antigrafity-surface)] text-[var(--antigrafity-text-muted)] opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 ${variant === "delete"
                ? "hover:bg-[var(--antigrafity-error)] hover:text-white"
                : "hover:bg-pink-500/20 hover:text-pink-400"
            }`}
        title={variant === "delete" ? "Delete" : "Remove from favorites"}
    >
        {variant === "delete" ? (
            <Trash2 className="w-4 h-4" />
        ) : (
            <HeartOff className="w-4 h-4" />
        )}
    </button>
);

// ============================================================================
// Question Card Component
// ============================================================================

const QuestionCard = ({
    question,
    onAction,
    actionType = "delete",
}: {
    question: Question;
    onAction: (id: string) => void;
    actionType?: "delete" | "unlike";
}) => {
    const handleAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAction(question._id);
    };

    return (
        <Link href={`/questions/${question._id}`}>
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 4 }}
                className="group relative p-5 rounded-xl bg-white/5 backdrop-blur-md border-l-4 border-[var(--antigrafity-accent)] hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
                {/* Action button */}
                <ActionButton onClick={handleAction} variant={actionType} />

                <div className="flex justify-between items-start gap-4 mb-3 pr-10">
                    <h3 className="text-lg font-semibold text-[var(--antigrafity-text)] group-hover:text-[var(--antigrafity-accent)] transition-colors line-clamp-1">
                        {question.title}
                    </h3>
                    <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--antigrafity-accent)]/20 border border-[var(--antigrafity-accent)]/30 text-[var(--antigrafity-accent)] text-xs font-mono uppercase">
                        <MapPin className="w-3 h-3" />
                        {question.city}
                    </span>
                </div>

                <p className="text-sm text-[var(--antigrafity-text-secondary)] line-clamp-2 mb-3">
                    {question.content}
                </p>

                {/* Footer with likes */}
                <div className="flex items-center gap-4 text-xs font-mono text-[var(--antigrafity-text-muted)]">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(question.createdAt)}
                    </span>

                    {/* Likes Counter */}
                    <span className="flex items-center gap-1.5 text-[var(--antigrafity-accent)]">
                        <Zap className="w-3 h-3 fill-[var(--antigrafity-accent)]" />
                        <span className="font-medium">{question.upvotes?.length || 0}</span>
                    </span>
                </div>

                <ChevronRight className="absolute right-4 bottom-5 w-5 h-5 text-[var(--antigrafity-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.div>
        </Link>
    );
};

// ============================================================================
// Answer Card Component
// ============================================================================

const AnswerCard = ({
    answer,
    onDelete,
}: {
    answer: Answer;
    onDelete: (id: string) => void;
}) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(answer._id);
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, x: 4 }}
            className="group relative p-5 rounded-xl bg-white/5 backdrop-blur-md border-l-4 border-[#00D9FF] hover:bg-white/10 transition-all duration-300"
        >
            {/* Delete button */}
            <ActionButton onClick={handleDelete} variant="delete" />

            {/* Question reference */}
            {answer.question && (
                <Link
                    href={`/questions/${answer.question._id}`}
                    className="flex items-center gap-2 mb-3 text-xs font-mono text-[var(--antigrafity-text-muted)] hover:text-[#00D9FF] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Radio className="w-3 h-3" />
                    <span>In reply to:</span>
                    <span className="text-[#00D9FF] underline underline-offset-2">
                        {answer.question.title}
                    </span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            )}

            <p className="text-sm text-[var(--antigrafity-text-secondary)] line-clamp-3 mb-3 pr-10">
                {answer.content}
            </p>

            <div className="flex items-center gap-3 text-xs font-mono text-[var(--antigrafity-text-muted)]">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(answer.createdAt)}
                </span>
            </div>
        </motion.div>
    );
};

// ============================================================================
// Tab Button Component
// ============================================================================

const TabButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    count: number;
}) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-3 font-mono text-xs sm:text-sm transition-all duration-300 ${active
                ? "text-[var(--antigrafity-accent)]"
                : "text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-text-secondary)]"
            }`}
    >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        <span
            className={`px-2 py-0.5 rounded text-xs ${active
                    ? "bg-[var(--antigrafity-accent)]/20 text-[var(--antigrafity-accent)]"
                    : "bg-white/10 text-[var(--antigrafity-text-muted)]"
                }`}
        >
            {count}
        </span>

        {/* Active indicator */}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--antigrafity-accent)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

// ============================================================================
// Main Page Component
// ============================================================================

export default function ProfilePage() {
    const router = useRouter();

    const [userName, setUserName] = useState("Commander");
    const [activeTab, setActiveTab] = useState<TabType>("transmissions");
    const [direction, setDirection] = useState(0);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [likedQuestions, setLikedQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // Check auth & decode token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const decoded = decodeJWT(token);
        if (decoded?.firstName) {
            setUserName(decoded.firstName);
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // l'appel aux favoris dans le Promise.all
                const [questionsRes, answersRes, favoritesRes] = await Promise.all([
                    api.get("/questions/mine"),
                    api.get("/answers/mine"),
                    api.get("/questions/liked"), 
                ]);

                setQuestions(questionsRes.data);
                setAnswers(answersRes.data);
                setLikedQuestions(favoritesRes.data); 
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [])

    // Fetch favorites when tab changes to favorites
    useEffect(() => {
        if (activeTab === "favorites" && likedQuestions.length === 0) {
            fetchFavorites();
        }
    }, [activeTab]);

    const fetchFavorites = async () => {
        try {
            setFavoritesLoading(true);
            const res = await api.get("/questions/liked");
            setLikedQuestions(res.data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setFavoritesLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const handleTabChange = (tab: TabType) => {
        const tabOrder: TabType[] = ["transmissions", "signals", "favorites"];
        const currentIndex = tabOrder.indexOf(activeTab);
        const newIndex = tabOrder.indexOf(tab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(tab);
    };

    // Delete handler for questions and answers
    const handleDelete = async (id: string, type: "questions" | "answers") => {
        const confirmMessage =
            type === "questions"
                ? "Are you sure you want to delete this transmission? This will also delete all associated signals."
                : "Are you sure you want to delete this signal?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            // Optimistic UI update
            if (type === "questions") {
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                setAnswers((prev) => prev.filter((a) => a._id !== id));
            }

            await api.delete(`/${type}/${id}`);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            alert(`Failed to delete. Please try again.`);

            // Revert by refetching
            try {
                if (type === "questions") {
                    const res = await api.get("/questions/mine");
                    setQuestions(res.data);
                } else {
                    const res = await api.get("/answers/mine");
                    setAnswers(res.data);
                }
            } catch {
                console.error("Failed to refetch data");
            }
        }
    };

    // Unlike handler for favorites (calls PATCH vote to toggle unlike)
    const handleUnlike = async (id: string) => {
        try {
            // Optimistic UI - remove from favorites immediately
            setLikedQuestions((prev) => prev.filter((q) => q._id !== id));

            // Call vote endpoint to toggle (unlike)
            await api.patch(`/questions/${id}/vote`);
        } catch (error) {
            console.error("Error unliking question:", error);
            // Revert by refetching
            fetchFavorites();
        }
    };

    const getTabContent = () => {
        if (loading || (activeTab === "favorites" && favoritesLoading)) {
            return (
                <motion.div
                    key="loading"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="space-y-4"
                >
                    {[0, 1, 2].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </motion.div>
            );
        }

        switch (activeTab) {
            case "transmissions":
                return (
                    <motion.div
                        key="transmissions"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        {questions.length === 0 ? (
                            <EmptyState
                                type="transmissions"
                                onAction={() => router.push("/create")}
                            />
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {questions.map((q) => (
                                    <QuestionCard
                                        key={q._id}
                                        question={q}
                                        onAction={(id) => handleDelete(id, "questions")}
                                        actionType="delete"
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                );

            case "signals":
                return (
                    <motion.div
                        key="signals"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        {answers.length === 0 ? (
                            <EmptyState
                                type="signals"
                                onAction={() => router.push("/")}
                            />
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {answers.map((a) => (
                                    <AnswerCard
                                        key={a._id}
                                        answer={a}
                                        onDelete={(id) => handleDelete(id, "answers")}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                );

            case "favorites":
                return (
                    <motion.div
                        key="favorites"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        {likedQuestions.length === 0 ? (
                            <EmptyState
                                type="favorites"
                                onAction={() => router.push("/")}
                            />
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {likedQuestions.map((q) => (
                                    <QuestionCard
                                        key={q._id}
                                        question={q}
                                        onAction={handleUnlike}
                                        actionType="unlike"
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                );
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background layers */}
            <div className="fixed inset-0 bg-[#050505]" />
            <div className="fixed inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#050505] to-[#0F0F14]" />

            {/* Grid overlay */}
            <div
                className="fixed inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                }}
            />

            {/* Gradient accents */}
            <div className="fixed top-0 right-1/3 w-[400px] h-[400px] bg-[var(--antigrafity-accent)]/5 rounded-full blur-[150px]" />
            <div className="fixed bottom-1/4 left-0 w-80 h-80 bg-[#00D9FF]/5 rounded-full blur-[120px]" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 md:px-12 lg:px-20 py-8"
                >
                    <div className="flex items-center justify-between">
                        {/* Back link */}
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-sm font-mono text-[var(--antigrafity-text-muted)] hover:text-[var(--antigrafity-accent)] transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                BACK TO FEED
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--antigrafity-border)] bg-white/5 hover:border-[var(--antigrafity-error)] hover:bg-[var(--antigrafity-error)]/10 transition-all"
                        >
                            <LogOut className="w-4 h-4 text-[var(--antigrafity-text-muted)] group-hover:text-[var(--antigrafity-error)] transition-colors" />
                            <span className="text-sm font-mono text-[var(--antigrafity-text-muted)] group-hover:text-[var(--antigrafity-error)] transition-colors">
                                LOGOUT
                            </span>
                        </button>
                    </div>
                </motion.header>

                {/* Profile Hero */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-6 md:px-12 lg:px-20 pb-12"
                >
                    <div className="max-w-4xl">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--antigrafity-accent)] to-[var(--antigrafity-accent-muted)] flex items-center justify-center">
                                    <User className="w-10 h-10 text-[var(--antigrafity-bg)]" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--antigrafity-success)] border-2 border-[var(--antigrafity-bg)]" />
                            </div>

                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--antigrafity-text)] mb-1">
                                    Welcome back,{" "}
                                    <span className="text-[var(--antigrafity-accent)]">
                                        {userName}
                                    </span>
                                </h1>
                                <p className="font-mono text-sm text-[var(--antigrafity-text-muted)]">
                    Your command center
                                </p>
                            </div>
                        </div>

                        {/* Stats bar */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-8 p-4 rounded-xl bg-white/[0.02] border border-[var(--antigrafity-border)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--antigrafity-accent)]/10 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-[var(--antigrafity-accent)]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--antigrafity-text)]">
                                        {questions.length}
                                    </p>
                                    <p className="text-xs font-mono text-[var(--antigrafity-text-muted)]">
                                        TRANSMISSIONS
                                    </p>
                                </div>
                            </div>

                            <div className="w-px h-12 bg-[var(--antigrafity-border)] hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/10 flex items-center justify-center">
                                    <Radio className="w-5 h-5 text-[#00D9FF]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--antigrafity-text)]">
                                        {answers.length}
                                    </p>
                                    <p className="text-xs font-mono text-[var(--antigrafity-text-muted)]">
                                        SIGNALS
                                    </p>
                                </div>
                            </div>

                            <div className="w-px h-12 bg-[var(--antigrafity-border)] hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--antigrafity-text)]">
                                        {likedQuestions.length}
                                    </p>
                                    <p className="text-xs font-mono text-[var(--antigrafity-text-muted)]">
                                        SAVED
                                    </p>
                                </div>
                            </div>

                            <div className="ml-auto">
                                <Link
                                    href="/create"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)] font-medium hover:bg-[var(--antigrafity-accent-hover)] transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span className="text-sm hidden sm:inline">New Question</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Tabs Section */}
                <section className="px-6 md:px-12 lg:px-20 pb-20">
                    <div className="max-w-4xl">
                        {/* Tab buttons */}
                        <div className="flex border-b border-[var(--antigrafity-border)] mb-8 overflow-x-auto">
                            <TabButton
                                active={activeTab === "transmissions"}
                                onClick={() => handleTabChange("transmissions")}
                                icon={MessageSquare}
                                label="My Transmissions"
                                count={questions.length}
                            />
                            <TabButton
                                active={activeTab === "signals"}
                                onClick={() => handleTabChange("signals")}
                                icon={Radio}
                                label="My Signals"
                                count={answers.length}
                            />
                            <TabButton
                                active={activeTab === "favorites"}
                                onClick={() => handleTabChange("favorites")}
                                icon={Heart}
                                label="Saved Frequencies"
                                count={likedQuestions.length}
                            />
                        </div>

                        {/* Tab content */}
                        <AnimatePresence mode="wait" custom={direction}>
                            {getTabContent()}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative py-12 px-6 md:px-12 border-t border-[var(--antigrafity-border)]">
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--antigrafity-text-muted)]">
                        <span>© 2026 LOCALQ</span>
                        <span>COMMAND CENTER</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
