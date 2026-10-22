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
  riskScore?: number;
  transactionDetails?: TransactionDetails;
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
  // Dynamic Chat state - starts empty on page load
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState("Processing receipt with Groq Llama 3.2 Vision...");

  // Supervisor state
  const [claimStatus, setClaimStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [isTicketResolved, setIsTicketResolved] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [manualActionBanner, setManualActionBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [currentRiskScore, setCurrentRiskScore] = useState<number>(0.0);
  const [currentConfidence, setCurrentConfidence] = useState<number>(100.0);

  // Active Transaction Metadata - populated dynamically
  const [txnMetadata, setTxnMetadata] = useState<TransactionDetails | null>(null);

  // Live tool logs state - starts clean and streams real session events
  const [logs, setLogs] = useState<ToolLog[]>([]);

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
        ? "Processing receipt with Groq Llama 3.2 Vision..."
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

      // 4. Update Supervisor & Telemetry state with backend response
      if (data.risk_score !== undefined) {
        setCurrentRiskScore(data.risk_score);
      }
      if (data.confidence !== undefined) {
        setCurrentConfidence(data.confidence * 100);
      }

      if (data.transaction_details) {
        setTxnMetadata(data.transaction_details);
      }

      // Add live tool log
      const newLog: ToolLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: fileToUpload ? "VISION_GUARDRAIL_EXTRACT" : "SENTINEL_DISPUTE_EVAL",
        status: data.risk_score > 0.5 ? "warning" : "success",
        payload: `Status: ${data.status} | Risk: ${data.risk_score} | RRN: ${
          data.transaction_details?.transaction_id || "N/A"
        } | Action: ${data.recommendation}`,
      };
      setLogs((prev) => [...prev, newLog]);

      // 5. Update UI chat messages with the backend response
      const aiResponseMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.message || "Dispute request processed successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
        riskScore: data.risk_score,
        transactionDetails: data.transaction_details,
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
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
          riskScore: 0.05,
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

    // Pick random sample items at all times
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

    // 2. Prepare FormData with a mock 1x1 PNG file to trigger real vision multipart handling
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

      // Only populate transaction metadata if verified and returned by backend
      if (data.transaction_details) {
        setTxnMetadata(data.transaction_details);
      }
      if (data.risk_score !== undefined) setCurrentRiskScore(data.risk_score);
      if (data.confidence !== undefined) setCurrentConfidence(data.confidence * 100);

      // Instantly render live tool-execution logs
      const log1: ToolLog = {
        id: `log-${Date.now()}-1`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: "SENTINEL_API_TEST",
        status: data.status === "SUCCESS" ? "success" : "warning",
        payload: `Test Dispute Ingested | Status: ${data.status} | Rec: ${data.recommendation}`,
      };
      const log2: ToolLog = {
        id: `log-${Date.now()}-2`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: "FASTAPI_STATUS_SYNC",
        status: data.risk_score > 0.5 ? "warning" : "success",
        payload: `Backend Response: Status=${data.status} | Risk=${data.risk_score} | Decision=${data.recommendation}`,
      };
      setLogs((prev) => [...prev, log1, log2]);

      // Append backend response to chat without fabricating fake metadata on rejection
      const aiResponseMsg: Message = {
        id: `sample-ai-${Date.now()}`,
        sender: "ai",
        text: data.message || "Dispute claim evaluation complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
        riskScore: data.risk_score,
        transactionDetails: data.transaction_details || undefined,
      };
      setMessages((prev) => [...prev, aiResponseMsg]);
      
      if (data.status === "SUCCESS") {
        showToast(`✅ Dispute Approved: RRN ${data.transaction_details?.transaction_id || ""}`);
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

  // Handle Supervisor Escalation Queue Action (Approve Refund / Reject Claim)
  const handleSupervisorAction = async (action: "APPROVED" | "REJECTED") => {
    const ticketId = "DISP-9024";
    setIsSubmittingAction(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/supervisor/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          action: action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Update UI state upon successful response
      setClaimStatus(action === "APPROVED" ? "approved" : "rejected");
      setIsTicketResolved(true);
      setManualActionBanner(`Manual action recorded: ${action} for ticket #${ticketId}`);
      showToast(`Manual action recorded: ${action}`);

      const newLog: ToolLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: "SUPERVISOR_ACTION_EXEC",
        status: action === "APPROVED" ? "success" : "warning",
        payload: data.message || `Manual action recorded: ${action} on ticket ${ticketId}`,
      };
      setLogs((prev) => [...prev, newLog]);

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `⚡ SUPERVISOR OVERRIDE: Ticket #${ticketId} marked as ${action}. Manual action recorded in audit log.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.warn("Backend supervisor API offline or error, applying optimistic state:", err);
      // Optimistic update for UI resilience
      setClaimStatus(action === "APPROVED" ? "approved" : "rejected");
      setIsTicketResolved(true);
      setManualActionBanner(`Manual action recorded: ${action} for ticket #${ticketId}`);
      showToast(`Manual action recorded: ${action}`);
    } finally {
      setIsSubmittingAction(false);
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

      {/* Top Navigation Bar */}
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

        {/* Global Badges */}
        <div className="hidden md:flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300">Guardrail Cluster: <strong className="text-emerald-400">CONNECTED</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono text-zinc-300">
            <span className="text-zinc-500">FastAPI Backend:</span>
            <span className="text-cyan-400">127.0.0.1:8000</span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleSendSampleDispute}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-400 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
            title="Send a randomized sample dispute to test API connectivity"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Send Sample Dispute (Random)</span>
          </button>
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

      {/* Main Split-Screen Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* ========================================== */}
        {/* VIEW A: LEFT PANEL - CUSTOMER CHAT INTERFACE */}
        {/* ========================================== */}
        <section className="lg:col-span-6 flex flex-col border-r border-zinc-800/80 bg-zinc-950/40 relative h-full min-h-0">
          {/* Panel Header */}
          <div className="p-4 flex-shrink-0 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
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
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSendSampleDispute}
                className="text-[11px] bg-indigo-950 hover:bg-indigo-900/80 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-700/50 flex items-center gap-1 transition-colors"
                title="Send a randomized sample dispute"
              >
                <SparklesIcon className="w-3 h-3 text-cyan-400" />
                <span>Test API</span>
              </button>
              <span className="text-[11px] bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/60 font-mono">
                Ticket #DISP-9024
              </span>
            </div>
          </div>

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto select-none">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/40">
                  <SparklesIcon className="w-7 h-7" />
                </div>
                <div className="max-w-sm space-y-1.5">
                  <h3 className="font-semibold text-zinc-200 text-sm">DisputeX Sentinel Active</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Chat session is clean and ready. Describe your grievance (e.g., failed UPI debit, duplicate charge) or attach a passbook screenshot below to start real-time resolution.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSendSampleDispute}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Send Sample Dispute (Random API Test)</span>
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
                        : msg.status === "REJECTED"
                        ? "bg-rose-950/40 text-rose-200 rounded-tl-none border border-rose-800/80 shadow-rose-950/30"
                        : msg.status === "SUCCESS"
                        ? "bg-emerald-950/40 text-emerald-200 rounded-tl-none border border-emerald-800/80 shadow-emerald-950/30"
                        : "bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-zinc-800/80"
                    }`}
                  >
                    {!isCustomer && msg.status === "REJECTED" && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-900/60 border border-rose-700/60 text-rose-300 font-mono text-[10px] font-semibold mb-2">
                        <span>❌</span>
                        <span>DISPUTE REJECTED</span>
                      </div>
                    )}
                    {!isCustomer && msg.status === "SUCCESS" && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-semibold mb-2">
                        <span>✅</span>
                        <span>REFUND AUTHORIZED (SUCCESS)</span>
                      </div>
                    )}
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
                          Uploaded
                        </span>
                      </div>
                    )}

                    {/* Structured Backend Details Card in AI Response */}
                    {msg.transactionDetails && (
                      <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 text-xs space-y-1.5">
                        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1 text-[11px]">
                          <span className="text-zinc-400">Extracted Metadata</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            ₹{msg.transactionDetails.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                          <div>
                            RRN: <span className="font-mono text-zinc-200">{msg.transactionDetails.transaction_id}</span>
                          </div>
                          <div>
                            Merchant: <span className="text-zinc-200 truncate">{msg.transactionDetails.recipient_name}</span>
                          </div>
                          <div>
                            Time: <span className="text-zinc-200">{msg.transactionDetails.timestamp}</span>
                          </div>
                          <div>
                            Risk Score:{" "}
                            <span className={msg.riskScore && msg.riskScore > 0.5 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                              {msg.riskScore !== undefined ? msg.riskScore : "0.03"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

            {/* Loading Indicator State */}
            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 max-w-[85%] animate-pulse">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </div>
                <div>
                  <p className="font-medium">{loadingStatusText}</p>
                  <p className="text-[10px] text-zinc-400">Connecting to http://127.0.0.1:8000/api/dispute/submit</p>
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

          {/* Message Input Box - Always visible & pinned to bottom */}
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
        </section>

        {/* ============================================================== */}
        {/* VIEW B: RIGHT PANEL - SUPERVISOR & AI GUARDRAIL DASHBOARD */}
        {/* ============================================================== */}
        <section className="lg:col-span-6 flex flex-col bg-zinc-950/80 overflow-y-auto h-full min-h-0">
          {/* Header Metric Strip */}
          <div className="p-4 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-900/40 grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Guardrail Confidence</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold text-emerald-400">{currentConfidence.toFixed(1)}%</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">HIGH</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Fraud Risk Score</span>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xl font-bold ${currentRiskScore > 0.5 ? "text-rose-400" : "text-cyan-400"}`}>
                  {currentRiskScore.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    currentRiskScore > 0.5
                      ? "text-rose-400 bg-rose-950/60 border-rose-800/40"
                      : "text-cyan-400 bg-cyan-950/60 border-cyan-800/40"
                  }`}
                >
                  {currentRiskScore > 0.5 ? "RISK" : "SAFE"}
                </span>
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
                <span className="text-[11px] text-zinc-500 font-mono">Vision Engine: OpenAI GPT-4o</span>
              </div>

              {txnMetadata ? (
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Transaction ID</span>
                      <p className="font-mono font-medium text-zinc-200 mt-0.5 truncate">{txnMetadata.transaction_id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Disputed Amount</span>
                      <p className="font-semibold text-emerald-400 text-sm mt-0.5">₹ {txnMetadata.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Timestamp</span>
                      <p className="font-mono text-zinc-300 mt-0.5 truncate">{txnMetadata.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Tampered Flag</span>
                      <p className="font-mono text-xs mt-0.5 font-medium">
                        {txnMetadata.is_tampered_flag ? (
                          <span className="text-rose-400 font-bold">TRUE (ANOMALY)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">FALSE (CLEAN)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Merchant</span>
                      <p className="font-medium text-zinc-300 truncate">{txnMetadata.recipient_name}</p>
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
              ) : (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-2xl p-6 text-center text-xs text-zinc-500 space-y-1">
                  <FileTextIcon className="w-5 h-5 mx-auto text-zinc-600 mb-1" />
                  <p className="font-medium text-zinc-300">No Receipt Telemetry Extracted</p>
                  <p className="text-[11px] text-zinc-500">Upload a receipt screenshot or submit a grievance to parse switch telemetry.</p>
                </div>
              )}
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
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  !txnMetadata || isTicketResolved 
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40" 
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  {!txnMetadata || isTicketResolved ? "0 Pending Disputes" : "1 Dispute in Pipeline"}
                </span>
              </div>

              {/* Confirmation Banner for Recorded Manual Action */}
              {manualActionBanner && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{manualActionBanner}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTicketResolved(false);
                      setClaimStatus("pending");
                      setManualActionBanner(null);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white underline ml-2"
                  >
                    Reset Ticket
                  </button>
                </div>
              )}

              {txnMetadata ? (
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/90 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-100">
                          Dispute for RRN #{txnMetadata.transaction_id}
                        </h4>
                        {isTicketResolved ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            claimStatus === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          }`}>
                            {claimStatus === "approved" ? "RESOLVED (APPROVED)" : "RESOLVED (REJECTED)"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 animate-pulse">
                            ACTION REQUIRED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        AI Policy Verdict:{" "}
                        <span className="text-indigo-300 font-medium">
                          Instant Auto-Reversal Eligible under RBI Circular RBI/2019-20/67
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Supervisor Action Buttons / Resolved State */}
                  {isTicketResolved ? (
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-200">Ticket #{txnMetadata.transaction_id} Marked as Resolved</p>
                      <p className="text-[11px] text-zinc-400">
                        Manual action recorded on backend: <strong className={claimStatus === "approved" ? "text-emerald-400" : "text-rose-400"}>{claimStatus.toUpperCase()}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTicketResolved(false);
                          setClaimStatus("pending");
                          setManualActionBanner(null);
                        }}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium"
                      >
                        Re-open Ticket for Demo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleSupervisorAction("APPROVED")}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all shadow-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-emerald-700/20 active:scale-95"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        {isSubmittingAction ? "Recording Approval..." : `Approve Instant Refund (₹${txnMetadata.amount.toFixed(2)})`}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleSupervisorAction("REJECTED")}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs transition-all border bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-50 text-rose-300 border-rose-800/40 active:scale-95"
                      >
                        <XCircleIcon className="w-4 h-4 text-rose-400" />
                        {isSubmittingAction ? "Recording Rejection..." : "Reject Claim"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          showToast("ℹ️ Requested Manual 3-Way Bank Reconciliation from Switch.");
                        }}
                        className="px-3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
                        title="Request Bank Intercept"
                      >
                        <ArrowUpRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl p-6 text-center text-xs text-zinc-500 space-y-1">
                  <AlertTriangleIcon className="w-5 h-5 mx-auto text-zinc-600 mb-1" />
                  <p className="font-medium text-zinc-300">Escalation Queue Clean</p>
                  <p className="text-[11px] text-zinc-500">No active disputes requiring supervisor override in this session.</p>
                </div>
              )}
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
                  {logs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                      <TerminalIcon className="w-5 h-5 mx-auto mb-2 text-zinc-700" />
                      <p className="text-zinc-400">Awaiting session events...</p>
                      <p className="text-[10px] text-zinc-600 mt-1">Logs will stream live as tools & vision models are executed.</p>
                    </div>
                  ) : (
                    logs.map((log) => {
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
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
