"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    // Detect if already installed (desktop)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert(
        "App is already installed or not available for installation yet."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <button
        disabled
        className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium bg-green-500 text-white cursor-default"
      >
        ✅ Installed
      </button>
    );
  }

  return (
    <button
      onClick={installApp}
      className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#7b5cff] to-[#ff8fd1] text-white"
    >
      🚀 Install App
    </button>
  );
}
