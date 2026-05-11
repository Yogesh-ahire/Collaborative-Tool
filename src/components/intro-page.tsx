"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, FileText, Database, Network, Cpu, ArrowRight, PieChart, 
  MousePointer2, SearchCode, XIcon, Sparkles, History, Brain,
  Link, MessageSquare // Added for new features
} from "lucide-react";

export const IntroPage = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden font-sans">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/DoczFlow-logo.svg" alt="DoczFlow Logo" width={28} height={28} className="drop-shadow-sm" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800 dark:text-white">
            Docz<span className="text-blue-600">Flow</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 transition cursor-pointer">Features</a>
          <a href="#architecture" onClick={(e) => scrollToSection(e, "architecture")} className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 transition cursor-pointer">Architecture</a>
          <button onClick={() => setShowSignIn(true)} className="text-xs sm:text-sm font-bold text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 transition">Sign In</button>
        </div>
      </nav>

      {/* HERO SECTION - FOCUS: COLLABORATION & RAG AI */}
      <section className="relative w-full min-h-[85vh] flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 md:px-12 lg:px-20 py-12 overflow-hidden gap-12">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold border border-blue-200">
            <Users className="size-3.5" />
            <span>Real-time Team Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            Collaborative Editing <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Empowered by AI.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
            DoczFlow combines CRDT-based multi-user sync with a grounded AI assistant. Write together seamlessly, track granular history, and let AI analyze your context.
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
              { title: "Live Sync:", text: "Zero-latency cursors, presence & thread comments." },
              { title: "RAG AI Chat:", text: "Ask questions & summarize based on document context." },
              { title: "Seamless Sharing:", text: "Instant live read-only links for external guests." },
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

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onClick={() => setShowSignIn(true)} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              Launch Workspace <ArrowRight className="size-5" />
            </button>
          </div>
        </motion.div>

        {/* HERO VISUAL - REALTIME & AI MOCKUP */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative w-full max-w-md lg:w-[480px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden">
           <div className="flex gap-2 items-center border-b pb-4 mb-4">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
              <span className="text-[10px] text-gray-400 font-mono ml-2">document_sync_active</span>
           </div>
           <div className="space-y-3">
              <div className="h-3 w-3/4 bg-blue-50 rounded" />
              <div className="relative h-10 w-full border-l-4 border-purple-500 bg-purple-50/30 flex items-center px-3">
                <p className="text-[11px] text-purple-600 font-medium italic"><Sparkles className="size-3 inline mr-1" /> AI is fetching context via Vector Search...</p>
              </div>
              <div className="h-3 w-5/6 bg-gray-50 rounded" />
              <div className="flex items-center gap-2 mt-4">
                <MousePointer2 className="text-blue-500 fill-current size-4" />
                <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded">Yogesh</span>
                <div className="h-3 w-20 bg-blue-100 rounded" />
              </div>
           </div>
        </motion.div>
      </section>

       {/* HOW IT WORKS (ARCHITECTURE SECTION) */}
      <section id="architecture" className="px-4 sm:px-6 py-16 sm:py-24 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 scroll-mt-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
            The Engine <span className="text-blue-600">Under The Hood</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-10 sm:mb-16 max-w-2xl mx-auto px-4">
            DoczFlow isn&apos;t just a text area. It&apos;s a distributed reactive system designed for high-concurrency editing and AI vector processing.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 -z-10 shadow-sm"></div>

            <StepCard 
              number="01"
              icon={<Network className="size-6 sm:size-8 text-blue-500" />}
              title="CRDT Sync Layer"
              desc="Tiptap captures structured edits locally while Liveblocks instantly syncs cursors, presence, and deltas across peers."
            />
            <StepCard 
              number="02"
              icon={<Database className="size-6 sm:size-8 text-purple-500" />}
              title="State & Workspaces"
              desc="Convex acts as the reactive source of truth, managing debounced snapshots, diffs, and separate organization accounts."
            />
            <StepCard 
              number="03"
              icon={<Cpu className="size-6 sm:size-8 text-indigo-500" />}
              title="RAG AI Pipeline"
              desc="AST content is vectorized and fed to LLMs for token-optimized contextual Q&A, summarization, and grammar fixes."
            />
          </div>
        </div>
      </section>

       {/* FEATURES SECTION - UPDATED WITH FINAL FEATURE LIST */}
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
              title="RAG AI Chat Assistant"
              desc="Chat with your document. Ask context-aware questions, summarize content, or generate new sections based on data."
            />
            <FeatureCard
              icon={<History className="size-5 sm:size-6" />}
              title="Advanced Versioning"
              desc="Never lose work with automatic diff-based history tracking and manual snapshot capabilities."
            />
            <FeatureCard
              icon={<Sparkles className="size-5 sm:size-6" />}
              title="Inline Editor Actions"
              desc="Select text and instantly trigger AI to fix grammar, change tone, or translate. Native local image upload included."
            />
            <FeatureCard
              icon={<Link className="size-5 sm:size-6" />}
              title="Live Read-Only Sharing"
              desc="Share real-time document links securely with external users without requiring them to create a DoczFlow account."
            />
            <FeatureCard
              icon={<MessageSquare className="size-5 sm:size-6" />}
              title="Workspaces & Threads"
              desc="Separate personal and organizational accounts. Attach threaded comments directly to specific document sections."
            />
          </div>
        </div>
      </section>

      {/* NEW SECTION: DOCUMENT INSIGHTS (View & Analytics) */}
      <section className="py-24 px-4 sm:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Deep Transparency</h3>
            <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight">Analytics that go beyond <br/> text editing.</h2>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="shrink-0 bg-blue-50 p-3 rounded-xl text-blue-600"><PieChart className="size-6" /></div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Contribution Tracking</p>
                    <p className="text-sm text-gray-500">Visualize user impact with real-time volume share charts derived from Yjs CRDT history.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="shrink-0 bg-purple-50 p-3 rounded-xl text-purple-600"><SearchCode className="size-6" /></div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">CRDT Node Inspection</p>
                    <p className="text-sm text-gray-500">Inspect the raw binary operation stream. Audit the 100 most recent operations seamlessly.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="shrink-0 bg-orange-50 p-3 rounded-xl text-orange-600"><FileText className="size-6" /></div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Docx & Print View</p>
                    <p className="text-sm text-gray-500">Import/Export standard DOCX files. Switch to paginated view to see visual page structures.</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 font-mono text-[10px] text-emerald-400">
             <div className="flex justify-between border-b border-slate-800 pb-3 mb-3 text-slate-500">
               <span>OPERATION_STREAM</span>
               <span>v2.4.0</span>
             </div>
             <p>{"{"}</p>
             <p className="pl-4">&ldquo;clientId&rdquo;: &ldquo;5326&rdquo;,</p>
             <p className="pl-4">&ldquo;clock&rdquo;: 1293,</p>
             <p className="pl-4">&ldquo;content&rdquo;: &ldquo;Optimizing collaboration metrics...&rdquo;,</p>
             <p className="pl-4">&ldquo;type&rdquo;: &ldquo;insert&rdquo;</p>
             <p>{"}"}</p>
             <p className="mt-4 text-slate-500 italic">{"// Causal ordering resolved successfully"}</p>
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
        <p className="text-[10px] sm:text-xs mt-1">Built with Next.js, Convex, Pinecone, Tiptap, Groq & Liveblocks</p>
      </footer>

      {/* SIGN IN MODAL */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl relative w-full max-w-md border dark:border-gray-800">
              <button onClick={() => setShowSignIn(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"><XIcon className="size-6"/></button>
              <div className="mb-8 text-center">
                 <Image src="/DoczFlow-logo.svg" alt="DoczFlow" width={48} height={48} className="mx-auto mb-4" />
                 <h2 className="text-2xl font-bold tracking-tight">Access DoczFlow</h2>
                 <p className="text-sm text-gray-500 mt-2">Sign in to start creating together</p>
              </div>
              <SignIn routing="hash" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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