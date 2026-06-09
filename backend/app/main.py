from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("study_uploads", exist_ok=True)

# Debug imports
print("IMPORTING rag_upload")
from app.api.rag_upload import router as rag_router

print("IMPORTING study_upload")
from app.api.study_upload import router as study_upload_router

print("IMPORTING chat")
from app.api.chat import router as chat_router

print("IMPORTING study")
from app.api.study import router as study_router

print("IMPORTING mindmap")
from app.api import mindmap

print("CREATING APP")

app = FastAPI(
    title="AI Research Assistant"
)


@app.on_event("startup")
async def startup():
    print("FASTAPI STARTUP COMPLETE")


# CORS
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

# Static folders
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

# Routers
app.include_router(rag_router)
app.include_router(study_upload_router)
app.include_router(chat_router)
app.include_router(study_router)

app.include_router(
    mindmap.router,
    prefix="/api"
)

# Health routes
@app.get("/")
async def root():
    return {
        "message": "Backend running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }