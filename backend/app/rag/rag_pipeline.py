from app.rag.retriever import retrieve_relevant_chunks
from app.rag.generator import generate_response

def ask_question(
    query: str,
    document_names=None
):

    query_lower = query.lower().strip()

    greetings = {
        "hi": "Hello! Ask me questions about your uploaded PDFs.",
        "hello": "Hi! Upload PDFs and start chatting.",
        "hey": "Hey! How can I help you?"
    }

    if query_lower in greetings:

        return {
            "question": query,
            "answer": greetings[query_lower],
            "sources": []
        }

    chunks = retrieve_relevant_chunks(
        query,
        document_names
    )

    answer = generate_response(
        query,
        chunks
    )

    return {
        "question": query,
        "answer": answer,
        "sources": chunks
    }