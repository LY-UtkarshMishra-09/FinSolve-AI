"use client";

import React, { useState, useEffect, useRef } from "react";

// Inline Lucide-style SVG Icons to guarantee zero external dependency issues
function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function PaperclipIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function SendIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TerminalIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function FileTextIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

interface Message {
  id: string;
  sender: "customer" | "ai" | "system";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
  };
}

interface ToolLog {
  id: string;
  timestamp: string;
  tool: string;
  status: "success" | "pending" | "warning";
  payload: string;
}

export default function DisputeXPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "customer",
      text: "Hi, I made a UPI payment of ₹2,450 at Starbucks Indiranagar yesterday. The amount was debited twice from my HDFC bank account, but the cashier only received one confirmation.",
      timestamp: "10:41 AM",
    },
    {
      id: "m-2",
      sender: "ai",
      text: "Hello! I am DisputeX AI Sentinel. I understand how frustrating dual debits can be. I have initiated a trace on your transaction ledger. Could you please share the screenshot or SMS receipt of the transaction to fast-track verification?",
      timestamp: "10:41 AM",
    },
    {
      id: "m-3",
      sender: "customer",
      text: "Sure, here is the screenshot from my Paytm Passbook showing both debits with the RRN.",
      timestamp: "10:42 AM",
      attachment: {
        name: "paytm_passbook_debit_ref_8923.png",
        size: "1.2 MB",
      },
    },
    {
      id: "m-4",
      sender: "ai",
      text: "Receipt received! Our Vision Guardrail OCR has verified RRN 402919829103. I can see the secondary charge of ₹2,450 timed out during NPCI settlement. I am escalating this with an Auto-Refund Recommendation to the Risk Supervisor.",
      timestamp: "10:42 AM",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [uploadedReceipt, setUploadedReceipt] = useState<{ name: string; size: string } | null>({
    name: "starbucks_upi_rrn_402919829103.png",
    size: "1.4 MB",
  });
  const [isTyping, setIsTyping] = useState(false);

  // Supervisor state
  const [claimStatus, setClaimStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live tool logs state
  const [logs, setLogs] = useState<ToolLog[]>([
    {
      id: "log-1",
      timestamp: "10:41:04",
      tool: "SENTINEL_INTENT_CLASSIFIER",
      status: "success",
      payload: "Intent: UPI_DOUBLE_DEBIT | Confidence: 0.992 | Urgency: HIGH",
    },
    {
      id: "log-2",
      timestamp: "10:41:07",
      tool: "CORE_BANKING_LEDGER_QUERY",
      status: "success",
      payload: "Account: *******4920 | Ledger Count: 2 debits of ₹2,450.00 within 42s",
    },
    {
      id: "log-3",
      timestamp: "10:42:15",
      tool: "OCR_VISION_EXTRACTOR_V3",
      status: "success",
      payload: "RRN Extracted: 402919829103 | Merchant VPA: starbucks.ind@hdfcbank",
    },
    {
      id: "log-4",
      timestamp: "10:42:18",
      tool: "NPCI_SWITCH_RECONCILIATION",
      status: "warning",
      payload: "Secondary Txn Status: U19_TIMED_OUT | Beneficiary Credit: FAILED",
    },
    {
      id: "log-5",
      timestamp: "10:42:22",
      tool: "POLICY_GUARDRAIL_EVALUATOR",
      status: "success",
      payload: "Dispute Policy #RBI-DPSS-2019-T+1 matched. Eligibility: 100% Instant Credit",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !uploadedReceipt) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text: inputMessage.trim() || "Uploaded updated transaction receipt.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: uploadedReceipt ? { ...uploadedReceipt } : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response & new tool logs
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "I have re-checked the latest telemetry with the NPCI switch. The telemetry reaffirms no merchant credit occurred for the duplicate transaction.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      const newLog: ToolLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: "SENTINEL_LIVE_TELEMETRY",
        status: "success",
        payload: "Re-verified merchant ledger at Starbucks IND-04. Zero capture detected.",
      };
      setLogs((prev) => [...prev, newLog]);
    }, 1500);
  };

  const handleApproveRefund = () => {
    setClaimStatus("approved");
    showToast("✅ Refund of ₹2,450.00 Approved & Dispatched via UPI-Direct.");
    const approvalLog: ToolLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      tool: "SUPERVISOR_ACTION_EXEC",
      status: "success",
      payload: "Supervisor override approved. Payout API invoked: REF_PAYTM_9921849120.",
    };
    setLogs((prev) => [...prev, approvalLog]);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: "⚡ SUPERVISOR OVERRIDE: Instant Refund of ₹2,450.00 approved and credited to HDFC Bank A/C ending in 4920. Reference: PAYTM-REV-8839210.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleRejectClaim = () => {
    setClaimStatus("rejected");
    showToast("❌ Claim Rejected. Reason: Manual Investigation Required.");
    const rejectionLog: ToolLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      tool: "SUPERVISOR_ACTION_EXEC",
      status: "warning",
      payload: "Claim #DISP-9024 marked for L2 manual banking grievance arbitration.",
    };
    setLogs((prev) => [...prev, rejectionLog]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/40 backdrop-blur-md animate-bounce">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
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

        {/* Global Badges */}
        <div className="hidden md:flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300">Guardrail Cluster: <strong className="text-emerald-400">NOMINAL</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono text-zinc-300">
            <span className="text-zinc-500">NPCI Latency:</span>
            <span className="text-cyan-400">28ms</span>
          </div>

          <div className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
            Hackathon Live Demo
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-4rem)] overflow-hidden">
        {/* ========================================== */}
        {/* VIEW A: LEFT PANEL - CUSTOMER CHAT INTERFACE */}
        {/* ========================================== */}
        <section className="lg:col-span-6 flex flex-col border-r border-zinc-800/80 bg-zinc-950/40 relative h-full">
          {/* Panel Header */}
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-cyan-400">
                  CX
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Customer Grievance Stream</h2>
                <p className="text-[11px] text-zinc-400">Aaditya V. (+91 98840-XXXXX) &bull; Verified UPI User</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/60">
                Ticket #DISP-9024
              </span>
            </div>
          </div>

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="my-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-700/40 text-xs text-indigo-300 flex items-start gap-2.5">
                    <ShieldCheckIcon className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{msg.text}</span>
                      <span className="block text-[10px] text-indigo-400/80 mt-1">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              }

              const isCustomer = msg.sender === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-500 px-1">
                    <span>{isCustomer ? "You (Customer)" : "DisputeX Sentinel AI"}</span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      isCustomer
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border border-indigo-500/40"
                        : "bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-zinc-800/80"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Attachment Preview Card if Present */}
                    {msg.attachment && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-400/30 flex items-center gap-2.5 bg-indigo-800/40 rounded-lg p-2 text-xs">
                        <FileTextIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <div className="truncate flex-1">
                          <p className="font-medium text-white truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] text-indigo-200">{msg.attachment.size} &bull; Image Attached</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                          OCR Scanned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs py-2 px-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span>Sentinel Guardrail is parsing ledger & generating rationale...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Receipt Mock Uploader Dropzone Banner */}
          <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/20">
            <div className="border border-dashed border-zinc-700 hover:border-indigo-500/70 transition-colors rounded-xl p-2.5 flex items-center justify-between text-xs bg-zinc-900/40">
              <div className="flex items-center gap-2.5 truncate">
                <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                  <PaperclipIcon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-zinc-300 font-medium truncate">
                    {uploadedReceipt ? uploadedReceipt.name : "Attach Passbook / Debit SMS Screenshot"}
                  </p>
                  <p className="text-[10px] text-zinc-500">Supported: PNG, JPEG, PDF up to 5MB (Simulated OCR)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (uploadedReceipt) {
                    setUploadedReceipt(null);
                  } else {
                    setUploadedReceipt({
                      name: "re-uploaded_debit_slip_hdfc.png",
                      size: "890 KB",
                    });
                  }
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium ml-2 flex-shrink-0"
              >
                {uploadedReceipt ? "Remove" : "Choose File"}
              </button>
            </div>
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask DisputeX about transaction status, RRN tracking, or policy..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center flex-shrink-0"
              title="Send Message"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* ============================================================== */}
        {/* VIEW B: RIGHT PANEL - SUPERVISOR & AI GUARDRAIL DASHBOARD */}
        {/* ============================================================== */}
        <section className="lg:col-span-6 flex flex-col bg-zinc-950/80 overflow-y-auto h-full">
          {/* Header Metric Strip */}
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Guardrail Confidence</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold text-emerald-400">98.4%</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">HIGH</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Fraud Risk Score</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold text-cyan-400">0.03</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">SAFE</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">SLA Target</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold text-indigo-400">&lt; 3 mins</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">T+0 Auto</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* 1. Parsed Receipt & Transaction Metadata Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Parsed Receipt & Switch Telemetry
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">OCR Engine: VisionGuard v3.2</span>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Transaction ID</span>
                    <p className="font-mono font-medium text-zinc-200 mt-0.5">PTM-TXN-882910</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Disputed Amount</span>
                    <p className="font-semibold text-emerald-400 text-sm mt-0.5">₹ 2,450.00</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Timestamp</span>
                    <p className="font-mono text-zinc-300 mt-0.5">2026-10-21 10:39:12</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">NPCI RRN</span>
                    <p className="font-mono text-cyan-300 mt-0.5 font-medium">402919829103</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Merchant</span>
                    <p className="font-medium text-zinc-300">Starbucks Coffee #Ind-04</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Payer Bank</span>
                    <p className="font-medium text-zinc-300">HDFC Bank (A/C **4920)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Switch Discrepancy</span>
                    <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      U19 Timed-Out (Zero Capture)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Escalation Queue & Decision Hub */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Escalation Queue & Supervisor Action Hub
                  </h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  1 Pending Dispute
                </span>
              </div>

              <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-zinc-100">Dispute #DISP-9024: Duplicate Charge Settlement</h4>
                      {claimStatus === "approved" && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                          APPROVED & CREDITED
                        </span>
                      )}
                      {claimStatus === "rejected" && (
                        <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                          REJECTED
                        </span>
                      )}
                      {claimStatus === "pending" && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      AI Policy Verdict: <span className="text-indigo-300 font-medium">Instant Auto-Reversal Eligible under RBI Circular RBI/2019-20/67</span>
                    </p>
                  </div>
                </div>

                {/* Supervisor Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={claimStatus === "approved"}
                    onClick={handleApproveRefund}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all shadow-lg ${
                      claimStatus === "approved"
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20 active:scale-95"
                    }`}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {claimStatus === "approved" ? "Refund Executed (₹2,450.00)" : "Approve Instant Refund (₹2,450)"}
                  </button>

                  <button
                    type="button"
                    disabled={claimStatus === "rejected"}
                    onClick={handleRejectClaim}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all border ${
                      claimStatus === "rejected"
                        ? "bg-zinc-800 text-zinc-500 border-zinc-700/50 cursor-not-allowed"
                        : "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/40 active:scale-95"
                    }`}
                  >
                    <XCircleIcon className="w-4 h-4 text-rose-400" />
                    Reject Claim
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      showToast("ℹ️ Requested Manual 3-Way Bank Reconciliation from HDFC Switch.");
                    }}
                    className="px-3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
                    title="Request Bank Intercept"
                  >
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Live Tool-Execution Log Feed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Live Tool-Execution & Guardrail Logs
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-mono text-zinc-400">Stream Active</span>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 font-mono text-xs overflow-hidden shadow-2xl">
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const statusColor =
                      log.status === "success"
                        ? "text-emerald-400 bg-emerald-950/50 border-emerald-800/30"
                        : log.status === "warning"
                        ? "text-amber-400 bg-amber-950/50 border-amber-800/30"
                        : "text-cyan-400 bg-cyan-950/50 border-cyan-800/30";

                    return (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/70 hover:border-zinc-700/80 transition-all flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">[{log.timestamp}]</span>
                            <span className="font-bold text-zinc-200">{log.tool}</span>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${statusColor}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 pl-4 border-l border-zinc-800 break-words">
                          &gt; {log.payload}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

