import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bot,
    MessageSquareText,
    RefreshCw,
    Send,
    Sparkles,
    User,
    Wand2,
    X
} from "lucide-react";
import { getLinkChat, sendLinkChatMessage } from "../../api/links.api";

function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function EmptyState({ questions = [], onQuestionClick }) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-accent/20 bg-accent/10 text-accent">
                <Wand2 size={22} />
            </div>

            <h4 className="mt-4 text-lg font-semibold text-foreground">
                Ask AI about this link
            </h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Ask grounded questions about traffic, geography, devices, referrers, trends, or what to improve next.
            </p>

            {questions.length ? (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {questions.map((question) => (
                        <button
                            key={question}
                            type="button"
                            onClick={() => onQuestionClick(question)}
                            className="rounded-full border border-border bg-white/[0.04] px-3 py-2 text-sm text-foreground transition hover:bg-white/[0.08]"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] rounded-[1.4rem] border px-4 py-3 ${
                    isUser
                        ? "border-accent/20 bg-accent/12 text-foreground"
                        : "border-border bg-white/[0.04] text-foreground"
                }`}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            isUser
                                ? "bg-accent/20 text-accent"
                                : "bg-white/[0.06] text-zinc-200"
                        }`}
                    >
                        {isUser ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                            {message.content}
                        </div>
                        {message.createdAt ? (
                            <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {formatDateTime(message.createdAt)}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LinkAiChatPanel({
    open,
    onClose,
    linkId,
    linkSlug
}) {
    const [chatData, setChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const scrollRef = useRef(null);

    const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

    useEffect(() => {
        if (!open || !linkId) return;

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getLinkChat(linkId);
                setChatData(response || null);
                setMessages(response?.messages || []);
                setSuggestedQuestions(response?.suggestedQuestions || []);
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Could not load AI chat right now."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [open, linkId]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, open]);

    const submitQuestion = async (questionText) => {
        const question = (questionText || input).trim();
        if (!question || !linkId) return;

        try {
            setSending(true);
            setError("");

            const optimisticUserMessage = {
                id: `temp-user-${Date.now()}`,
                role: "user",
                content: question,
                createdAt: new Date().toISOString()
            };

            setMessages((prev) => [...prev, optimisticUserMessage]);
            setInput("");

            const response = await sendLinkChatMessage(linkId, { question });

            setChatData(response || null);
            setMessages(response?.messages || []);
            setSuggestedQuestions(response?.suggestedQuestions || []);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Could not send your question right now."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[115] bg-black/70 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ x: 36, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 36, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="absolute right-0 top-0 h-full w-full max-w-[720px] border-l border-border bg-background shadow-2xl"
                    >
                        <div className="flex h-full flex-col">
                            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b10]/95 px-5 py-4 backdrop-blur-2xl sm:px-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="soft-label mb-2">Conversational Analytics</div>
                                        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                            Ask AI about /{linkSlug || "this-link"}
                                        </h3>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                            Explore performance with grounded answers based on the current analytics snapshot and recent conversation context.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-ghost-premium h-10 w-10 rounded-2xl p-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div
                                ref={scrollRef}
                                className="premium-scrollbar flex-1 overflow-auto px-5 py-5 sm:px-6"
                            >
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="rounded-[1.4rem] border border-border bg-white/[0.03] p-4"
                                            >
                                                <div className="h-4 w-28 animate-pulse rounded bg-white/[0.08]" />
                                                <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                                                <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-white/[0.06]" />
                                            </div>
                                        ))}
                                    </div>
                                ) : error && !messages.length ? (
                                    <div className="rounded-[1.5rem] border border-danger/20 bg-danger/10 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                                                <MessageSquareText size={18} />
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-foreground">
                                                    AI chat is unavailable
                                                </div>
                                                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                                                    {error}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : !messages.length ? (
                                    <EmptyState
                                        questions={suggestedQuestions}
                                        onQuestionClick={(question) => submitQuestion(question)}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <MessageBubble key={message.id} message={message} />
                                        ))}

                                        {sending ? (
                                            <div className="flex justify-start">
                                                <div className="rounded-[1.4rem] border border-border bg-white/[0.04] px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-200">
                                                            <Bot size={15} />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <RefreshCw size={14} className="animate-spin" />
                                                            Thinking...
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border px-5 py-4 sm:px-6">
                                {suggestedQuestions.length ? (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {suggestedQuestions.map((question) => (
                                            <button
                                                key={question}
                                                type="button"
                                                onClick={() => submitQuestion(question)}
                                                disabled={sending}
                                                className="rounded-full border border-border bg-white/[0.04] px-3 py-2 text-sm text-foreground transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <Sparkles size={12} className="mr-1 inline-block" />
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}

                                {error && messages.length ? (
                                    <div className="mb-3 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                                        {error}
                                    </div>
                                ) : null}

                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            rows={3}
                                            placeholder="Ask about traffic trends, country mix, device behavior, anomalies, or what to improve next..."
                                            className="input-premium min-h-[108px] resize-none py-3"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (canSend) {
                                                        submitQuestion();
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => submitQuestion()}
                                        disabled={!canSend}
                                        className="btn-primary-premium inline-flex items-center gap-2 self-end disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}