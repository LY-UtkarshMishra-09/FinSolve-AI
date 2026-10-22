import os
import re
import json
import base64
from typing import Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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
# 3. FastAPI Application Setup
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
    err_text = str(e)
    err_lower = err_text.lower()
    
    if "401" in err_text or "invalid_api_key" in err_lower or "incorrect api key" in err_lower or "unauthorized" in err_lower:
        return "Authentication Failure: The Groq API key in .env is invalid or expired. Please check your GROQ_API_KEY."
    if "429" in err_text or "insufficient_quota" in err_lower or "quota" in err_lower or "rate_limit" in err_lower:
        return "Rate Limit Exceeded: Groq Vision API request quota reached. Please wait a moment and try again."
    if "connection" in err_lower or "timeout" in err_lower or "connect" in err_lower:
        return "Network Timeout: Could not connect to Groq Vision services. Please verify your internet connection."
    if "empty response" in err_lower:
        return "Receipt Unreadable: Groq vision model could not parse text from this image. Please upload a clearer screenshot."
    
    clean = re.sub(r"\{.*?\}", "", err_text).replace("Error code: ", "Status ").strip(" -:")
    return f"Vision Verification Failed: {clean if clean else 'Unable to process receipt image.'}"

# ----------------------------------------------------------------------
# 4. Real Vision Parser Function using Groq (llama-3.2-11b-vision-preview)
# ----------------------------------------------------------------------
async def parse_receipt_with_groq(
    image_bytes: bytes,
    mime_type: str = "image/png"
) -> ReceiptData:
    """
    Converts image to base64, invokes Groq vision model (llama-3.2-11b-vision-preview)
    with strict JSON output, inspects image legitimacy and visual tampering, and extracts transaction metadata.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in the environment. Please add it to your .env file.")

    # Convert uploaded image file to base64 encoding
    base64_encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_encoded_image}"

    client = get_groq_client()

    prompt_instruction = (
        "You are an expert fintech document auditor and forensics AI for Paytm Sentinel / DisputeX.\n"
        "Analyze the uploaded image with strict scrutiny:\n"
        "1. Check if the image is an authentic transaction receipt, payment confirmation screenshot, UPI debit slip, or invoice.\n"
        "2. If the image is a generic/random photo (e.g. animals, nature, people, memes, random objects, wallpapers, solid colors, or 1x1 blank pixels) or any non-financial document, set 'is_valid_receipt' to false, set 'is_tampered_flag' to true, and specify the exact reason in 'rejection_reason'.\n"
        "3. If it is a legitimate receipt, set 'is_valid_receipt' to true, and extract:\n"
        "   - transaction_id: The UPI RRN (12 digits), order reference, or transaction ID.\n"
        "   - amount: Numerical payment amount (float).\n"
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
        model="llama-3.2-11b-vision-preview",
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

    parsed_json = json.loads(raw_content)
    return ReceiptData.model_validate(parsed_json)

# ----------------------------------------------------------------------
# 5. API Endpoints
# ----------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DisputeX Sentinel Vision Engine (Groq)",
        "model": "llama-3.2-11b-vision-preview",
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
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: {human_msg}",
            "transaction_details": None,
            "risk_score": 0.95,
            "confidence": 0.90,
            "recommendation": "REJECT_VISION_ERROR"
        }

    # Validation Check 3: Is it a legitimate financial receipt or generic/invalid image content?
    if not extraction.is_valid_receipt:
        reason = extraction.rejection_reason or "Uploaded image does not appear to be a recognized transaction receipt or payment slip."
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Invalid receipt image. {reason}",
            "transaction_details": None,
            "risk_score": 0.95,
            "confidence": 0.99,
            "recommendation": "REJECT_NON_RECEIPT_IMAGE"
        }

    # Validation Check 4: Forensic Tampering Detection
    if extraction.is_tampered_flag:
        reason = extraction.rejection_reason or "Forensic analysis detected visual tampering or font inconsistencies."
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Security alert. {reason} Claim escalated to Fraud Risk Department.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.99,
            "confidence": 0.99,
            "recommendation": "FLAG_FRAUD"
        }

    # Validation Check 5: Transaction ID / RRN extraction verification
    raw_rrn = (extraction.transaction_id or "").strip()
    if not raw_rrn:
        return {
            "status": "REJECTED",
            "message": "Dispute REJECTED: Could not extract a valid UPI RRN or Transaction ID from the receipt image.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.88,
            "confidence": 0.95,
            "recommendation": "REJECT_UNREADABLE_RRN"
        }

    # Clean transaction ID for ledger lookup
    cleaned_rrn = re.sub(r'[^a-zA-Z0-9]', '', raw_rrn)
    ledger_record = ACTIVE_BANKING_LEDGER.get(cleaned_rrn) or ACTIVE_BANKING_LEDGER.get(raw_rrn)

    # Validation Check 6: Active Core Banking / NPCI Switch Ledger Lookup
    if not ledger_record:
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Transaction ID / RRN '{raw_rrn}' not found in the active core banking / NPCI settlement ledger.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.88,
            "confidence": 0.98,
            "recommendation": "REJECT_RECORD_NOT_FOUND"
        }

    # Validation Check 7: Amount matching against active ledger
    receipt_amount = extraction.amount or 0.0
    ledger_amount = float(ledger_record["amount"])
    if abs(receipt_amount - ledger_amount) > 1.0:
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Amount mismatch. Receipt indicates ₹{receipt_amount:,.2f}, but ledger records ₹{ledger_amount:,.2f}.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.92,
            "confidence": 0.99,
            "recommendation": "REJECT_AMOUNT_MISMATCH"
        }

    # Validation Check 8: Switch status & Ledger verdict validation
    ledger_verdict = ledger_record.get("ledger_verdict")
    switch_status = ledger_record.get("switch_status")

    if ledger_verdict == "SUCCESSFULLY_CAPTURED" or switch_status == "00_SUCCESS":
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Ledger confirms payment of ₹{ledger_amount:,.2f} was successfully captured by {ledger_record.get('merchant')}. No dual debit or gateway timeout detected.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.80,
            "confidence": 0.99,
            "recommendation": "REJECT_ALREADY_CAPTURED"
        }

    if ledger_verdict != "MATCHED_DUAL_DEBIT_TIMEOUT":
        return {
            "status": "REJECTED",
            "message": f"Dispute REJECTED: Ledger status '{ledger_verdict}' does not qualify for autonomous auto-reversal.",
            "transaction_details": extraction.model_dump(),
            "risk_score": 0.75,
            "confidence": 0.95,
            "recommendation": "REJECT_UNQUALIFIED_LEDGER_STATUS"
        }

    # Validation Check 9: SUCCESS - Legitimate receipt + active ledger match + verified timeout
    merchant_name = ledger_record.get("merchant", extraction.recipient_name or "Merchant")
    return {
        "status": "SUCCESS",
        "message": f"Dispute SUCCESS: Verified dual debit timeout for RRN {raw_rrn} at {merchant_name} for ₹{receipt_amount:,.2f}. Instant refund authorized under RBI DPSS framework.",
        "transaction_details": extraction.model_dump(),
        "risk_score": 0.04,
        "confidence": 0.99,
        "recommendation": "APPROVE_REFUND"
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
