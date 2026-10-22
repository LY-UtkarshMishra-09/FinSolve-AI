"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

function ShieldCheckIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function UserIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MonitorIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export default function PortalLauncher() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Quick health probe to FastAPI backend
    fetch("http://127.0.0.1:8000/api/supervisor/queue")
      .then((res) => {
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="h-16 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Paytm Sentinel
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-mono">
                DisputeX v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Autonomous Financial Dispute Resolution & Guardrail Engine</p>
          </div>
        </div>

        {/* Global Status Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  backendOnline === true ? "bg-emerald-400" : backendOnline === false ? "bg-rose-400" : "bg-amber-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline === true ? "bg-emerald-500" : backendOnline === false ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-zinc-400">
              FastAPI 8000:{" "}
              <strong
                className={
                  backendOnline === true ? "text-emerald-400" : backendOnline === false ? "text-rose-400" : "text-amber-400"
                }
              >
                {backendOnline === true ? "ONLINE" : backendOnline === false ? "OFFLINE" : "CHECKING"}
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center relative z-10">
        <div className="text-center max-w-3xl space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium shadow-inner">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual-Debit Trace & Instant Settlement Framework</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Select Your Dispute Resolution Portal
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Experience end-to-end UPI dispute settlement. Customers submit claims with receipt OCR verification, while supervisors audit real-time guardrail telemetry and manage escalation queues.
          </p>
        </div>

        {/* Two Major Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Card 1: Customer Grievance Portal */}
          <div className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-cyan-500/60 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:shadow-cyan-950/30">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50 group-hover:scale-110 transition-transform">
                <UserIcon className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Customer Experience
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  Customer Grievance Portal
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Submit disputed UPI transactions, upload debit SMS & receipts for Groq Vision OCR, and receive instant automated T+0 reversals without internal metrics clutter.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  ⚡ Instant Vision OCR
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  🔍 Dual-Debit Trace
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  📜 RBI DPSS Compliant
                </span>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-zinc-800/80">
              <Link
                href="/customer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition-all group-hover:translate-x-0.5 active:scale-95"
              >
                <span>Launch Customer Portal</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Supervisor Operations Dashboard */}
          <div className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-indigo-500/60 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:shadow-indigo-950/30">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-950/50 group-hover:scale-110 transition-transform">
                <MonitorIcon className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Operations & Compliance
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                  Supervisor Operations Hub
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Monitor live guardrail confidence, forensic fraud risk scores, inspect parsed switch telemetry, and authorize or reject manual escalations in real-time with automated sync.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  📡 Real-Time Auto-Poll
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  🛡️ Forensic Risk Scores
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  ⚖️ Action Escalation Hub
                </span>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-zinc-800/80">
              <Link
                href="/supervisor"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all group-hover:translate-x-0.5 active:scale-95"
              >
                <span>Launch Supervisor Dashboard</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer specs */}
        <div className="mt-16 text-center text-xs text-zinc-500 space-y-1">
          <p>Paytm Sentinel DisputeX Engine &bull; Built with Next.js 14, Tailwind CSS & FastAPI</p>
          <p className="text-[11px] text-zinc-600 font-mono">
            Vision OCR: Groq Vision (Qwen 27B) &bull; Core Ledger: NPCI Switch U19 Discrepancy Analyzer
          </p>
        </div>
      </main>
    </div>
  );
}
