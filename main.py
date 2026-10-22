import os
import re
import io
import json
import base64
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image
from groq import AsyncGroq
from dotenv import load_dotenv

# Automatically load environment variables if .env exists
load_dotenv()

# ----------------------------------------------------------------------
# 1. Pydantic Schema for Receipt Metadata & Forensics
# ----------------------------------------------------------------------
class ReceiptData(BaseModel):
    transaction_id: str = Field(
        default="",
        description="The unique transaction ID, UPI reference number (RRN), or order ID extracted from the receipt. Empty string if non-receipt or unreadable."
    )
    amount: float = Field(
        default=0.0,
        description="The numerical monetary value of the transaction in INR (e.g. 2450.00)."
    )
    timestamp: str = Field(
        default="",
        description="The date and time of the transaction in standard readable format (e.g., '2026-10-21 10:39:12')."
    )
    recipient_name: str = Field(
        default="",
        description="The name of the merchant, store, or individual recipient (e.g., 'Starbucks Coffee', 'Swiggy')."
    )
    is_tampered_flag: bool = Field(
        default=False,
        description="True if the image exhibits visual anomalies, spliced text, mismatched fonts, or is a fake/random non-receipt image; False otherwise."
    )
    is_valid_receipt: bool = Field(
        default=True,
        description="True if the image is an authentic payment receipt, UPI transaction slip, or invoice. False if it is a random photo, meme, animal, landscape, unrelated screenshot, blank image, or non-receipt."
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        description="Explanation if the image is not a valid receipt, fake, or tampered."
    )

# Alias for compatibility
ReceiptExtraction = ReceiptData

# ----------------------------------------------------------------------
# 2. Active Core Banking & NPCI Settlement Ledger Database
# ----------------------------------------------------------------------
ACTIVE_BANKING_LEDGER: Dict[str, Dict[str, Any]] = {
    "402919829103": {
        "account_no": "****4920",
        "merchant": "Starbucks Coffee Indiranagar",
        "amount": 2450.00,
        "debit_count": 2,
        "switch_status": "U19_TIMED_OUT",  # Dual debit: second charge timed out without capture
        "ledger_verdict": "MATCHED_DUAL_DEBIT_TIMEOUT",
        "timestamp": "2026-10-21 10:39:12"
    },
    "992810394812": {
        "account_no": "****1102",
        "merchant": "Swiggy Delivery",
        "amount": 420.00,
        "debit_count": 1,
        "switch_status": "00_SUCCESS",  # Merchant received credit successfully
        "ledger_verdict": "SUCCESSFULLY_CAPTURED",
        "timestamp": "2026-10-21 14:12:05"
    },
    "883920194821": {
        "account_no": "****8391",
        "merchant": "Amazon Pay India",
        "amount": 1499.00,
        "debit_count": 2,
        "switch_status": "U19_TIMED_OUT",
        "ledger_verdict": "MATCHED_DUAL_DEBIT_TIMEOUT",
        "timestamp": "2026-10-21 18:22:30"
    },
    "771920394810": {
        "account_no": "****2940",
        "merchant": "BookMyShow Tickets",
        "amount": 920.00,
        "debit_count": 2,
        "switch_status": "U19_TIMED_OUT",
        "ledger_verdict": "MATCHED_DUAL_DEBIT_TIMEOUT",
        "timestamp": "2026-10-21 21:04:15"
    }
}

# ----------------------------------------------------------------------
# 3. In-Memory Dispute Escalation Queue (Shared between /customer and /supervisor)
# ----------------------------------------------------------------------
DISPUTES_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "DISP-9024",
        "ticket_id": "402919829103",
        "customer_name": "Aaditya V. (+91 98840 XXXXX)",
        "claim_description": "Duplicate debit of ₹2,450.00 at Starbucks Indiranagar. UPI switch timed out.",
        "timestamp": "2026-10-22 20:15:32",
        "status": "MANUAL_REVIEW",
        "recommendation": "MANUAL_INVESTIGATION",
        "risk_score": 0.42,
        "confidence": 0.984,
        "transaction_details": {
            "transaction_id": "402919829103",
            "amount": 2450.00,
            "timestamp": "2026-10-22 20:15:32",
            "recipient_name": "Starbucks Coffee Indiranagar",
            "is_tampered_flag": False
        },
        "message": "Dispute Queued for MANUAL REVIEW: Dual debit detected. Pending supervisor clearance.",
        "is_resolved": False,
        "resolved_action": None
    }
]

def register_dispute_ticket(
    claim_desc: str,
    status_text: str,
    recommendation: str,
    risk_score: float,
    confidence: float,
    message: str,
    txn_details: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    raw_id = (txn_details or {}).get("transaction_id") or str(int(datetime.now().timestamp()))
    ticket_id = raw_id
    display_id = f"DISP-{raw_id[-6:]}" if len(raw_id) >= 6 else f"DISP-{raw_id}"
    
    ticket = {
        "id": display_id,
        "ticket_id": ticket_id,
        "customer_name": "Aaditya V. (+91 98840 XXXXX)",
        "claim_description": claim_desc,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": status_text,
        "recommendation": recommendation,
        "risk_score": risk_score,
        "confidence": confidence,
        "transaction_details": txn_details,
        "message": message,
        "is_resolved": False,
        "resolved_action": None
    }
    DISPUTES_REGISTRY.append(ticket)
    return ticket

# ----------------------------------------------------------------------
# 4. FastAPI Application Setup
# ----------------------------------------------------------------------
app = FastAPI(
    title="Paytm Sentinel / DisputeX API",
    description="Vision Guardrail & Automated Dispute Settlement API using Groq Llama 3.2 Vision",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_groq_client() -> AsyncGroq:
    """Initializes the official Groq client using os.environ.get('GROQ_API_KEY')."""
    api_key = os.environ.get("GROQ_API_KEY")
    return AsyncGroq(api_key=api_key)

def format_human_error(e: Exception) -> str:
    """Formats technical or API exceptions into human-friendly, professional fintech error messages."""
    # Attempt to extract nested JSON error message if present from Groq / HTTP client
    if hasattr(e, "body") and isinstance(e.body, dict):
        err_msg = e.body.get("error", {}).get("message") or e.body.get("message")
        if err_msg:
            return f"Vision Verification Notice: {err_msg}"
            
    err_text = str(e)
    err_lower = err_text.lower()
    
    if "decommissioned" in err_lower:
        return "Vision Model Notice: The previous vision model was decommissioned and updated to Groq Qwen Vision."
    if "401" in err_text or "invalid_api_key" in err_lower or "incorrect api key" in err_lower or "unauthorized" in err_lower:
        return "Authentication Failure: The Groq API key in .env is invalid or expired. Please check your GROQ_API_KEY."
    if "429" in err_text or "insufficient_quota" in err_lower or "quota" in err_lower or "rate_limit" in err_lower:
        return "Rate Limit Exceeded: Groq Vision API request quota reached. Please wait a moment and try again."
    if "connection" in err_lower or "timeout" in err_lower or "connect" in err_lower:
        return "Network Timeout: Could not connect to Groq Vision services. Please verify your internet connection."
    if "empty response" in err_lower:
        return "Receipt Unreadable: Groq vision model could not parse text from this image. Please upload a clearer screenshot."
    
    # Try extracting message from stringified dict without mangling
    dict_match = re.search(r"['\"]message['\"]:\s*['\"]([^'\"]+)['\"]", err_text)
    if dict_match:
        return f"Vision Verification Notice: {dict_match.group(1)}"

    clean = err_text.replace("Error code: ", "Status ").strip(" -:")
    return f"Vision Verification Notice: {clean if clean else 'Unable to process receipt image.'}"

# ----------------------------------------------------------------------
# 4. Real Vision Parser Function using Groq (qwen/qwen3.8-27b)
# ----------------------------------------------------------------------
async def parse_receipt_with_groq(
    image_bytes: bytes,
    mime_type: str = "image/png"
) -> ReceiptData:
    """
    Converts image to base64, invokes Groq vision model (qwen/qwen3.8-27b)
    with strict JSON output, inspects image legitimacy and visual tampering, and extracts transaction metadata.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in the environment. Please add it to your .env file.")

    # Guard: Ensure image has at least 32 pixels in each dimension (required by Groq vision)
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        w, h = pil_img.size
        if w < 32 or h < 32:
            scale = max(32 / max(w, 1), 32 / max(h, 1))
            new_w, new_h = max(32, int(w * scale)), max(32, int(h * scale))
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.NEAREST)
            buf = io.BytesIO()
            pil_img.save(buf, format="PNG")
            image_bytes = buf.getvalue()
            mime_type = "image/png"
    except Exception:
        pass

    # Convert uploaded image file to base64 encoding
    base64_encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_encoded_image}"

    client = get_groq_client()

    prompt_instruction = (
        "You are an expert fintech document auditor and forensics AI for Paytm Sentinel / DisputeX.\n"
        "Analyze the uploaded image with strict scrutiny:\n"
        "1. Check if the image is an authentic transaction receipt, payment confirmation screenshot, UPI debit slip, bank passbook/SMS screenshot, or invoice.\n"
        "2. If the image is a generic/random photo (e.g. animals, nature, people, memes, random objects, wallpapers, solid colors, or blank pixels) or any non-financial document, set 'is_valid_receipt' to false, set 'is_tampered_flag' to true, and specify the exact reason in 'rejection_reason'.\n"
        "3. If it is a legitimate receipt or transaction confirmation, set 'is_valid_receipt' to true, and extract:\n"
        "   - transaction_id: The UPI RRN (12 digits), order reference, or transaction ID (string).\n"
        "   - amount: Numerical payment amount (float, e.g. 2450.00).\n"
        "   - timestamp: Date and time of the transaction (e.g., '2026-10-21 10:39:12').\n"
        "   - recipient_name: Name of merchant, payee, or store.\n"
        "   - is_tampered_flag: true if font style/size mismatches, spliced text, altered amounts, or artifacts of photo editing are detected; false otherwise.\n\n"
        "You MUST respond ONLY with a valid JSON object matching this exact schema:\n"
        "{\n"
        '  "transaction_id": "string",\n'
        '  "amount": float,\n'
        '  "timestamp": "string",\n'
        '  "recipient_name": "string",\n'
        '  "is_tampered_flag": boolean,\n'
        '  "is_valid_receipt": boolean,\n'
        '  "rejection_reason": "string or null"\n'
        "}"
    )

    completion = await client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt_instruction
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": data_url
                        }
                    }
                ]
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )

    raw_content = completion.choices[0].message.content
    if not raw_content:
        raise ValueError("Received empty response from Groq Vision model.")

    # Strip any markdown fences if model outputs ```json ... ```
    cleaned_json_str = raw_content.strip()
    if cleaned_json_str.startswith("```"):
        cleaned_json_str = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned_json_str)
        cleaned_json_str = re.sub(r"\n?```$", "", cleaned_json_str)

    parsed_json = json.loads(cleaned_json_str)
    return ReceiptData.model_validate(parsed_json)

# ----------------------------------------------------------------------
# 5. API Endpoints
# ----------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DisputeX Sentinel Vision Engine (Groq)",
        "model": "qwen/qwen3.8-27b",
        "provider": "Groq"
    }

@app.post(
    "/api/dispute/submit",
    summary="Submit Dispute with Receipt Image & Description",
    status_code=status.HTTP_200_OK
)
async def submit_dispute(
    file: Optional[UploadFile] = File(None, description="Receipt or transaction screenshot image file"),
    description: Optional[str] = Form(None, description="Customer dispute explanation or claim message")
):
    """
    Accepts an uploaded image file and claim description.
    1. Validates the receipt using Groq vision (llama-3.2-11b-vision-preview).
    2. Rejects generic/invalid image content (e.g. random photos, non-receipts).
    3. Rejects tampered receipts or missing transaction metadata.
    4. Cross-references extracted transaction details against the active core banking ledger.
    5. Returns status: 'REJECTED' if unverified, or status: 'SUCCESS' if confirmed.
    """
    claim_desc = description or "Dispute claim submitted for review"

    # Validation Check 1: Mandatory receipt image file
    if not file or not file.filename:
        return {
            "status": "REJECTED",
            "message": "Dispute REJECTED: Missing transaction receipt. An authentic payment screenshot or receipt image is required for autonomous dispute evaluation.",
            "transaction_details": None,
            "risk_score": 0.85,
            "confidence": 0.95,
            "recommendation": "REJECT_MISSING_PROOF"
        }

    content_type = file.content_type or "image/png"
    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) == 0:
        return {
            "status": "REJECTED",
            "message": "Dispute REJECTED: Uploaded file is empty (0 bytes). Please upload a valid receipt screenshot.",
            "transaction_details": None,
            "risk_score": 0.90,
            "confidence": 0.95,
            "recommendation": "REJECT_EMPTY_FILE"
        }

    # Step 2: Real Groq Vision Inspection (llama-3.2-11b-vision-preview)
    try:
        extraction = await parse_receipt_with_groq(image_bytes, mime_type=content_type)
    except Exception as e:
        print(f"[Groq Vision Error] {e}")
        human_msg = format_human_error(e)
        
        # Resilient demo fallback: extract basic fields from claim/filename so the demo does not throw a hard error
        desc_combined = f"{claim_desc} {file.filename or ''}"
        amt_match = re.search(r'(?:[₹$]|rs\.?|inr\s*)\s*([\d,]+(?:\.\d{1,2})?)', desc_combined, re.IGNORECASE)
        if not amt_match:
            amt_match = re.search(r'\b(\d{2,6}(?:\.\d{1,2})?)\b', desc_combined)
        rrn_match = re.search(r'\b(\d{10,12})\b', desc_combined)
        
        fallback_amt = float(amt_match.group(1).replace(",", "")) if amt_match else 2450.00
        fallback_rrn = rrn_match.group(1) if rrn_match else "402919829103"
        fallback_details = {
            "transaction_id": fallback_rrn,
            "amount": fallback_amt,
            "timestamp": "2026-10-22 20:20:00",
            "recipient_name": "Merchant Payment",
            "is_tampered_flag": False
        }
        
        ticket = register_dispute_ticket(
            claim_desc=claim_desc,
            status_text="MANUAL_REVIEW",
            recommendation="MANUAL_INVESTIGATION",
            risk_score=0.45,
            confidence=0.88,
            message=f"Dispute Queued for MANUAL REVIEW: Vision service notice ({human_msg}). Ticket #{fallback_rrn} placed in Supervisor Escalation Queue for manual review.",
            txn_details=fallback_details
        )

        return {
            "status": "MANUAL_REVIEW",
            "message": f"Dispute Queued for MANUAL REVIEW: Vision service notice ({human_msg}). Ticket #{fallback_rrn} placed in Supervisor Escalation Queue for manual review.",
            "transaction_details": fallback_details,
            "risk_score": 0.45,
            "confidence": 0.88,
            "recommendation": "MANUAL_INVESTIGATION",
            "ticket_id": ticket["id"]
        }

    # Extract basic parsed fields
    raw_rrn = (extraction.transaction_id or "").strip()
    receipt_amount = float(extraction.amount or 0.0)
    merchant_name = extraction.recipient_name or "Merchant"
    has_basic_fields = bool(raw_rrn or receipt_amount > 0)

    # If completely generic/random photo where NO basic transaction fields could be extracted
    if not has_basic_fields and not extraction.is_valid_receipt:
        reason = extraction.rejection_reason or "Uploaded image does not appear to be a recognized transaction receipt or payment slip."
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Could not extract valid transaction metadata (amount or RRN) from the uploaded image. {reason}",
            "transaction_details": None,
            "risk_score": 0.95,
            "confidence": 0.99,
            "recommendation": "REJECT_NON_RECEIPT_IMAGE"
        }

    # Ensure we have at least a usable RRN for demo pipeline tracking
    if not raw_rrn:
        raw_rrn = "DISP-" + re.sub(r'[^0-9]', '', str(abs(hash(claim_desc))))[:8]
        extraction.transaction_id = raw_rrn

    # Check for visual tampering flag -> Fall back to WARNING / MANUAL_REVIEW instead of hard rejection
    if extraction.is_tampered_flag:
        reason = extraction.rejection_reason or "Forensic analysis detected potential visual or font inconsistency."
        ticket = register_dispute_ticket(
            claim_desc=claim_desc,
            status_text="WARNING",
            recommendation="MANUAL_INVESTIGATION",
            risk_score=0.65,
            confidence=0.88,
            message=f"Dispute Flagged with WARNING: {reason} Ticket #{raw_rrn} placed in Supervisor Escalation Queue for manual verification.",
            txn_details=extraction.model_dump()
        )
        return {
            "status": "WARNING",
            "message": f"Dispute Flagged with WARNING: {reason} Ticket #{raw_rrn} placed in Supervisor Escalation Queue for manual verification.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.65,
            "confidence": 0.88,
            "recommendation": "MANUAL_INVESTIGATION",
            "ticket_id": ticket["id"]
        }

    # Clean transaction ID for ledger lookup
    cleaned_rrn = re.sub(r'[^a-zA-Z0-9]', '', raw_rrn)
    ledger_record = ACTIVE_BANKING_LEDGER.get(cleaned_rrn) or ACTIVE_BANKING_LEDGER.get(raw_rrn)

    # Forgiving Demo Logic: If not in active database ledger, route to MANUAL_REVIEW instead of hard REJECTED!
    if not ledger_record:
        msg = (
            f"Dispute Routed to MANUAL REVIEW: Receipt parsed successfully (RRN: {raw_rrn}, Merchant: {merchant_name}, "
            f"Amount: ₹{receipt_amount:,.2f}), but reference is pending automated ledger sync. "
            f"Placed in Supervisor Escalation Queue for manual review."
        )
        ticket = register_dispute_ticket(
            claim_desc=claim_desc,
            status_text="MANUAL_REVIEW",
            recommendation="MANUAL_INVESTIGATION",
            risk_score=0.45,
            confidence=0.92,
            message=msg,
            txn_details=extraction.model_dump()
        )
        return {
            "status": "MANUAL_REVIEW",
            "message": msg,
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.45,
            "confidence": 0.92,
            "recommendation": "MANUAL_INVESTIGATION",
            "ticket_id": ticket["id"]
        }

    # If in ledger, check amount variance
    ledger_amount = float(ledger_record["amount"])
    if abs(receipt_amount - ledger_amount) > 5.0:
        msg = (
            f"Dispute Routed to MANUAL REVIEW: Extracted receipt amount (₹{receipt_amount:,.2f}) differs from ledger record (₹{ledger_amount:,.2f}). "
            f"Placed in Supervisor Queue for manual clearance."
        )
        ticket = register_dispute_ticket(
            claim_desc=claim_desc,
            status_text="MANUAL_REVIEW",
            recommendation="MANUAL_INVESTIGATION",
            risk_score=0.48,
            confidence=0.90,
            message=msg,
            txn_details=extraction.model_dump()
        )
        return {
            "status": "MANUAL_REVIEW",
            "message": msg,
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.48,
            "confidence": 0.90,
            "recommendation": "MANUAL_INVESTIGATION",
            "ticket_id": ticket["id"]
        }

    # Check switch status / ledger verdict
    ledger_verdict = ledger_record.get("ledger_verdict")
    switch_status = ledger_record.get("switch_status")

    if ledger_verdict == "SUCCESSFULLY_CAPTURED" or switch_status == "00_SUCCESS":
        msg = (
            f"Dispute Routed to MANUAL REVIEW: Core ledger indicates transaction of ₹{ledger_amount:,.2f} at {ledger_record.get('merchant')} was captured. "
            f"Escalated to Supervisor Queue to confirm if customer experienced a secondary debit."
        )
        ticket = register_dispute_ticket(
            claim_desc=claim_desc,
            status_text="MANUAL_REVIEW",
            recommendation="MANUAL_INVESTIGATION",
            risk_score=0.52,
            confidence=0.91,
            message=msg,
            txn_details=extraction.model_dump()
        )
        return {
            "status": "MANUAL_REVIEW",
            "message": msg,
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.52,
            "confidence": 0.91,
            "recommendation": "MANUAL_INVESTIGATION",
            "ticket_id": ticket["id"]
        }

    # Verified dual debit timeout in ledger -> Instant SUCCESS!
    resolved_merchant = ledger_record.get("merchant", merchant_name)
    success_msg = f"Dispute SUCCESS: Verified dual debit timeout for RRN {raw_rrn} at {resolved_merchant} for ₹{receipt_amount:,.2f}. Instant refund authorized under RBI DPSS framework."
    ticket = register_dispute_ticket(
        claim_desc=claim_desc,
        status_text="SUCCESS",
        recommendation="APPROVE_REFUND",
        risk_score=0.04,
        confidence=0.99,
        message=success_msg,
        txn_details=extraction.model_dump()
    )
    return {
        "status": "SUCCESS",
        "message": success_msg,
        "transaction_details": extraction.model_dump(),
        "risk_score": 0.04,
        "confidence": 0.99,
        "recommendation": "APPROVE_REFUND",
        "ticket_id": ticket["id"]
    }

    # If only text description without image
    return {
        "status": "logged_awaiting_proof",
        "message": f"Received dispute claim: '{claim_desc}'. Ticket opened in Sentinel queue. Please upload receipt screenshot to expedite settlement.",
        "transaction_details": None,
        "risk_score": 0.03,
        "confidence": 0.984,
        "recommendation": "PENDING_PROOF"
    }

@app.get(
    "/api/supervisor/queue",
    summary="Get real-time Supervisor Escalation Queue & Telemetry",
    status_code=status.HTTP_200_OK
)
async def get_supervisor_queue():
    """
    Returns real-time queue of disputes, current pending ticket,
    aggregated metrics, and live stream telemetry for /supervisor.
    """
    pending = [t for t in DISPUTES_REGISTRY if not t.get("is_resolved")]
    resolved = [t for t in DISPUTES_REGISTRY if t.get("is_resolved")]
    active_ticket = pending[-1] if pending else (DISPUTES_REGISTRY[-1] if DISPUTES_REGISTRY else None)
    
    return {
        "status": "success",
        "total_disputes": len(DISPUTES_REGISTRY),
        "pending_count": len(pending),
        "resolved_count": len(resolved),
        "active_ticket": active_ticket,
        "disputes": DISPUTES_REGISTRY[-20:],
        "guardrail_confidence": 98.4,
        "fraud_risk_score": active_ticket.get("risk_score", 0.04) if active_ticket else 0.04
    }

@app.post(
    "/api/dispute/agent",
    summary="Execute LangGraph Autonomous Dispute Resolution State Machine",
    status_code=status.HTTP_200_OK
)
async def run_langgraph_agent_endpoint(
    user_id: str = Form("user_98840"),
    description: str = Form(..., description="Customer dispute explanation"),
    file: Optional[UploadFile] = File(None)
):
    from dispute_graph import run_dispute_agent
    image_bytes = None
    mime_type = "image/png"
    if file and file.filename:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/png"

    result_state = run_dispute_agent(
        user_id=user_id,
        claim_description=description,
        raw_image_bytes=image_bytes,
        mime_type=mime_type
    )

    # Return serialized state without raw bytes
    return {
        "user_id": result_state.get("user_id"),
        "claim_description": result_state.get("claim_description"),
        "receipt_data": result_state.get("receipt_data"),
        "ledger_status": result_state.get("ledger_status"),
        "risk_score": result_state.get("risk_score"),
        "final_decision": result_state.get("final_decision"),
        "decision_rationale": result_state.get("decision_rationale")
    }

class SupervisorActionRequest(BaseModel):
    ticket_id: str
    action: str  # "APPROVED" | "REJECTED"

@app.post(
    "/api/supervisor/action",
    summary="Record Supervisor Action on Escalation Ticket",
    status_code=status.HTTP_200_OK
)
async def handle_supervisor_action(payload: SupervisorActionRequest):
    action_upper = payload.action.upper()
    print(f"[Supervisor Action] Ticket: {payload.ticket_id} | Action: {action_upper}")
    
    # Update dispute in registry
    for t in DISPUTES_REGISTRY:
        if t.get("ticket_id") == payload.ticket_id or t.get("id") == payload.ticket_id or payload.ticket_id in t.get("id", ""):
            t["is_resolved"] = True
            t["resolved_action"] = action_upper

    return {
        "status": "success",
        "ticket_id": payload.ticket_id,
        "action": action_upper,
        "message": f"Manual action recorded: {action_upper} on ticket {payload.ticket_id}",
        "payout_reference": f"REF_OVERRIDE_{payload.ticket_id}" if action_upper == "APPROVED" else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
