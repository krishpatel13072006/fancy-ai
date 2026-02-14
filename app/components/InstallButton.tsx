"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      return;
    }

    const handler = (e: any) => {
      console.log('Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsReady(true);
    };

    const readyHandler = () => {
      console.log('App is ready for installation');
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", readyHandler);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", readyHandler);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    if (deferredPrompt) {
      e.preventDefault();
      console.log('Showing install prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      if (outcome === 'accepted') {
        console.log('App installed successfully');
      }
      setDeferredPrompt(null);
      return;
    }
    // If no install prompt, Link will navigate normally
    console.log('No install prompt available, navigating to chat');
  };

  return (
    <Link
      href="/chat"
      onClick={handleClick}
      className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] border-transparent text-white hover:opacity-90 cursor-pointer"
    >
      🚀 Launch App
    </Link>
  );
}
