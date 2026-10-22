"use client";

import React, { useState, useEffect } from "react";
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

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function RefreshCwIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

interface DisputeTicket {
  id: string;
  ticket_id: string;
  customer_name: string;
  claim_description: string;
  timestamp: string;
  status: string;
  recommendation: string;
  risk_score: number;
  confidence: number;
  transaction_details: TransactionDetails | null;
  message: string;
  is_resolved: boolean;
  resolved_action: string | null;
}

interface ToolLog {
  id: string;
  timestamp: string;
  tool: string;
  status: "success" | "pending" | "warning";
  payload: string;
}

export default function SupervisorDashboardPage() {
  // Supervisor Queue & Metric state
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentConfidence, setCurrentConfidence] = useState<number>(98.4);
  const [currentRiskScore, setCurrentRiskScore] = useState<number>(0.04);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [resolvedCount, setResolvedCount] = useState<number>(0);

  // Auto-polling state
  const [isAutoPolling, setIsAutoPolling] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  // Action state
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [manualActionBanner, setManualActionBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Live tool logs state
  const [logs, setLogs] = useState<ToolLog[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch queue from FastAPI backend
  const fetchSupervisorQueue = async (isManual = false) => {
    if (isManual) setIsFetching(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/supervisor/queue");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setBackendError(null);

      if (data.disputes) {
        setDisputes(data.disputes);
      }
      if (data.guardrail_confidence !== undefined) {
        setCurrentConfidence(data.guardrail_confidence);
      }
      if (data.fraud_risk_score !== undefined) {
        setCurrentRiskScore(data.fraud_risk_score);
      }
      if (data.pending_count !== undefined) {
        setPendingCount(data.pending_count);
      }
      if (data.resolved_count !== undefined) {
        setResolvedCount(data.resolved_count);
      }

      // If no ticket selected yet or selected ticket is no longer present, pick active
      if (!selectedTicketId && data.active_ticket) {
        setSelectedTicketId(data.active_ticket.id);
      }

      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour12: false }));

      // Add polling heartbeat log periodically or on manual click
      if (isManual) {
        const syncLog: ToolLog = {
          id: `log-sync-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          tool: "SUPERVISOR_QUEUE_POLL",
          status: "success",
          payload: `Synced ${data.total_disputes || 0} disputes | Pending: ${data.pending_count} | Active: ${data.active_ticket?.id || "None"}`,
        };
        setLogs((prev) => [syncLog, ...prev.slice(0, 40)]);
      }
    } catch (err: any) {
      console.warn("Supervisor polling error:", err);
      setBackendError("Backend offline - start uvicorn (python -m uvicorn main:app --reload --port 8000)");
    } finally {
      if (isManual) setIsFetching(false);
    }
  };

  // Setup periodic polling every 2.5 seconds
  useEffect(() => {
    // Initial fetch
    fetchSupervisorQueue(true);

    if (!isAutoPolling) return;
    const interval = setInterval(() => {
      fetchSupervisorQueue(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAutoPolling]);

  // Determine active ticket for inspection
  const activeTicket: DisputeTicket | null =
    disputes.find((d) => d.id === selectedTicketId) ||
    disputes.find((d) => !d.is_resolved) ||
    disputes[disputes.length - 1] ||
    null;

  const txnMetadata = activeTicket?.transaction_details || null;
  const isTicketResolved = activeTicket?.is_resolved || false;
  const claimStatus = activeTicket?.resolved_action === "APPROVED" ? "approved" : activeTicket?.resolved_action === "REJECTED" ? "rejected" : "pending";

  // Handle Supervisor Escalation Queue Action (Approve Refund / Reject Claim)
  const handleSupervisorAction = async (action: "APPROVED" | "REJECTED") => {
    if (!activeTicket) return;
    const ticketIdToSubmit = activeTicket.ticket_id || activeTicket.id;
    setIsSubmittingAction(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/supervisor/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: ticketIdToSubmit,
          action: action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      setManualActionBanner(`Manual action recorded: ${action} for ticket #${activeTicket.id}`);
      showToast(`Manual action recorded: ${action}`);

      // Add to tool execution logs
      const actionLog: ToolLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        tool: "SUPERVISOR_ACTION_EXEC",
        status: action === "APPROVED" ? "success" : "warning",
        payload: data.message || `Manual action recorded: ${action} on ticket ${ticketIdToSubmit}`,
      };
      setLogs((prev) => [actionLog, ...prev.slice(0, 40)]);

      // Re-fetch queue to reflect new state
      fetchSupervisorQueue(false);
    } catch (err: any) {
      console.warn("Backend supervisor API offline or error, applying optimistic state:", err);
      // Optimistic update
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === activeTicket.id
            ? { ...d, is_resolved: true, resolved_action: action }
            : d
        )
      );
      setManualActionBanner(`Optimistic action recorded: ${action} for ticket #${activeTicket.id}`);
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Paytm Sentinel
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-mono">
                  Supervisor Operations Hub
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Forensic AI Telemetry & Escalation Decision Center</p>
            </div>
          </div>
        </div>

        {/* Polling & Live Stream Status */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoPolling ? "bg-emerald-400" : "bg-zinc-600"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoPolling ? "bg-emerald-500" : "bg-zinc-600"}`}></span>
            </span>
            <span className="text-zinc-400">Live Auto-Sync (2.5s):</span>
            <span className={isAutoPolling ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
              {isAutoPolling ? "ACTIVE" : "PAUSED"}
            </span>
            {lastRefreshedAt && <span className="text-zinc-600">({lastRefreshedAt})</span>}
          </div>

          <button
            type="button"
            onClick={() => fetchSupervisorQueue(true)}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs"
            title="Manual refresh"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <Link
            href="/customer"
            className="flex items-center gap-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Customer Portal</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
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
          <button
            onClick={() => fetchSupervisorQueue(true)}
            className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 border border-rose-700/60 text-white font-medium text-[11px] transition-colors"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Metric Strip */}
      <div className="p-4 sm:px-6 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-900/40 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Guardrail Confidence</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold text-emerald-400">{currentConfidence.toFixed(1)}%</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono">
              HIGH
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Fraud Risk Score</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xl font-bold ${currentRiskScore > 0.5 ? "text-rose-400" : "text-cyan-400"}`}>
              {currentRiskScore.toFixed(2)}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
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
          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Queue Pipeline</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold text-amber-400">{pendingCount} Pending</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
              {resolvedCount} Done
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">SLA Target</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold text-indigo-400">&lt; 3 mins</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">T+0 Auto</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Ticket Selector / Escalation Queue Strip */}
        {disputes.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Incoming Real-Time Dispute Pipeline ({disputes.length} Total)
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Click any ticket to inspect forensic telemetry
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {disputes.map((ticket) => {
                const isSelected = ticket.id === activeTicket?.id;
                const isPending = !ticket.is_resolved;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`flex-shrink-0 text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-950/50"
                        : "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px]">{ticket.id}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                          isPending
                            ? "bg-amber-950 text-amber-300 border-amber-800/50"
                            : ticket.resolved_action === "APPROVED"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800/50"
                            : "bg-rose-950 text-rose-300 border-rose-800/50"
                        }`}
                      >
                        {isPending ? "PENDING" : ticket.resolved_action}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[180px] mt-1">
                      {ticket.claim_description || "Customer claim"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parsed Receipt & Escalation Hub (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Parsed Receipt & Transaction Metadata Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Parsed Receipt & Switch Telemetry
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Vision Engine: Groq Vision (Qwen 27B)</span>
              </div>

              {txnMetadata ? (
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-inner">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Transaction ID (RRN)</span>
                      <p className="font-mono font-medium text-zinc-200 mt-0.5 truncate">{txnMetadata.transaction_id || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Disputed Amount</span>
                      <p className="font-semibold text-emerald-400 text-sm mt-0.5">₹ {txnMetadata.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Timestamp</span>
                      <p className="font-mono text-zinc-300 mt-0.5 truncate">{txnMetadata.timestamp || "N/A"}</p>
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

                  <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Merchant</span>
                      <p className="font-medium text-zinc-300 truncate">{txnMetadata.recipient_name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Customer Profile</span>
                      <p className="font-medium text-zinc-300">{activeTicket?.customer_name || "Aaditya V."}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Switch Discrepancy</span>
                      <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        U19 Timed-Out (Dual Debit)
                      </span>
                    </div>
                  </div>

                  {activeTicket?.message && (
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-300">
                      <span className="font-semibold text-cyan-400">AI Evaluation: </span>
                      {activeTicket.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-2xl p-8 text-center text-xs text-zinc-500 space-y-1">
                  <FileTextIcon className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                  <p className="font-medium text-zinc-300">No Receipt Telemetry Extracted</p>
                  <p className="text-[11px] text-zinc-500">
                    Awaiting dispute submission from Customer Portal (/customer).
                  </p>
                </div>
              )}
            </div>

            {/* 2. Escalation Queue & Decision Hub */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Supervisor Action Hub
                  </h3>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono ${
                  isTicketResolved 
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40" 
                    : "bg-amber-950/80 text-amber-300 border border-amber-800/40 animate-pulse"
                }`}>
                  {isTicketResolved ? "Ticket Resolved" : "Supervisor Action Required"}
                </span>
              </div>

              {/* Confirmation Banner for Recorded Manual Action */}
              {manualActionBanner && (
                <div className="mb-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{manualActionBanner}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualActionBanner(null)}
                    className="text-[10px] text-zinc-400 hover:text-white underline ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {activeTicket ? (
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-100">
                          Dispute Ticket #{activeTicket.id}
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
                        Claim: <span className="text-zinc-200">{activeTicket.claim_description}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Statutory Framework: <span className="text-indigo-300">RBI Circular RBI/2019-20/67 Auto-Reversal</span>
                      </p>
                    </div>
                  </div>

                  {/* Supervisor Action Buttons / Resolved State */}
                  {isTicketResolved ? (
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-200">
                        Ticket #{activeTicket.id} Marked as Resolved
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Supervisor verdict recorded on ledger:{" "}
                        <strong className={claimStatus === "approved" ? "text-emerald-400" : "text-rose-400"}>
                          {claimStatus.toUpperCase()}
                        </strong>
                      </p>
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
                        {isSubmittingAction
                          ? "Recording Approval..."
                          : `Approve Instant Refund (₹${txnMetadata?.amount ? txnMetadata.amount.toFixed(2) : "0.00"})`}
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
                        className="px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
                        title="Request Bank Switch Intercept"
                      >
                        <ArrowUpRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl p-8 text-center text-xs text-zinc-500 space-y-1">
                  <AlertTriangleIcon className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                  <p className="font-medium text-zinc-300">Escalation Queue Clean</p>
                  <p className="text-[11px] text-zinc-500">No active disputes requiring supervisor override right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Tool-Execution & Guardrail Logs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
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

            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 font-mono text-xs overflow-hidden shadow-2xl h-[520px] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-[11px] text-zinc-500">
                <span>AUDIT TRAIL</span>
                <span>{logs.length} EVENTS</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
                {logs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-zinc-500 font-mono">
                    <TerminalIcon className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                    <p className="text-zinc-400">Awaiting session events...</p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Logs will stream live as customers submit disputes and Groq vision runs.
                    </p>
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
      </main>
    </div>
  );
}

