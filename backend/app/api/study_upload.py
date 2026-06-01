from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil

router = APIRouter()

STUDY_DIR = Path("study_uploads")
STUDY_DIR.mkdir(exist_ok=True)

# UPLOAD STUDY PDF

@router.post("/study-upload")
async def upload_study_pdf(
    file: UploadFile = File(...)
):

    file_path = STUDY_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "file_url": f"http://127.0.0.1:8000/study_uploads/{file.filename}"
    }

# GET ALL STUDY PDFs

@router.get("/study-uploaded-pdfs")
async def get_study_uploaded_pdfs():

    pdfs = []

    for file in STUDY_DIR.glob("*.pdf"):

        pdfs.append({
            "name": file.name,
            "url": f"http://127.0.0.1:8000/study_uploads/{file.name}"
        })

    return {
        "pdfs": pdfs
    }