from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from app.api.rag_upload import router as rag_router
from app.api.study_upload import router as study_upload_router
from app.api.chat import router as chat_router
from app.api.study import router as study_router

app = FastAPI(
    title="AI Research Assistant"
)

origins = [
    "http://localhost:3000",
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
    name="uploads"
)

app.mount(
    "/study_uploads",
    StaticFiles(directory="study_uploads"),
    name="study_uploads"
)

# ROUTERS

app.include_router(rag_router)

app.include_router(study_upload_router)

app.include_router(chat_router)

app.include_router(study_router)
from app.api import mindmap

app.include_router(
    mindmap.router,
    prefix="/api"
)

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