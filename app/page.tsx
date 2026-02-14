"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const primaryGradient =
  "from-[#7b5cff] via-[#b75cff] to-[#ff8fd1]";

export default function Home() {
const [mode, setMode] = useState<"chat" | "image">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      setLoading(true);
      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input, mode }),
      });

      const reader = res.body?.getReader();
      if (!reader) {
        setLoading(false);
        return;
      }

      let aiText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        aiText += chunk;

        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
            next[lastIndex] = {
              ...next[lastIndex],
              content: aiText,
            };
          }
          return next;
        });
      }
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!input.trim()) return;
    setImageError(null);
    try {
      setLoading(true);
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      if (res.ok && data?.image) {
        setImages((prev) => [data.image, ...prev]);
        setInput("");
      } else {
        setImageError(data?.error ?? `Request failed (${res.status})`);
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050014] via-[#070018] to-[#050014] text-white">
      {/* Top nav */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7b5cff] to-[#ff8fd1] text-xs font-semibold shadow-lg shadow-purple-600/60">
              AI
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/90">
              Fancy AI
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-xs font-medium text-white/60 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#capabilities" className="hover:text-white">
              Capabilities
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
          </nav>
          <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10">
            Launch app
          </button>
        </div>
      </header>

      {/* Hero + live AI panel */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#0b0120] via-[#120533] to-[#050014]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-40 top-[-10%] h-64 w-64 rounded-full bg-purple-500/40 blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-72 w-72 rounded-full bg-pink-500/30 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col-reverse gap-10 px-4 py-10 md:px-5 md:py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-6 lg:py-20">
          {/* Hero text */}
          <div className="max-w-xl space-y-6 lg:flex-[0.4]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Smart AI for your everyday needs
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Effortless chat,{" "}
              <span className="bg-gradient-to-r from-[#b75cff] to-[#ff8fd1] bg-clip-text text-transparent">
                code
              </span>{" "}
              and images in one beautiful workspace.
            </h1>
            <p className="text-sm leading-relaxed text-white/65 lg:text-base">
              Fancy AI combines conversational intelligence, expert-grade coding
              help, and vivid image generation into a single, fluid interface.
              Talk to it, build with it, or visualize ideas in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="rounded-full bg-gradient-to-r from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] px-5 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg shadow-purple-500/50 hover:brightness-110">
                Start for free
              </button>
              <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/75 hover:bg-white/10">
                Watch demo
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-5 text-[11px] text-white/60">
              <div>
                <p className="text-sm font-semibold text-white">99.9% uptime</p>
                <p>Enterprise-grade reliability</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">50k+</p>
                <p>Queries served every day</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Instant</p>
                <p>Streaming responses</p>
              </div>
            </div>
          </div>

          {/* Interactive AI panel */}
          <div className="w-full max-w-3xl flex-1 lg:flex-[0.6]">
            <div className="relative h-full rounded-3xl border border-white/15 bg-black/40 p-4 shadow-2xl shadow-purple-900/70 backdrop-blur-2xl md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                </div>
<div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-0.5 text-[10px] text-white/70">
                  {["chat", "image"].map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setMode(m as "chat" | "image")
                      }
                      className={`rounded-full px-2 py-0.5 capitalize transition ${
                        mode === m
                          ? "bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] text-[10px] font-semibold text-white"
                          : "text-[10px] text-white/60 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

{/* Chat view */}
              {mode !== "image" && (
                <div className="mb-3 h-[420px] overflow-y-auto rounded-2xl bg-white/3 p-3 md:h-[520px]">
                    <div className="space-y-2">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                            msg.role === "user"
                              ? "ml-auto bg-gradient-to-r from-[#7b5cff] to-[#b75cff] text-[13px]"
                              : "chatgpt-message bg-white/5 text-[13px] text-white/90"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                pre: ({ children }) => (
                                  <pre className="my-2 overflow-x-auto rounded-lg bg-[#1e1e1e] p-3 text-sm">
                                    {children}
                                  </pre>
                                ),
                                code: ({ className, children, ...props }) =>
                                  className ? (
                                    <code
                                      className={className}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <code
                                      className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            msg.content
                          )}
                        </motion.div>
                      ))}
                      <div ref={bottomRef} />
                      {messages.length === 0 && (
                        <p className="text-[11px] text-white/45">
                          Ask anything about your day, your code, or a new
                          idea. Fancy AI responds instantly with streaming
                          answers.
                        </p>
                      )}
                    </div>
                </div>
              )}

              {/* Image view */}
              {mode === "image" && (
                <>
                  <div className="mb-3 grid h-[420px] grid-cols-2 gap-2 overflow-y-auto rounded-2xl bg-white/3 p-2 md:h-[520px]">
                    {images.length === 0 && !imageError && (
                      <div className="col-span-2 flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 text-[11px] text-white/55">
                        Describe a scene and we&apos;ll bring it to life in
                        seconds.
                      </div>
                    )}
                    {imageError && (
                      <div className="col-span-2 flex items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {imageError}
                      </div>
                    )}
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="h-32 w-full rounded-xl object-cover md:h-40"
                        alt="Generated"
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Input controls */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-[#b75cff] focus:outline-none"
placeholder={
                    mode === "image"
                      ? "Generate a stunning image of..."
                      : "Ask anything..."
                  }
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (imageError) setImageError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      mode === "image" ? generateImage() : sendMessage();
                    }
                  }}
                />
                <button
                  onClick={mode === "image" ? generateImage : sendMessage}
                  disabled={loading}
                  className="flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] px-4 text-xs font-semibold text-white shadow-lg shadow-purple-500/40 disabled:opacity-60"
                >
                  {loading ? "…" : "Send"}
                </button>
                <button
                  onClick={startVoice}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg"
                  aria-label="Start voice input"
                >
                  🎙
                </button>
              </div>

              <p className="mt-2 text-[10px] text-white/40">
                Powered by streaming responses for ultra-fast feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key advantages */}
      <section
        id="features"
        className="border-b border-white/10 bg-[#050014] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white lg:text-3xl">
                Key advantages of Fancy AI
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/60">
                A single workspace that understands natural language, code, and
                visual ideas—so you can move from thought to result in seconds.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-5 shadow-lg shadow-black/40">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#bda4ff]">
                Conversational clarity
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">
                Remembered context for deeper chats
              </h3>
              <p className="mt-2 text-xs text-white/65">
                Fancy AI keeps track of your ongoing questions, follow-ups, and
                corrections, so every reply feels tailored to your flow.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#201046] via-[#29145a] to-[#1a0d3a] p-5 shadow-lg shadow-black/50">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#ffcfef]">
                Developer-grade coding
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">
                Code assistance that feels senior-level
              </h3>
              <p className="mt-2 text-xs text-white/70">
                Switch into code mode to debug, refactor, or scaffold features
                in your stack—backed by real-time explanations.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-5 shadow-lg shadow-black/40">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#ffd1ff]">
                Visual imagination
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">
                One prompt, vivid visuals
              </h3>
              <p className="mt-2 text-xs text-white/65">
                Generate high-quality images directly from your ideas, whether
                you are designing products, stories, or social content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities / cards */}
      <section
        id="capabilities"
        className="border-b border-white/10 bg-gradient-to-b from-[#050014] to-[#07001c] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">
              Revolutionary power & capabilities
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-white/60">
              Built to handle everything from morning planning and emails to
              production-grade code reviews and creative experiments.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7b5ff]">
                Daily life copilot
              </p>
              <p className="mt-2 text-xs text-white/70">
                Draft messages, plan trips, organize tasks, or get quick
                summaries—Fancy AI helps you make cleaner decisions, faster.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-tr from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] p-5 text-left shadow-xl shadow-purple-500/50">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                Engineering partner
              </p>
              <p className="mt-2 text-xs text-white/90">
                Debug stack traces, understand legacy code, and explore new
                frameworks with streaming guidance built into your workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd7ff]">
                Creative studio
              </p>
              <p className="mt-2 text-xs text-white/70">
                Move from a spark of an idea to polished copy, visuals, and
                prompts in a few minutes instead of a few hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="bg-[#050014] pb-12 pt-10 lg:pb-16 lg:pt-14"
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mb-6 text-center lg:mb-8">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Everything you need to know before getting started with Fancy AI.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            {[
              {
                q: "Do I need a credit card to start?",
                a: "No. You can start on the free plan with no payment details required.",
              },
              {
                q: "Can Fancy AI write and debug my code?",
                a: "Yes. Switch into code mode for targeted help, explanations, refactors, and debugging sessions.",
              },
              {
                q: "How does image generation work?",
                a: "Describe the scene you imagine and Fancy AI generates an image using advanced generative models.",
              },
              {
                q: "Is my data private?",
                a: "We never use your private conversations or code to train shared models, and you remain in control of what you store.",
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-white/10 bg-white/3 px-4 py-3"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-white/90">
                  <span>{item.q}</span>
                  <span className="ml-4 text-xs text-white/50 group-open:hidden">
                    +
                  </span>
                  <span className="ml-4 hidden text-xs text-white/50 group-open:block">
                    —
                  </span>
                </summary>
                <p className="mt-2 text-xs text-white/65">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040013] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-[11px] text-white/45 sm:flex-row lg:px-6">
          <p>© {new Date().getFullYear()} Fancy AI. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-white/80">Privacy</button>
            <button className="hover:text-white/80">Terms</button>
            <button className="hover:text-white/80">Support</button>
          </div>
        </div>
      </footer>
    </main>
  );
}
