
from fastapi import APIRouter
from pathlib import Path
from pydantic import BaseModel
import json

from app.rag.pdf_parser import (
    extract_text_from_pdf,
)

from app.api.summarizer import (
    generate_summary,
)

from app.api.flashcards import (
    generate_flashcards,
)

router = APIRouter()

STUDY_DIR = Path("study_uploads")


# =========================
# REQUEST MODELS
# =========================

class SummaryRequest(
    BaseModel
):

    filename: str

    language: str


class FlashcardRequest(
    BaseModel
):

    filename: str

    language: str


# =========================
# SUMMARIZE PDF
# =========================

@router.post("/summarize")
async def summarize_pdf(
    request: SummaryRequest
):

    file_path = (
        STUDY_DIR
        / request.filename
    )

    print(
        "\nSUMMARY REQUEST:"
    )

    print(
        "Filename:",
        request.filename
    )

    print(
        "Language:",
        request.language
    )

    print(
        "Path:",
        file_path
    )

    if not file_path.exists():

        return {
            "summary":
            f"PDF not found: "
            f"{request.filename}"
        }

    text = extract_text_from_pdf(
        str(file_path)
    )

    print(
        "\nTEXT EXTRACTED"
    )

    print(text[:500])

    summary = generate_summary(
        text,
        request.language,
    )

    return {
        "summary": summary
    }


# =========================
# GENERATE FLASHCARDS
# =========================

@router.post("/flashcards")
async def flashcards_pdf(
    request: FlashcardRequest
):

    file_path = (
        STUDY_DIR
        / request.filename
    )

    print(
        "\nFLASHCARD REQUEST:"
    )

    print(
        "Filename:",
        request.filename
    )

    print(
        "Language:",
        request.language
    )

    if not file_path.exists():

        return {
            "flashcards": []
        }

    text = extract_text_from_pdf(
        str(file_path)
    )

    flashcards_raw = (
        generate_flashcards(
            text,
            request.language,
        )
    )

    try:

        # STRING JSON → PYTHON

        if isinstance(
            flashcards_raw,
            str
        ):

            flashcards_raw = (
                json.loads(
                    flashcards_raw
                )
            )

        # EXTRACT ARRAY

        if isinstance(
            flashcards_raw,
            dict
        ):

            flashcards = (
                flashcards_raw.get(
                    "flashcards",
                    [],
                )
            )

        else:

            flashcards = []

        return {
            "flashcards":
            flashcards
        }

    except Exception as e:

        print(
            "\nFLASHCARD ERROR:"
        )

        print(str(e))

        return {
            "flashcards": [],
            "error": str(e),
            "raw": flashcards_raw,
        }

