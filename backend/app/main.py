from dotenv import load_dotenv
load_dotenv()

import os

print("MAIN: START", flush=True)

os.makedirs("uploads", exist_ok=True)
os.makedirs("study_uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

print("MAIN: IMPORTING rag_upload", flush=True)
from app.api.rag_upload import router as rag_router

print("MAIN: IMPORTING study_upload", flush=True)
from app.api.study_upload import router as study_upload_router

print("MAIN: IMPORTING chat", flush=True)
from app.api.chat import router as chat_router

print("MAIN: IMPORTING study", flush=True)
from app.api.study import router as study_router

print("MAIN: IMPORTING mindmap", flush=True)
from app.api import mindmap

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

print("MAIN: CREATING APP", flush=True)

app = FastAPI(title="AI Research Assistant")


@app.on_event("startup")
async def startup():
    print("FASTAPI STARTUP COMPLETE", flush=True)


origins = [
    "http://localhost:3000",
    "https://ai-research-assistant-pied.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.mount(
    "/study_uploads",
    StaticFiles(directory="study_uploads"),
    name="study_uploads",
)

app.include_router(rag_router)
app.include_router(study_upload_router)
app.include_router(chat_router)
app.include_router(study_router)

app.include_router(
    mindmap.router,
    prefix="/api"
)


@app.get("/")
async def root():
    return {"message": "Backend running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}