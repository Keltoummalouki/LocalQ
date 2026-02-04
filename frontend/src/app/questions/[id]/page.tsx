"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    MessageSquare,
    MapPin,
    User,
    Terminal,
    ArrowLeft,
    Clock,
    Send,
    AlertTriangle,
    LogIn,
    Zap,
} from "lucide-react";
import api from "../../../services/api";
import Link from "next/link";

// ============================================================================
// Interfaces & Utils
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
    upvotes: string[];
}

interface Answer {
    _id: string;
    content: string;
    author?: Author;
    createdAt: string;
    upvotes: string[];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).replace(",", " //");
}

function getUserId(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.id || decoded.sub || decoded.userId || decoded._id || null;
    } catch {
        return null;
    }
}

// ============================================================================
// Components
// ============================================================================

const VoteControl = ({ id, initialUpvotes, type, onVoteUpdate }: { id: string, initialUpvotes: string[], type: "question" | "answer", onVoteUpdate?: (newUpvotes: string[]) => void }) => {
    const router = useRouter();
    const [upvotes, setUpvotes] = useState<string[]>(initialUpvotes || []);
    const [isVoting, setIsVoting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => { setUserId(getUserId()); }, []);
    useEffect(() => { setUpvotes(initialUpvotes || []); }, [initialUpvotes]);

    const isVoted = userId ? upvotes.includes(userId) : false;

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userId) { router.push("/login"); return; }
        if (isVoting) return;

        setIsVoting(true);
        const newUpvotes = isVoted ? upvotes.filter((uid) => uid !== userId) : [...upvotes, userId];
        setUpvotes(newUpvotes);

        try {
            const endpoint = type === "question" ? "questions" : "answers";
            const res = await api.patch(`/${endpoint}/${id}/vote`);
            const serverUpvotes = res.data.upvotes || [];
            setUpvotes(serverUpvotes);
            onVoteUpdate?.(serverUpvotes);
        } catch (error) {
            console.error("Vote failed:", error);
            setUpvotes(initialUpvotes || []);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <button
            onClick={handleVote}
            disabled={isVoting}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isVoted 
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" 
                : "border-white/10 bg-white/5 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-400/80"
            } ${isVoting ? "opacity-50" : ""}`}
        >
            <Zap className={`w-4 h-4 ${isVoted ? "fill-yellow-400" : ""}`} />
            <span className="font-mono text-sm font-medium">{upvotes.length}</span>
        </button>
    );
};

const AnswerCard = ({ answer, index, onAnswerUpdate }: { answer: Answer, index: number, onAnswerUpdate: (a: Answer) => void }) => (
    <div className="group relative pl-6 py-6 border-l-2 border-[#00D9FF] bg-white/[0.02] mb-1">
        <div className="absolute -left-3 top-6 w-6 h-6 flex items-center justify-center bg-[#050505] border border-[#00D9FF]/30 rounded text-[10px] font-mono text-[#00D9FF]">
            {String(index + 1).padStart(2, "0")}
        </div>
        <div className="pl-4">
            <p className="text-gray-300 leading-relaxed mb-4">{answer.content}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {answer.author?.firstName || "ANON"}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDate(answer.createdAt)}</span>
                </div>
                <VoteControl id={answer._id} initialUpvotes={answer.upvotes} type="answer" onVoteUpdate={(votes) => onAnswerUpdate({...answer, upvotes: votes})} />
            </div>
        </div>
    </div>
);

// --- FORMULAIRE DE RÉPONSE CORRIGÉ (COULEURS FORCÉES) ---
const AnswerForm = ({ questionId, onAnswerPosted }: { questionId: string, onAnswerPosted: () => void }) => {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { setIsLoggedIn(!!localStorage.getItem("token")); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post("/answers", { content: content.trim(), questionId });
            setContent("");
            onAnswerPosted();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="mt-12 p-1">
                <button onClick={() => router.push("/login")} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg border border-gray-800 bg-white/5 hover:border-[#00D9FF] hover:bg-[#00D9FF]/10 transition-all text-gray-400 hover:text-[#00D9FF]">
                    <LogIn className="w-5 h-5" />
                    <span className="font-mono text-sm">LOGIN TO TRANSMIT ANSWER</span>
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative mt-12 mb-20">
            <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-[#00D9FF]" />
                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">Compose Transmission</span>
            </div>
            {/* FORCE COLORS: bg-[#0A0A0F] to ensure visibility against black page */}
            <div className="relative rounded-lg overflow-hidden border border-gray-800 focus-within:border-[#00D9FF] bg-[#0A0A0F] transition-colors">
                <div className="absolute left-0 top-0 w-10 h-full bg-[#050505] border-r border-gray-800 flex flex-col items-center pt-4 font-mono text-xs text-gray-600 select-none">
                    <span>01</span><span>02</span><span>03</span>
                </div>
                <textarea
                    name="answer-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your response..."
                    rows={4}
                    className="w-full pl-14 pr-4 py-4 bg-[#0A0A0F] text-gray-200 font-mono text-sm resize-none focus:outline-none placeholder:text-gray-700"
                    disabled={isSubmitting}
                />
            </div>
            <div className="flex justify-end mt-4">
                <button type="submit" disabled={isSubmitting || !content.trim()} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00D9FF] text-black font-bold uppercase text-xs tracking-wider hover:bg-[#33E1FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {isSubmitting ? "Transmitting..." : <><Send className="w-4 h-4" /> Submit</>}
                </button>
            </div>
        </form>
    );
};

// ============================================================================
// Main Page
// ============================================================================

export default function QuestionDetailsPage() {
    const params = useParams();
    const questionId = params.id as string;
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [qRes, aRes] = await Promise.all([
                api.get(`/questions/${questionId}`),
                api.get(`/answers/question/${questionId}`)
            ]);
            setQuestion(qRes.data);
            setAnswers(aRes.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { if (questionId) fetchData(); }, [questionId]);

    const handleAnswerPosted = () => { api.get(`/answers/question/${questionId}`).then(res => setAnswers(res.data)); };

    // --- CORRECTION DU SCROLL ICI : min-h-screen et overflow-x-hidden seulement ---
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505] -z-10" />
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00D9FF]/5 rounded-full blur-[150px] -z-10" />

            {/* Navigation */}
            <nav className="px-6 md:px-12 lg:px-20 py-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-[#00D9FF] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> <span>BACK TO FEED</span>
                </Link>
            </nav>

            <main className="px-6 md:px-12 lg:px-20 pb-40 max-w-5xl mx-auto">
                {loading ? (
                    <div className="animate-pulse space-y-8">
                        <div className="h-40 bg-white/5 rounded-2xl" />
                        <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                ) : question ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Hero Section */}
                        <article className="relative p-8 md:p-12 rounded-2xl bg-white/[0.03] border-l-4 border-[#00D9FF] mb-16">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">{question.title}</h1>
                                <VoteControl id={question._id} initialUpvotes={question.upvotes} type="question" onVoteUpdate={(v) => setQuestion({...question, upvotes: v})} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mb-8 text-xs font-mono text-gray-500">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/20"><MapPin className="w-3 h-3" /> {question.city}</span>
                                <span>|</span>
                                <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {question.author?.firstName || "ANON"}</span>
                                <span>|</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDate(question.createdAt)}</span>
                            </div>
                            <p className="text-lg text-gray-300 leading-relaxed border-l border-gray-800 pl-6">{question.content}</p>
                        </article>

                        {/* Answers Section */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <MessageSquare className="w-4 h-4 text-[#00D9FF]" />
                                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500">Transmissions [{answers.length}]</h2>
                                <div className="flex-grow h-px bg-gray-800" />
                            </div>

                            {answers.length === 0 ? (
                                <div className="py-16 text-center border border-dashed border-gray-800 rounded-xl bg-white/[0.01]">
                                    <p className="font-mono text-sm text-gray-600">No transmissions yet. Be the first to respond.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {answers.map((answer, index) => (
                                        <AnswerCard key={answer._id} answer={answer} index={index} onAnswerUpdate={(updated) => setAnswers(prev => prev.map(a => a._id === updated._id ? updated : a))} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Answer Form */}
                        <AnswerForm questionId={questionId} onAnswerPosted={handleAnswerPosted} />
                    </div>
                ) : null}
            </main>
        </div>
    );
}