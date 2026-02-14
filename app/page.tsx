"use client";

import { useState } from "react";
import Link from "next/link";
import InstallButton from "./components/InstallButton";

export default function Home() {
  const [isDark, setIsDark] = useState(true);

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
  const textPrimary = isDark ? "text-white/90" : "text-gray-800";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const textTertiary = isDark ? "text-white/65" : "text-gray-500";
  const textWhite = isDark ? "text-white" : "text-gray-900";
  const featureBorder = isDark ? "border-white/10" : "border-gray-200";
  const footerText = isDark ? "text-white/45" : "text-gray-400";

  return (
    <main className={`min-h-screen ${bgMain} ${textPrimary}`}>
      {/* Top nav */}
      <header className={`border-b ${headerBg} backdrop-blur-xl`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 sm:px-4 py-3 sm:py-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7b5cff] to-[#ff8fd1] text-xs font-semibold shadow-lg shadow-purple-600/60 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              AI
            </div>
            <span className={`text-sm font-semibold tracking-wide ${textPrimary}`}>
              Fancy AI
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-full p-2 text-sm ${isDark ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <InstallButton />
          </div>
        </div>
      </header>

      {/* Hero + Spline 3D Robot */}
      <section className={`relative overflow-hidden border-b ${isDark ? 'border-white/10' : 'border-gray-200'} ${bgSection}`}>
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-40 top-[-10%] h-64 w-64 rounded-full bg-purple-500/40 blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-72 w-72 rounded-full bg-pink-500/30 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col-reverse gap-6 sm:gap-10 px-3 sm:px-5 py-8 sm:py-10 md:px-5 md:py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-6 lg:py-20">
          {/* Hero text */}
          <div className="max-w-xl space-y-6 lg:flex-[0.4]">
            <p className={`inline-flex items-center gap-2 rounded-full border ${isDark ? 'border-white/15 bg-white/5' : 'border-gray-300 bg-gray-100'} px-3 py-1 text-[10px] font-medium tracking-wide ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Smart AI for your everyday needs
            </p>
            <h1 className={`text-3xl font-semibold leading-tight ${textWhite} sm:text-4xl lg:text-5xl`}>
              Effortless chat,{" "}
              <span className="bg-gradient-to-r from-[#b75cff] to-[#ff8fd1] bg-clip-text text-transparent">
                code
              </span>{" "}
              and images in one beautiful workspace.
            </h1>
            <p className={`text-sm leading-relaxed ${textTertiary} lg:text-base`}>
              Fancy AI combines conversational intelligence, expert-grade coding
              help, and vivid image generation into a single, fluid interface.
              Talk to it, build with it, or visualize ideas in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link href="/chat" className="rounded-full bg-gradient-to-r from-[#7b5cff] via-[#b75cff] to-[#ff8fd1] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-lg shadow-purple-500/50 hover:brightness-110 hover:scale-105 transition-all duration-300">
                Get Started
              </Link>
            </div>

            <div className={`flex flex-wrap gap-4 sm:gap-6 pt-3 sm:pt-5 text-[11px] ${textSecondary}`}>
              <div className="min-w-[80px]">
                <p className={`text-sm font-semibold ${textWhite}`}>99.9% uptime</p>
                <p className={textSecondary}>Enterprise-grade reliability</p>
              </div>
              <div>
                <p className={`text-sm font-semibold ${textWhite}`}>50k+</p>
                <p className={textSecondary}>Queries served every day</p>
              </div>
              <div>
                <p className={`text-sm font-semibold ${textWhite}`}>Instant</p>
                <p className={textSecondary}>Streaming responses</p>
              </div>
            </div>
          </div>

          {/* Spline 3D Animation */}
          <div className="w-full flex-1 lg:flex-[0.6]">
            <div className="h-[200px] w-full rounded-2xl overflow-hidden sm:h-[250px] md:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[500px]">
              <iframe 
                src='https://my.spline.design/circularparticleanimation-aujyrW7HyuULg05xMUEfmkgB/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title='3D Animation'
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key advantages */}
      <section
        id="features"
        className={`border-b ${isDark ? 'border-white/10 bg-[#050014]' : 'border-gray-200 bg-gray-50'} py-10 sm:py-12 lg:py-16`}
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className={`text-2xl font-semibold ${textWhite} lg:text-3xl`}>
                Key advantages of Fancy AI
              </h2>
              <p className={`mt-2 max-w-xl text-sm ${textSecondary}`}>
                A single workspace that understands natural language, code, and
                visual ideas—so you can move from thought to result in seconds.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            <div className={`rounded-2xl border ${featureBorder} ${isDark ? 'bg-gradient-to-b from-white/8 to-white/3' : 'bg-white'} p-4 sm:p-5 ${isDark ? 'shadow-lg shadow-black/40' : 'shadow-lg shadow-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDark ? 'hover:shadow-purple-500/30' : 'hover:shadow-purple-300/40'} cursor-pointer group`}>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-[#bda4ff] group-hover:scale-110 transition-transform duration-300">
                Conversational clarity
              </p>
              <h3 className={`mt-2 text-sm font-semibold ${textWhite}`}>
                Remembered context for deeper chats
              </h3>
              <p className={`mt-2 text-xs ${textSecondary}`}>
                Fancy AI keeps track of your ongoing questions, follow-ups, and
                corrections, so every reply feels tailored to your flow.
              </p>
            </div>

            <div className={`rounded-2xl border ${featureBorder} ${isDark ? 'bg-gradient-to-b from-[#201046] via-[#29145a] to-[#1a0d3a]' : 'bg-white'} p-5 ${isDark ? 'shadow-lg shadow-black/50' : 'shadow-lg shadow-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDark ? 'hover:shadow-purple-500/30' : 'hover:shadow-purple-300/40'} cursor-pointer group`}>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#ffcfef] group-hover:scale-110 transition-transform duration-300">
                Developer-grade coding
              </p>
              <h3 className={`mt-2 text-sm font-semibold ${textWhite}`}>
                Code assistance that feels senior-level
              </h3>
              <p className={`mt-2 text-xs ${textSecondary}`}>
                Switch into code mode to debug, refactor, or scaffold features
                in your stack—backed by real-time explanations.
              </p>
            </div>

            <div className={`rounded-2xl border ${featureBorder} ${isDark ? 'bg-gradient-to-b from-white/8 to-white/3' : 'bg-white'} p-5 ${isDark ? 'shadow-lg shadow-black/40' : 'shadow-lg shadow-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDark ? 'hover:shadow-purple-500/30' : 'hover:shadow-purple-300/40'} cursor-pointer group`}>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#ffd1ff] group-hover:scale-110 transition-transform duration-300">
                Visual imagination
              </p>
              <h3 className={`mt-2 text-sm font-semibold ${textWhite}`}>
                One prompt, vivid visuals
              </h3>
              <p className={`mt-2 text-xs ${textSecondary}`}>
                Generate high-quality images directly from your ideas, whether
                you are designing products, stories, or social content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className={`${isDark ? 'bg-[#050014]' : 'bg-gray-50'} pb-8 sm:pb-12 pt-8 sm:pt-10 lg:pb-16 lg:pt-14`}
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <div className="mb-6 text-center lg:mb-8">
            <h2 className={`text-2xl font-semibold ${textWhite} lg:text-3xl`}>
              Frequently asked questions
            </h2>
            <p className={`mt-2 text-sm ${textSecondary}`}>
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
                className={`group rounded-2xl border ${featureBorder} ${isDark ? 'bg-white/3' : 'bg-white'} px-4 py-3 transition-all duration-300 hover:shadow-lg ${isDark ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-200/40'} cursor-pointer`}
              >
                <summary className={`flex cursor-pointer items-center justify-between text-sm font-medium ${textPrimary}`}>
                  <span>{item.q}</span>
                  <span className={`ml-4 text-xs ${textSecondary} group-open:hidden`}>
                    +
                  </span>
                  <span className={`ml-4 hidden text-xs ${textSecondary} group-open:block`}>
                    —
                  </span>
                </summary>
                <p className={`mt-2 text-xs ${textSecondary}`}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-white/10 bg-[#040013]' : 'border-gray-200 bg-gray-50'} py-5 sm:py-6`}>
        <div className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 text-[10px] sm:text-[11px] ${footerText} sm:flex-row lg:px-6`}>
          <p>© {new Date().getFullYear()} Fancy AI. All rights reserved.</p>
          <div className="flex gap-4">
            <button className={`hover:${textWhite}`}>Privacy</button>
            <button className={`hover:${textWhite}`}>Terms</button>
            <button className={`hover:${textWhite}`}>Support</button>
          </div>
        </div>
      </footer>
    </main>
  );
}
