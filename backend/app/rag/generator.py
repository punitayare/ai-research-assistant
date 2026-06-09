from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()


def get_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not set"
        )

    return Groq(api_key=api_key)


def generate_response(query: str, context_chunks):

    client = get_client()

    context = "\n\n".join(
        chunk["content"]
        for chunk in context_chunks
    )

    prompt = f"""
You are an AI academic research assistant.

Answer ONLY from the provided context.

If the answer is not found in the context,
say:
"I could not find this information in the uploaded documents."

Provide concise and accurate academic answers.

CONTEXT:
{context}

QUESTION:
{query}

ANSWER:
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    return response.choices[0].message.content