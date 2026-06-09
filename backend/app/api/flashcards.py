
from groq import Groq
import os
import json

client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def generate_flashcards(
    text: str,
    language: str = "English",
):

    try:

        prompt = f"""
You are an AI research assistant.

Generate exactly 10 high-quality
flashcards from the research paper.

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text
- Response language MUST be {language}

JSON FORMAT:

{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "..."
    }}
  ]
}}

Flashcard Guidelines:
- Questions should be concise
- Answers should be informative
- Cover important concepts
- Include definitions, techniques,
  findings, and applications

Research Paper Content:

{text[:12000]}
"""

        response = (
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Return ONLY valid JSON."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.3,
                max_tokens=1500,
            )
        )

        raw_response = (
            response
            .choices[0]
            .message
            .content
        )

        print(
            "\nRAW FLASHCARD RESPONSE:\n"
        )

        print(raw_response)

        # VALIDATE JSON

        parsed_json = json.loads(
            raw_response
        )

        return parsed_json

    except Exception as e:

        print(
            "\nFLASHCARD GENERATION ERROR:"
        )

        print(str(e))

        return {
            "flashcards": []
        }
