import base64
import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field
from openai import AsyncOpenAI

# ---------------------------------------------------------
# Auto-load .env file if present
# ---------------------------------------------------------
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

# ---------------------------------------------------------
# Pydantic Schema for Structured Outputs
# ---------------------------------------------------------
class ReceiptData(BaseModel):
    transaction_id: str = Field(
        ...,
        description="The unique transaction ID, UPI reference number (RRN), or order ID extracted from the receipt."
    )
    amount: float = Field(
        ...,
        description="The numerical monetary value of the transaction (e.g. 2450.00)."
    )
    timestamp: str = Field(
        ...,
        description="The date and time of the transaction in ISO 8601 or standard readable format (e.g., '2026-10-21 10:39:12')."
    )
    recipient_name: str = Field(
        ...,
        description="The name of the merchant, store, or individual recipient (e.g., 'Starbucks Coffee', 'Swiggy')."
    )
    is_tampered_flag: bool = Field(
        ...,
        description="True if the image exhibits visual anomalies, spliced text, mismatched fonts, or signs of manipulation; False otherwise."
    )

# ---------------------------------------------------------
# Lazy OpenAI Client Initialization
# ---------------------------------------------------------
def get_openai_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY is not set. Please set it in your environment or in a .env file. "
            "Example in PowerShell: $env:OPENAI_API_KEY='sk-...'"
        )
    return AsyncOpenAI(api_key=api_key)

async def parse_receipt_image(
    image_bytes: bytes, 
    mime_type: str = "image/png"
) -> ReceiptData:
    """
    Parses an uploaded receipt or transaction screenshot using OpenAI GPT-4o
    with Structured Outputs and returns a validated ReceiptData object.

    :param image_bytes: Raw bytes of the image file.
    :param mime_type: MIME type of the uploaded file (e.g., 'image/png', 'image/jpeg').
    :return: Validated ReceiptData Pydantic instance.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Graceful fallback for local demo/hackathon testing if API key is not yet configured
    if not api_key or api_key.startswith("sk-placeholder") or api_key == "your_openai_api_key_here":
        return ReceiptData(
            transaction_id="402919829103",
            amount=2450.00,
            timestamp="2026-10-21 10:39:12",
            recipient_name="Starbucks Coffee Indiranagar",
            is_tampered_flag=False
        )

    aclient = get_openai_client()

    base64_encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_encoded_image}"

    system_prompt = (
        "You are an expert fintech vision and document-forensics auditor for Paytm Sentinel / DisputeX. "
        "Analyze the provided payment receipt or passbook screenshot. "
        "Extract the exact transaction identifier (UPI RRN / Txn ID), numerical amount, transaction timestamp, "
        "and merchant/recipient name. Perform a visual tampering inspection (check for font inconsistencies, "
        "compression artifacts around numbers, aligned edges, or overlay text) and set is_tampered_flag accordingly."
    )

    completion = await aclient.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "Extract the transaction metadata and check for tampering in this receipt."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": data_url,
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        response_format=ReceiptData,
    )

    parsed_result = completion.choices[0].message.parsed
    if not parsed_result:
        raise ValueError("Failed to parse structured output from GPT-4o vision response.")

    return parsed_result
