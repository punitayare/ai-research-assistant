print("CHAT ROUTER IMPORTED", flush=True)
from fastapi import APIRouter
from pydantic import BaseModel

from app.rag.rag_pipeline import ask_question

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    document_names: list[str]

@router.post("/chat")
async def chat(request: ChatRequest):

    response = ask_question(
        request.query,
        request.document_names
    )

    return response