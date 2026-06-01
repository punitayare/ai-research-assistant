
from groq import Groq
import os

client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def generate_summary(
    text: str,
    language: str = "English",
):

    try:

        prompt = f"""
You are an advanced AI research assistant.

Generate a well-structured summary
of the research paper.

IMPORTANT:
- The response MUST be in {language}
- Use clear explanations
- Explain technical concepts simply
- Keep it concise but informative

Your summary should include:

1. Overview
2. Main Concepts
3. Important Techniques
4. Key Findings
5. Conclusion

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
                            "You are a helpful "
                            "AI research assistant."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.3,
                max_tokens=1200,
            )
        )

        return (
            response
            .choices[0]
            .message
            .content
        )

    except Exception as e:

        print(
            "\nSUMMARY GENERATION ERROR:"
        )

        print(str(e))

        return (
            "Failed to generate summary."
        )
