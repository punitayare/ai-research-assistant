import json
import os

from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_mindmap(text: str):

    prompt = f"""
Return ONLY valid JSON.

Format:

{{
  "main_topic": "",
  "methodology": [],
  "dataset": [],
  "results": [],
  "future_work": []
}}
Paper:

{text[:10000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
        response_format={
            "type": "json_object"
        }
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)

    except Exception:

        print("RAW RESPONSE:")
        print(content)

        raise