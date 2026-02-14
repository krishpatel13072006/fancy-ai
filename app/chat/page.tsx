"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Link from "next/link";

const emojiData = {
  smileys: ["😀","😃","😄","😁","😆","😂","🤣","😊","😍","😘"],
  gestures: ["👍","👎","👏","🙌","🙏","✌️","🤝","💪"],
  hearts: ["❤️","💖","💜","💙","💚","🖤","🤍"],
  tech: ["💻","📱","🖥️","⌨️","🧠","🤖","⚡"],
  celebration: ["🎉","🎊","🔥","✨","🌟","🚀"]
};

type Message = {
  role: "user" | "assistant";
  content: string;
  reaction?: string | null;
};

const quickSuggestions = [
  "Help me write a poem about technology",
  "Explain quantum computing simply",
  "Write a Python function to reverse a string",
  "Create a sunset image over mountains"
];

export default function Chat() {
  const [mode, setMode] = useState<"chat" | "image">("chat");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof emojiData>("smileys");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to load chat history');
      }
    }
    
    // Load images from localStorage
    const savedImages = localStorage.getItem('chatImages');
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (e) {
        console.error('Failed to load images');
      }
    }
    
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save images to localStorage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('chatImages', JSON.stringify(images));
    }
  }, [images]);

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
      if (res.ok && data?.imageUrl) {
        setImages((prev) => [data.imageUrl, ...prev]);
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

  const clearChatHistory = () => {
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatImages');
    setMessages([]);
    setImages([]);
  };

  const exportChat = (format: 'txt' | 'pdf') => {
    let content = '';
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      content += `${role}: ${msg.content}\n\n`;
    });
    
    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat-history.txt';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Simple text-based PDF-like export
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat-history.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const shareChat = async () => {
    if (messages.length === 0) {
      alert('No messages to share!');
      return;
    }
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check if it's an image (including GIF)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Add image as user message
          const userMessage: Message = { role: 'user', content: `![uploaded image](${result})` };
          setMessages((prev) => [...prev, userMessage]);
        };
        reader.readAsDataURL(file);
      } else {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setInput((prev) => prev + (prev ? '\n' : '') + text);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const addReaction = (index: number, emoji: string) => {
    setMessages((prev) => {
      const next = [...prev];
      if (next[index].reaction === emoji) {
        next[index].reaction = null;
      } else {
        next[index].reaction = emoji;
      }
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Dynamic styles based on theme
  const bgMain = isDark 
    ? "bg-gradient-to-b from-[#050014] via-[#070018] to-[#050014]" 
    : "bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50";
  const bgSection = isDark
    ? "bg-gradient-to-br from-[#0b0120] via-[#120533] to-[#050014]"
    : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100";
  const headerBg = isDark ? "bg-black/20" : "bg-white/80";
  const headerBorder = isDark ? "border-white/10" : "border-gray-200";
  const textPrimary = isDark ? "text-white/90" : "text-gray-800";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const chatBg = isDark ? "bg-white/3" : "bg-gray-100";
  const botMsgBg = isDark ? "bg-white/5" : "bg-gray-200";
  const inputBg = isDark ? "bg-black/60 border-white/15" : "bg-white border-gray-300";
  const inputText = isDark ? "text-white" : "text-gray-800";
  const inputPlaceholder = isDark ? "placeholder:text-white/35" : "placeholder:text-gray-400";
  const boxBorder = isDark ? "border-white/15" : "border-gray-300";
  const boxBg = isDark ? "bg-black/40" : "bg-white";
  const placeholderText = isDark ? "text-white/55" : "text-gray-500";
  const voiceBtnBg = isDark ? "bg-white/10" : "bg-gray-200";
  const footerText = isDark ? "text-white/40" : "text-gray-400";
  const toggleBg = isDark ? "bg-white/5" : "bg-gray-100";

  return (
    <main className={`min-h-screen w-full ${bgMain} text-white overflow-hidden`}>
      {/* Top nav */}
      <header className={`fixed top-0 left-0 right-0 z-40 border-b ${headerBg} backdrop-blur-xl`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-2 sm:px-4 py-2 sm:py-4 lg:px-6 relative z-50">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7b5cff] to-[#ff8fd1] text-[10px] sm:text-xs font-semibold shadow-lg shadow-purple-600/60">
              AI
            </div>
            <span className={`text-xs sm:text-sm font-semibold tracking-wide ${textPrimary}`}>
              Fancy AI
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`rounded-full border px-2 py-1 text-[10px] font-medium ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-200'} sm:hidden`}
            >
              ☰
            </button>
            {/* Desktop buttons */}
            <div className={`hidden sm:flex items-center gap-1 sm:gap-2`}>
              <button
                onClick={() => { setMessages([]); setImages([]); localStorage.removeItem('chatMessages'); localStorage.removeItem('chatImages'); }}
                className={`rounded-2xl border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-200'}`}
                title="New chat"
              >
                ✨ New
              </button>
              <button
                onClick={clearChatHistory}
                className={`rounded-2xl border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-200'}`}
                title="Clear chat history"
              >
                🗑️ Clear
              </button>
              <button
                onClick={() => exportChat('txt')}
                className={`rounded-2xl border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-200'}`}
                title="Export chat"
              >
                📥 Export
              </button>
              <button
                onClick={shareChat}
                className={`rounded-2xl border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-200'}`}
                title="Share chat"
              >
                📤 Share
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`rounded-2xl border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-200'}`}
                title="Insert emoji"
              >
                😊 Emoji
              </button>
              {showEmojiPicker && (
                <div className={`absolute right-0 top-12 z-[200] w-56 sm:w-64 rounded-2xl border p-4 shadow-2xl ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'}`}>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {Object.keys(emojiData).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEmojiCategory(cat as keyof typeof emojiData)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition-all duration-300 hover:scale-105 ${emojiCategory === cat ? (isDark ? 'bg-gradient-to-r from-[#7b5cff] to-[#b75cff] text-white shadow-lg' : 'bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] text-white') : (isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100')}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {emojiData[emojiCategory].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => { insertEmoji(emoji); setShowEmojiPicker(false); }}
                        className={`rounded-xl p-2 text-xl transition-all duration-200 hover:scale-125 hover:bg-white/20`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={toggleTheme}
                className={`rounded-2xl p-2.5 text-lg transition-all duration-300 hover:scale-110 hover:shadow-lg ${isDark ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                aria-label="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setShowGuidelines(true)}
                className={`rounded-2xl p-2.5 text-lg transition-all duration-300 hover:scale-110 hover:shadow-lg ${isDark ? 'bg-white/10 text-green-400 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                aria-label="Guidelines"
              >
                📖
              </button>
              <Link
                href="/"
                className={`rounded-full border px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium ${isDark ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10' : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ← Home
              </Link>
            </div>
            {/* Mobile dropdown */}
            {showMobileMenu && (
              <div className={`absolute right-0 top-12 z-[200] w-56 sm:w-64 rounded-2xl border p-3 shadow-2xl ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'} sm:hidden`}>
                <button
                  onClick={() => { setMessages([]); setImages([]); localStorage.removeItem('chatMessages'); setShowMobileMenu(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  ✨ New Chat
                </button>
                <button
                  onClick={() => { clearChatHistory(); setShowMobileMenu(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  🗑️ Clear
                </button>
                <button
                  onClick={() => { exportChat('txt'); setShowMobileMenu(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  📥 Export
                </button>
                <button
                  onClick={() => { shareChat(); setShowMobileMenu(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  📤 Share
                </button>
                <button
                  onClick={() => { setShowGuidelines(true); setShowMobileMenu(false); }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  📖 Guidelines
                </button>
                <button
                  onClick={toggleTheme}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <Link
                  href="/"
                  className={`block rounded-xl px-3 py-2.5 text-xs transition-all duration-200 hover:scale-[1.02] ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  ← Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Share Modal - Outside header */}
      {showShareModal && messages.length > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className={`relative z-[200] w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-200'}`}>
            <h3 className={`mb-4 text-lg font-semibold ${textPrimary}`}>Share Chat</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const content = messages.map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`).join('\n\n');
                  copyToClipboard(content);
                  setShowShareModal(false);
                }}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <span className="text-lg">📋</span>
                <span className={`ml-2 text-sm ${textPrimary}`}>Copy to Clipboard</span>
              </button>
              <button
                onClick={() => {
                  const content = messages.map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`).join('\n\n');
                  const encoded = encodeURIComponent(content);
                  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
                  setShowShareModal(false);
                }}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <span className="text-lg">🐦</span>
                <span className={`ml-2 text-sm ${textPrimary}`}>Share on Twitter</span>
              </button>
              <button
                onClick={() => {
                  const content = messages.map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`).join('\n\n');
                  const encoded = encodeURIComponent(content);
                  window.open(`https://wa.me/?text=${encoded}`, '_blank');
                  setShowShareModal(false);
                }}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <span className="text-lg">💬</span>
                <span className={`ml-2 text-sm ${textPrimary}`}>Share on WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  const content = messages.map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`).join('\n\n');
                  const encoded = encodeURIComponent(content);
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank');
                  setShowShareModal(false);
                }}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <span className="text-lg">📘</span>
                <span className={`ml-2 text-sm ${textPrimary}`}>Share on Facebook</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className={`mt-4 w-full rounded-xl bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90`}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuidelines(false)} />
          <div className={`relative z-[200] max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl border p-5 shadow-2xl ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-200'}`}>
            <h3 className={`mb-4 text-xl font-bold ${textPrimary}`}>📖 Fancy AI Guidelines</h3>
            <div className="space-y-4">
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <span className={`font-medium ${textPrimary}`}>Chat</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Ask questions, get explanations, and have conversations with AI. Powered by Gemini for intelligent responses.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🖼️</span>
                  <span className={`font-medium ${textPrimary}`}>Image Generation</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Create stunning images from text descriptions. Uses advanced AI models like Flux and Imagen for high-quality results.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <span className={`font-medium ${textPrimary}`}>Emoji Support</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Express yourself with emojis! Tap the emoji button to insert emojis into your messages. Categories include smileys, animals, food, and more.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  <span className={`font-medium ${textPrimary}`}>Mobile Responsive</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Access Fancy AI from any device. The interface adapts to your screen size, providing the best experience on mobile, tablet, and desktop.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💾</span>
                  <span className={`font-medium ${textPrimary}`}>Local Storage</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Your chat history and images are saved locally in your browser. They persist across sessions and can be cleared anytime.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📤</span>
                  <span className={`font-medium ${textPrimary}`}>Export & Share</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Export your chat as text or share directly to Twitter, WhatsApp, and Facebook. Keep your conversations safe!</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌙</span>
                  <span className={`font-medium ${textPrimary}`}>Dark/Light Mode</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Toggle between dark and light themes. The interface automatically adapts to your preference for comfortable viewing.</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span className={`font-medium ${textPrimary}`}>New Chat</span>
                </div>
                <p className={`mt-1 text-xs ${textSecondary}`}>Start a fresh conversation anytime. Use the "New Chat" button to clear current messages and begin anew.</p>
              </div>
            </div>
            <button
              onClick={() => setShowGuidelines(false)}
              className={`mt-4 w-full rounded-xl bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat/Image Interface - Full screen */}
      <section className={`absolute top-14 left-0 right-0 bottom-0 w-full overflow-hidden ${bgSection}`}>
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-20 top-[-5%] h-48 w-48 rounded-full bg-purple-500/40 blur-3xl md:h-64 md:w-64 md:-left-40 md:top-[-10%]" />
          <div className="absolute right-[-5%] top-[5%] h-48 w-48 rounded-full bg-pink-500/30 blur-3xl md:h-72 md:w-72 md:right-[-10%] md:top-[10%]" />
        </div>

        <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden p-1 sm:p-3 md:p-4 lg:p-5">
          {/* Interactive AI panel */}
          <div className="flex flex-col h-full">
            <div className={`flex-1 min-h-0 flex flex-col rounded-2xl sm:rounded-3xl border ${boxBorder} glass-dark shadow-2xl p-2 sm:p-3 md:p-4 ${isDark ? 'shadow-purple-900/50' : 'shadow-gray-300/50'}`}>
              <div className="mb-2 sm:mb-3 flex items-center justify-between px-1 sm:px-0">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                </div>
                <div className={`flex items-center gap-1 rounded-2xl ${toggleBg} px-3 py-2 text-[10px] ${textSecondary}`}>
                  {["chat", "image"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m as "chat" | "image")}
                      className={`rounded-xl px-4 py-1.5 capitalize transition-all duration-300 ${
                        mode === m
                          ? "bg-gradient-to-r from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] text-[10px] font-semibold text-white shadow-lg shadow-purple-500/30 hover:scale-105"
                          : `text-[10px] ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} px-3`}
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat view */}
              {mode !== "image" && (
                <div 
                  className={`flex-1 min-h-0 overflow-y-auto rounded-xl sm:rounded-2xl glass p-1.5 sm:p-2 md:p-4`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="space-y-2 md:space-y-3">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`w-full max-w-[92%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl md:rounded-3xl px-3 md:px-4 py-2 md:py-3 leading-relaxed group ${msg.role === "user" ? "ml-auto bg-gradient-to-r from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] text-xs md:text-[13px] text-white shadow-lg shadow-purple-500/30" : `mr-auto ${botMsgBg} text-xs md:text-[13px] ${isDark ? 'text-white/90 glass' : 'text-gray-800 bg-white/80'}`}`}
                      >
                        <div className="flex items-start gap-2 overflow-hidden">
                          {msg.role === "assistant" && (
                            <>
                              <button
                                onClick={() => copyToClipboard(msg.content)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600'} mt-0.5 flex-shrink-0`}
                                title="Copy"
                              >
                                📋
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    const reactions = ['👍', '👎', '❤️', '😄', '🎉'];
                                    const currentIndex = reactions.indexOf(msg.reaction || '');
                                    const nextReaction = reactions[(currentIndex + 1) % reactions.length];
                                    addReaction(i, nextReaction);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-600'} mt-0.5 flex-shrink-0`}
                                  title="React"
                                >
                                  {msg.reaction || '😊'}
                                </button>
                              </div>
                            </>
                          )}
                          <div className="break-words overflow-hidden max-w-full">
                            {msg.role === "assistant" ? (
                                <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                  pre: ({ children }) => (
                                    <pre
                                      className="
                                        my-2
                                        w-full
                                        max-w-full
                                        overflow-x-auto
                                        rounded-xl
                                        bg-[#1e1e1e]
                                        p-2 sm:p-3
                                        text-[11px] sm:text-[12px] md:text-sm
                                        leading-relaxed
                                      "
                                    >
                                      {children}
                                    </pre>
                                  ),
                                  code: ({ className, children, ...props }) =>
                                    className ? (
                                      <code
                                        className={`${className} block whitespace-pre`}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    ) : (
                                      <code
                                        className="
                                          rounded
                                          bg-white/10
                                          px-1
                                          py-0.5
                                          font-mono
                                          text-[10px] sm:text-[11px]
                                        "
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
                            <span className={`text-[9px] block mt-1 opacity-50`}>
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={bottomRef} />
                    {loading && (
                      <div className={`mr-auto max-w-[80%] md:max-w-[70%] w-fit rounded-2xl md:rounded-3xl px-3 md:px-4 py-2 md:py-3 ${botMsgBg}`}>
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#7b5cff] to-[#b75cff] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#b75cff] to-[#ff8fd1] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#ff8fd1] to-[#7b5cff] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    {messages.length === 0 && (
                      <>
                        <p className={`text-[11px] ${placeholderText}`}>
                          Ask anything about your day, your code, or a new idea. Fancy AI responds instantly with streaming answers.
                        </p>
                        <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                          {quickSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInput(suggestion);
                                if (suggestion.toLowerCase().includes('image')) {
                                  setMode('image');
                                }
                              }}
                              className={`rounded-xl md:rounded-2xl border px-2 md:px-3 py-1.5 md:py-2 text-[9px] md:text-[10px] transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDark ? 'border-white/20 text-white/60 hover:bg-white/10 hover:text-white glass' : 'border-gray-300 text-gray-500 hover:bg-gray-200 hover:text-gray-700 bg-white/50'}`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Image view */}
              {mode === "image" && (
                <>
                  <div className={`flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 overflow-y-auto rounded-xl sm:rounded-2xl ${chatBg} p-2 sm:p-3 md:p-4`}>
                    {images.length === 0 && !imageError && (
                      <div className={`col-span-2 flex h-full flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-dashed ${isDark ? 'border-white/20 text-white/55' : 'border-gray-300 text-gray-400'} text-[11px] p-4`}>
                        Describe a scene and we'll bring it to life in seconds.
                      </div>
                    )}
                    {imageError && (
                      <div className="col-span-2 flex items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {imageError}
                      </div>
                    )}
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center bg-black/20">
                        <img 
                          src={img} 
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                          alt="Generated" 
                        />
                        <button
                          onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Delete image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Input controls */}
              <div className="flex items-center gap-2 mt-2 sm:mt-3 md:mt-4 px-1 sm:px-0">
                <textarea
                  className={`flex-1 min-h-[44px] max-h-32 rounded-xl sm:rounded-2xl border-2 ${inputBg} ${inputText} ${inputPlaceholder} px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none transition-all duration-300 ${isDark ? 'focus:border-[#b75cff] border-white/10' : 'focus:border-[#7b5cff] border-gray-200'} resize-none glass`}
                  placeholder={mode === "image" ? "Generate image..." : "Ask anything..."}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (imageError) setImageError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!loading && input.trim()) {
                        mode === "image" ? generateImage() : sendMessage();
                      }
                    }
                  }}
                />
                <button
                  onClick={mode === "image" ? generateImage : sendMessage}
                  disabled={loading}
                  className="flex h-9 sm:h-10 w-9 sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 transition-all duration-300 px-3 sm:px-4"
                >
                  {loading ? "⏳" : "➤"}
                </button>
                <button
                  onClick={startVoice}
                  className={`flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full text-sm sm:text-base ${voiceBtnBg}`}
                  aria-label="Start voice input"
                >
                  🎤
                </button>
              </div>
              {input.length > 0 && (
                <div className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'} mt-1 ml-1`}>
                  {input.length} chars
                </div>
              )}
              <p className={`mt-1 text-[9px] ${footerText} md:text-[10px] hidden sm:block`}>
                Powered by streaming responses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
