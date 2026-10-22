import base64
import json
import os
from pydantic import BaseModel, Field
from openai import AsyncOpenAI

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
        description="The date and time of the transaction in standard readable format (e.g., '2026-10-21 10:39:12')."
    )
    recipient_name: str = Field(
        ...,
        description="The name of the merchant, store, or individual recipient (e.g., 'Starbucks Coffee', 'Swiggy')."
    )
    is_tampered_flag: bool = Field(
        ...,
        description="True if the image exhibits visual anomalies, spliced text, mismatched fonts, or signs of manipulation; False otherwise."
    )

def get_openai_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

async def parse_receipt_image(
    image_bytes: bytes, 
    mime_type: str = "image/png"
) -> ReceiptData:
    """
    Parses an uploaded receipt using OpenAI GPT-4o with structured outputs (JSON mode)
    and returns a validated ReceiptData object.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured in the environment.")

    base64_encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_encoded_image}"

    system_prompt = (
        "You are an expert fintech document auditor and fraud detection AI for Paytm Sentinel / DisputeX. "
        "Analyze the uploaded receipt screenshot. Extract the transaction details and inspect for visual tampering.\n"
        "You MUST respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "transaction_id": "string",\n'
        '  "amount": float,\n'
        '  "timestamp": "string",\n'
        '  "recipient_name": "string",\n'
        '  "is_tampered_flag": boolean\n'
        "}"
    )

    client = get_openai_client()

    completion = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract metadata and detect tampering for this transaction receipt."},
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
        response_format={"type": "json_object"},
        temperature=0.1
    )

    raw_content = completion.choices[0].message.content
    if not raw_content:
        raise ValueError("Empty response received from OpenAI GPT-4o vision.")

    parsed_json = json.loads(raw_content)
    return ReceiptData.model_validate(parsed_json)
