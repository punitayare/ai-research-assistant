
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_response(query: str, context_chunks):

    # Combine retrieved chunks
    context = "\n\n".join(
        [
            chunk["content"]
            for chunk in context_chunks
        ]
    )

    # Strong RAG prompt
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

    # Generate response
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