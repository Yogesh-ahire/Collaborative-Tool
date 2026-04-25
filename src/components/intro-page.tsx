"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, FileText, Brain, History, Database, Network, Cpu, ArrowRight } from "lucide-react";

export const IntroPage = () => {
  // State to toggle the SignIn component
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/DoczFlow-logo.svg"
            alt="DoczFlow Logo"
            width={28}
            height={28}
            className="drop-shadow-sm sm:w-8 sm:h-8"
          />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Docz<span className="text-blue-600 dark:text-blue-400">Flow</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <a 
            href="#features" 
            onClick={(e) => scrollToSection(e, "features")}
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition cursor-pointer"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, "how-it-works")}
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition cursor-pointer"
          >
            Architecture
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 md:px-12 lg:px-20 py-12 sm:py-20 overflow-hidden gap-12 lg:gap-0">
        
        {/* Background Glow Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 lg:top-20 left-4 lg:left-10 w-48 lg:w-72 h-48 lg:h-72 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute bottom-10 lg:bottom-20 right-4 lg:right-10 w-56 lg:w-80 h-56 lg:h-80 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"
          />
        </div>

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 sm:gap-6 max-w-2xl lg:max-w-xl z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium mb-2 border border-blue-200 dark:border-blue-800 shadow-sm">
            <Sparkles className="size-3 sm:size-4" />
            <span>AI-Powered Real-time Editor</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            The Future of <br className="hidden sm:block lg:hidden xl:block" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
              Collaborative Writing
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed px-2 sm:px-0">
            Write, edit, and collaborate with your team instantly. Powered by CRDT engine and enhanced by Context-Aware AI.
          </p>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-md text-left mt-2 sm:mt-4 w-full sm:w-auto"
          >
            {[
              { title: "Live Sync:", text: "Zero-latency multi-user editing." },
              { title: "Diff Versioning:", text: "Automatic delta-based history tracking." },
              { title: "AI Assistant:", text: "Grammar, tone, and context generation." },
            ].map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-start gap-2"
              >
                <div className="mt-1.5 size-1.5 sm:size-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <p>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.title}</span> {item.text}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right Content (Dynamic Box: Button -> SignIn) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full sm:max-w-md lg:w-[450px] z-10 flex flex-col items-center justify-center min-h-[400px]"
        >
          <AnimatePresence mode="wait">
            {!showSignIn ? (
              <motion.div
                key="get-started-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 w-full"
              >
                <button
                  onClick={() => setShowSignIn(true)}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-3/4 sm:w-auto text-white font-bold text-lg rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="relative z-10 size-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">Join the workspace instantly.</p>
              </motion.div>
            ) : (
              <motion.div
                key="signin-component"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4 }}
                className="p-4 sm:p-6 md:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-gray-700/60 w-full"
              >
                <SignIn
                  routing="hash"
                  appearance={{
                    elements: {
                      card: "shadow-none border-none bg-transparent w-full p-0 sm:p-auto",
                      headerTitle: "text-lg sm:text-xl font-bold",
                      headerSubtitle: "text-xs sm:text-sm text-gray-500 dark:text-gray-400",
                      formFieldLabel: "text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300",
                      socialButtonsBlockButton: "rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm",
                      footerActionText: "text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center",
                      footerActionLink: "text-blue-600 dark:text-blue-400 hover:underline font-medium",
                    },
                  }}
                />
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                    Secured by Clerk
                  </p>
                  <button 
                    onClick={() => setShowSignIn(false)}
                    className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* HOW IT WORKS (ARCHITECTURE SECTION) */}
      <section id="how-it-works" className="px-4 sm:px-6 py-16 sm:py-24 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 scroll-mt-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
            The Engine <span className="text-blue-600">Under The Hood</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-10 sm:mb-16 max-w-2xl mx-auto px-4">
            DoczFlow isn&apos;t just a text area. It&apos;s a distributed reactive system designed for high-concurrency editing and AI processing.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 -z-10 shadow-sm"></div>

            <StepCard 
              number="01"
              icon={<Network className="size-6 sm:size-8 text-blue-500" />}
              title="Client Layer"
              desc="Tiptap captures structured AST edits locally while Liveblocks instantly syncs cursors and deltas across connected peers via WebSockets."
            />
            <StepCard 
              number="02"
              icon={<Database className="size-6 sm:size-8 text-purple-500" />}
              title="State & Persistence"
              desc="Convex DB acts as the reactive single source of truth, managing debounced snapshots and user identity secured by Clerk."
            />
            <StepCard 
              number="03"
              icon={<Cpu className="size-6 sm:size-8 text-indigo-500" />}
              title="Intelligence Layer"
              desc="The JSON AST is parsed and fed into LLMs (Groq) for lightning-fast context extraction, grammar correction, and generation."
            />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-4 sm:px-6 py-16 sm:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 scroll-mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 sm:mb-16 tracking-tight">
            Engineered for <span className="text-blue-600">Performance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 text-left">
            <FeatureCard
              icon={<Users className="size-5 sm:size-6" />}
              title="Real-time Collaboration"
              desc="Work together with live cursors, presence indicators, and exact delta merging without data loss."
            />
            <FeatureCard
              icon={<Brain className="size-5 sm:size-6" />}
              title="Agentic AI Layer"
              desc="Generate, summarize, rewrite, and improve your content strictly within the document's context."
            />
            <FeatureCard
              icon={<FileText className="size-5 sm:size-6" />}
              title="Structured AST Storage"
              desc="Underlying architecture runs on ProseMirror JSON trees, not just raw messy HTML strings."
            />
            <FeatureCard
              icon={<History className="size-5 sm:size-6" />}
              title="Smart Versioning"
              desc="Debounced auto-snapshots and manual commits ensure your history is both clean and complete."
            />
            <FeatureCard
              icon={<Sparkles className="size-5 sm:size-6" />}
              title="Inline AI Actions"
              desc="Select text and instantly trigger AI to fix grammar, change tone, or translate—retaining formatting."
            />
            <FeatureCard
              icon={<FileText className="size-5 sm:size-6" />}
              title="DOCX Interoperability"
              desc="Seamlessly import and export traditional Word documents directly into the collaborative stream."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 py-8 sm:py-10 bg-gray-50 dark:bg-gray-950 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center border-t border-gray-200 dark:border-gray-800">
        <Image
          src="/DoczFlow-logo.svg"
          alt="DoczFlow Logo"
          width={24}
          height={24}
          className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300 mb-3"
        />
        <p>© {new Date().getFullYear()} DoczFlow - AI Powered Collaborative Ecosystem.</p>
        <p className="text-[10px] sm:text-xs mt-1">Built with Next.js, Convex, Tiptap, Groq & Liveblocks</p>
      </footer>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 sm:p-8 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-start">
    <div className="mb-4 sm:mb-5 inline-flex p-2.5 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 shadow-sm transition-transform">
      {icon}
    </div>
    <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm">{desc}</p>
  </div>
);

const StepCard = ({ number, icon, title, desc }: { number: string, icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 sm:p-8 border border-gray-100 dark:border-gray-700 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-md relative z-10 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all text-center">
    <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-4xl sm:text-5xl font-black text-gray-100 dark:text-gray-700/50 -z-10 select-none drop-shadow-sm">
      {number}
    </div>
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-inner">
      {icon}
    </div>
    <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
  </div>
);