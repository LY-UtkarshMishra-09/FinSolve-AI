"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

function ArrowTopRightOnSquareIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

interface TransactionDetails {
  transaction_id: string;
  amount: number;
  timestamp: string;
  recipient_name: string;
  is_tampered_flag?: boolean;
}

interface Message {
  id: string;
  sender: "customer" | "ai" | "system";
  text: string;
  timestamp: string;
  status?: string;
  transactionDetails?: TransactionDetails;
  attachment?: {
    name: string;
    size: string;
  };
}

export default function CustomerGrievancePage() {
  // Dynamic Chat state - starts empty on page load
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState("Processing receipt with Groq Vision Engine...");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      showToast(`📎 Selected file: ${file.name}`);
    }
  };

  // Submit form or receipt to the FastAPI backend: /api/dispute/submit
  const handleDisputeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const userText = inputMessage.trim() || (selectedFile ? `Uploaded receipt proof: ${selectedFile.name}` : "");
    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Instantly append customer message to UI
    const customerMsg: Message = {
      id: `cust-${Date.now()}`,
      sender: "customer",
      text: userText,
      timestamp: userTimestamp,
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, customerMsg]);
    const fileToUpload = selectedFile;
    const descToSubmit = userText;

    // Reset input fields
    setInputMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // 2. Set loading states
    setIsLoading(true);
    setLoadingStatusText(
      fileToUpload
        ? "Processing receipt with Groq Vision Engine..."
        : "Auditing dispute claim with Sentinel Policy Evaluator..."
    );

    // 3. Prepare FormData payload
    const formData = new FormData();
    formData.append("description", descToSubmit);
    if (fileToUpload) {
      formData.append("file", fileToUpload);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/dispute/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setBackendError(null);

      // 4. Update UI chat messages with the backend response
      const aiResponseMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.message || "Dispute request processed successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
        transactionDetails: data.transaction_details,
      };

      setMessages((prev) => [...prev, aiResponseMsg]);

      if (data.status === "SUCCESS") {
        showToast(`✅ Dispute Approved: RRN ${data.transaction_details?.transaction_id || ""}`);
      } else if (data.status === "MANUAL_REVIEW" || data.status === "WARNING") {
        showToast(`⚠️ Routed to Escalation Queue for Supervisor Review`);
      } else {
        showToast(`❌ Claim Update: ${data.recommendation || "Verification Failed"}`);
      }
    } catch (err: any) {
      console.warn("Backend API call failed, falling back to local simulation:", err);
      setBackendError("Backend offline - start uvicorn (python -m uvicorn main:app --reload --port 8000)");

      // Graceful fallback for offline demo testing
      setTimeout(() => {
        const fallbackMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Extracted details from "${descToSubmit}". Note: FastAPI backend at http://127.0.0.1:8000/api/dispute/submit was not reachable (${err?.message || "connection error"}). Please ensure uvicorn is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "offline_fallback",
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Randomized test sample pool for live API verification
  const handleSendSampleDispute = async () => {
    setBackendError(null);
    setIsLoading(true);
    setLoadingStatusText("Connecting to FastAPI backend with randomized dispute payload...");

    const SAMPLE_POOL = [
      {
        merchant: "Starbucks Coffee #Ind-04",
        amounts: [2450.0, 1850.0, 720.0, 3100.0],
        templates: [
          "I was debited twice for my Starbucks order. Cashier terminal timed out on the secondary UPI charge.",
          "Dual debit of ₹{amount} at Starbucks Indiranagar. Only one payment confirmation was generated.",
        ],
      },
      {
        merchant: "Swiggy Food Delivery",
        amounts: [640.0, 1120.0, 480.0, 890.0],
        templates: [
          "Order checkout failed on Swiggy for ₹{amount}, but money was deducted from HDFC account.",
          "Duplicate UPI deduction of ₹{amount} at Swiggy. Restaurant received zero capture.",
        ],
      },
      {
        merchant: "Amazon India Pay",
        amounts: [3499.0, 1499.0, 2190.0, 4850.0],
        templates: [
          "Duplicate UPI charge of ₹{amount} on Amazon Pay checkout. NPCI switch timed out.",
          "Instant checkout timed out for ₹{amount} on Amazon. Secondary debit not reversed.",
        ],
      },
      {
        merchant: "BookMyShow Tickets",
        amounts: [920.0, 1650.0, 1340.0, 2200.0],
        templates: [
          "Movie seat booking failed, but ₹{amount} was deducted twice. Requesting instant auto-reversal.",
          "Double debit of ₹{amount} for cinema tickets at BookMyShow. Switch error U19.",
        ],
      },
    ];

    const randomSet = SAMPLE_POOL[Math.floor(Math.random() * SAMPLE_POOL.length)];
    const randomAmount = randomSet.amounts[Math.floor(Math.random() * randomSet.amounts.length)];
    const randomRrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const rawTemplate = randomSet.templates[Math.floor(Math.random() * randomSet.templates.length)];
    const claimText = rawTemplate.replace("{amount}", randomAmount.toFixed(2));
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sampleFileName = `sample_receipt_${randomSet.merchant.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${randomRrn.slice(-4)}.png`;

    // 1. Immediately append randomized customer claim
    const customerMsg: Message = {
      id: `sample-cust-${Date.now()}`,
      sender: "customer",
      text: claimText,
      timestamp: timeStr,
      attachment: {
        name: sampleFileName,
        size: `${(0.8 + Math.random() * 1.4).toFixed(2)} MB`,
      },
    };
    setMessages((prev) => [...prev, customerMsg]);

    // 2. Prepare FormData with a mock 1x1 PNG file
    const mockPngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
      0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137,
      0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13,
      10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ]);
    const mockFile = new File([mockPngBytes], sampleFileName, { type: "image/png" });

    const formData = new FormData();
    formData.append("description", claimText);
    formData.append("file", mockFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/dispute/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiResponseMsg: Message = {
        id: `sample-ai-${Date.now()}`,
        sender: "ai",
        text: data.message || "Dispute claim evaluation complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
        transactionDetails: data.transaction_details || undefined,
      };
      setMessages((prev) => [...prev, aiResponseMsg]);

      if (data.status === "SUCCESS") {
        showToast(`✅ Dispute Approved: RRN ${data.transaction_details?.transaction_id || ""}`);
      } else if (data.status === "MANUAL_REVIEW" || data.status === "WARNING") {
        showToast(`⚠️ Routed to Escalation Queue for Supervisor Review`);
      } else {
        showToast(`❌ Dispute Rejected: ${data.recommendation || "Guardrail Check"}`);
      }
    } catch (err: any) {
      console.warn("Backend connectivity test failed:", err);
      const errMsg = "Backend offline - start uvicorn (python -m uvicorn main:app --reload --port 8000)";
      setBackendError(errMsg);
      showToast("⚠️ Backend offline - start uvicorn");

      const errorChatMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: `❌ API Connection Failed: ${err?.message || "Failed to fetch"}. Please ensure your FastAPI backend is running at http://127.0.0.1:8000. Start it with: python -m uvicorn main:app --reload --port 8000`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorChatMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/40 backdrop-blur-md animate-bounce">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hidden Real File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Top Header */}
      <header className="h-16 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Portal Launcher</span>
          </Link>

          <div className="h-5 w-px bg-zinc-800" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Paytm Sentinel
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-mono">
                  Customer Portal
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Autonomous Instant UPI Dispute Settlement</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSendSampleDispute}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            title="Send a randomized sample dispute to test API connectivity"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send Sample Dispute</span>
          </button>

          <Link
            href="/supervisor"
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Supervisor Hub</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Backend Error Banner */}
      {backendError && (
        <div className="flex-shrink-0 bg-rose-950/95 border-b border-rose-800 text-rose-200 px-6 py-2.5 text-xs flex items-center justify-between backdrop-blur-md shadow-lg sticky top-16 z-20">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-semibold">{backendError}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendSampleDispute}
              className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 border border-rose-700/60 text-white font-medium text-[11px] transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setBackendError(null)}
              className="text-[11px] text-rose-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Customer Grievance Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto min-h-0 bg-zinc-950/40 border-x border-zinc-800/80 relative">
        {/* Panel Header */}
        <div className="p-4 flex-shrink-0 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-cyan-400 shadow-inner">
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
            <span className="text-[11px] bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/60 font-mono">
              Ticket #DISP-9024
            </span>
          </div>
        </div>

        {/* Chat Messages Scroll Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto select-none">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/40">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-semibold text-zinc-100 text-base">Sentinel Auto-Settlement Ready</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have a failed transaction, duplicate debit, or timed-out UPI payment? Describe what happened below or attach a screenshot of your debit receipt for real-time OCR and automated T+0 reversal.
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSendSampleDispute}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Send Sample Dispute (Random Live Test)</span>
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-500">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">✨ Dual Debit Auto-Trace</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">🔍 Vision OCR Forensic Audit</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">⚡ Instant T+0 Reversals</span>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="my-2 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-700/40 text-xs text-indigo-300 flex items-start gap-2.5">
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
                <div key={msg.id} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-medium text-zinc-400">
                      {isCustomer ? "You (Aaditya V.)" : "Paytm Sentinel AI"}
                    </span>
                    <span className="text-[10px] text-zinc-500">&bull; {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-md ${
                      isCustomer
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Attachment preview */}
                    {msg.attachment && (
                      <div
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-[11px] ${
                          isCustomer
                            ? "bg-indigo-700/60 border border-indigo-500/40 text-indigo-100"
                            : "bg-zinc-800/80 border border-zinc-700 text-zinc-300"
                        }`}
                      >
                        <PaperclipIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate font-medium">{msg.attachment.name}</span>
                        <span className="opacity-75 flex-shrink-0 ml-auto">({msg.attachment.size})</span>
                      </div>
                    )}

                    {/* Transaction Card if verified */}
                    {msg.transactionDetails && (
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 uppercase">Verified Transaction</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            ₹{msg.transactionDetails.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[11px] space-y-1">
                          <p className="text-zinc-400">
                            Merchant: <strong className="text-zinc-200">{msg.transactionDetails.recipient_name}</strong>
                          </p>
                          <p className="text-zinc-400 font-mono text-[10px]">
                            RRN: {msg.transactionDetails.transaction_id}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Pill for AI messages */}
                    {msg.status && (
                      <div className="pt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                            msg.status === "SUCCESS"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                              : msg.status === "MANUAL_REVIEW" || msg.status === "WARNING"
                              ? "bg-amber-950 text-amber-300 border-amber-700"
                              : "bg-rose-950 text-rose-300 border-rose-700"
                          }`}
                        >
                          {msg.status === "SUCCESS" ? "AUTO-SETTLED" : msg.status.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs animate-pulse">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </div>
              <div>
                <p className="font-medium">{loadingStatusText}</p>
                <p className="text-[10px] text-zinc-400">Communicating with Sentinel Guardrail Server...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Receipt Uploader Dropzone Banner */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/20">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border border-dashed border-zinc-700 hover:border-indigo-500/70 transition-colors rounded-xl p-2.5 flex items-center justify-between text-xs bg-zinc-900/40"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                <PaperclipIcon className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-zinc-300 font-medium truncate">
                  {selectedFile ? selectedFile.name : "Attach Receipt / Debit SMS Screenshot"}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Ready for Fast-Track OCR`
                    : "Click to browse JPEG/PNG for automated AI parsing"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedFile) {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium ml-2 flex-shrink-0"
            >
              {selectedFile ? "Remove" : "Browse File"}
            </button>
          </div>
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleDisputeSubmit} className="p-4 flex-shrink-0 border-t border-zinc-800/80 bg-zinc-950 flex items-center gap-2">
          <input
            type="text"
            disabled={isLoading}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your dispute (e.g., 'Double debited ₹2,450 at Starbucks')..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center flex-shrink-0"
            title="Submit Dispute"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

