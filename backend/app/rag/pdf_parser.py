import fitz
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(
    pdf_path: str,
):

    try:

        text = ""

        pdf = fitz.open(pdf_path)

        for page in pdf:

            text += (
                page.get_text()
                + "\n"
            )

        pdf.close()

        logger.info(
            f"Extracted text from "
            f"{pdf_path}"
        )

        return text

    except Exception:

        logger.exception(
            "PDF extraction failed"
        )

        return ""
    
