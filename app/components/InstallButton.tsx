"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InstallButton() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  if (!prompt) {
    // If no install prompt, just navigate to chat
    return (
      <Link
        href="/chat"
        className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] border-transparent text-white hover:opacity-90 cursor-pointer"
      >
        🚀 Launch App
      </Link>
    );
  }

  return (
    <button
      onClick={installApp}
      className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] border-transparent text-white hover:opacity-90 cursor-pointer"
    >
      🚀 Launch App
    </button>
  );
}
