from fastapi import APIRouter
from pydantic import BaseModel
import json
import os
import requests
from supabase import create_client, Client
import tempfile
from app.api.rag_upload import extract_text_from_pdf
from app.api.summarizer import generate_summary
from app.api.flashcards import generate_flashcards

router = APIRouter()

# =========================
# SUPABASE CONFIG
# =========================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "study-docs"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# =========================
# REQUEST MODELS
# =========================

class SummaryRequest(BaseModel):
    filename: str
    language: str


class FlashcardRequest(BaseModel):
    filename: str
    language: str


# =========================
# DOWNLOAD FROM SUPABASE
# =========================



def get_pdf_text_from_supabase(filename: str):

    file_bytes = supabase.storage.from_(BUCKET_NAME).download(filename)

    # ✅ cross-platform temp file path
    temp_dir = tempfile.gettempdir()
    safe_filename = filename.replace(" ", "_")
    local_path = os.path.join(temp_dir, safe_filename)

    with open(local_path, "wb") as f:
        f.write(file_bytes)

    return local_path


# =========================
# SUMMARIZE PDF
# =========================

@router.post("/summarize")
async def summarize_pdf(request: SummaryRequest):

    file_path = get_pdf_text_from_supabase(request.filename)

    print("\nSUMMARY REQUEST:")
    print("Filename:", request.filename)
    print("Language:", request.language)
    print("Path:", file_path)

    try:

        text = extract_text_from_pdf(file_path)

        print("\nTEXT EXTRACTED")
        print(text[:500])

        summary = generate_summary(text, request.language)

        return {
            "summary": summary
        }

    except Exception as e:

        return {
            "summary": "",
            "error": str(e)
        }


# =========================
# GENERATE FLASHCARDS
# =========================

@router.post("/flashcards")
async def flashcards_pdf(request: FlashcardRequest):

    file_path = get_pdf_text_from_supabase(request.filename)

    print("\nFLASHCARD REQUEST:")
    print("Filename:", request.filename)
    print("Language:", request.language)

    try:

        text = extract_text_from_pdf(file_path)

        flashcards_raw = generate_flashcards(text, request.language)

        # STRING JSON → PYTHON
        if isinstance(flashcards_raw, str):
            flashcards_raw = json.loads(flashcards_raw)

        # EXTRACT ARRAY (KEEP SAME FORMAT AS YOUR ORIGINAL)
        if isinstance(flashcards_raw, dict):
            flashcards = flashcards_raw.get("flashcards", [])
        else:
            flashcards = []

        return {
            "flashcards": flashcards
        }

    except Exception as e:

        print("\nFLASHCARD ERROR:")
        print(str(e))

        return {
            "flashcards": [],
            "error": str(e),
            "raw": flashcards_raw if "flashcards_raw" in locals() else None
        }