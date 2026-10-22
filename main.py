import os
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from receipt_parser import ReceiptData, parse_receipt_image

app = FastAPI(
    title="Paytm Sentinel / DisputeX API",
    description="Vision Guardrail & Automated Dispute Settlement API",
    version="1.0.0"
)

# Enable CORS for the Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "DisputeX Sentinel Vision Engine",
        "model": "gpt-4o (structured outputs)"
    }

@app.post(
    "/api/dispute/parse-receipt",
    response_model=ReceiptData,
    summary="Extract Transaction Metadata from Receipt",
    status_code=status.HTTP_200_OK
)
async def upload_and_parse_receipt(
    file: UploadFile = File(..., description="Receipt image file (JPEG/PNG/WEBP)")
):
    """
    Accepts an uploaded image file, processes it through GPT-4o with structured
    outputs, and returns validated ReceiptData.
    """
    # 1. Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    content_type = file.content_type or "image/png"
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Must be one of: {allowed_types}"
        )

    # 2. Read image bytes
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded file: {str(e)}"
        )

    # 3. Call vision parser with OpenAI structured outputs
    try:
        extracted_data = await parse_receipt_image(
            image_bytes=image_bytes,
            mime_type=content_type
        )
        return extracted_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vision parsing error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

