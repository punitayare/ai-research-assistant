from groq import Groq
import os
import json
import re

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def extract_json(text: str):
    """
    Safely extract JSON from LLM output
    even if model adds extra text.
    """
    try:
        # Try direct parse first
        return json.loads(text)
    except:
        pass

    # Extract JSON block using regex
    match = re.search(r"\{.*\}", text, re.DOTALL)

    if match:
        try:
            return json.loads(match.group())
        except:
            return None

    return None


def generate_flashcards(
    text: str,
    language: str = "English",
):

    try:

        prompt = f"""
You are an AI research assistant.

Generate exactly 10 high-quality flashcards from the research paper.

STRICT RULES:
- Output MUST be valid JSON only
- No markdown
- No explanations
- No extra text before or after JSON
- No trailing commas
- Language: {language}

FORMAT:
{{
  "flashcards": [
    {{
      "question": "string",
      "answer": "string"
    }}
  ]
}}

Content:
{text[:12000]}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You return ONLY valid JSON. No extra text."
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1500,
        )

        raw_response = response.choices[0].message.content

        print("\nRAW FLASHCARD RESPONSE:\n")
        print(raw_response)

        # ✅ SAFE PARSING
        parsed_json = extract_json(raw_response)

        if not parsed_json:
            return {"flashcards": []}

        if "flashcards" not in parsed_json:
            return {"flashcards": []}

        # Optional: enforce list
        if not isinstance(parsed_json["flashcards"], list):
            return {"flashcards": []}

        return parsed_json

    except Exception as e:

        print("\nFLASHCARD GENERATION ERROR:")
        print(str(e))

        return {"flashcards": []}