import re
from typing import Tuple, Dict

class PIIMaskingService:
    """
    PII Masking Engine (Section 5.3 of ТЗ):
    Automatically anonymizes sensitive enterprise data (passwords, tokens,
    credit cards, phone numbers, emails) before sending to external LLMs.
    """

    PATTERNS = {
        "CREDIT_CARD": (
            r"\b(?:\d[ -]*?){13,16}\b",
            "[REDACTED_CREDIT_CARD]"
        ),
        "API_TOKEN": (
            r"\b(?:ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{32,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b",
            "[REDACTED_API_TOKEN]"
        ),
        "PASSWORD_IN_TEXT": (
            r"(?i)\b(?:password|пароль|secret|token)\s*[:=]\s*([^\s,;]+)",
            "password: [REDACTED_SECRET]"
        ),
        "PHONE_NUMBER": (
            r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
            "[REDACTED_PHONE]"
        ),
    }

    @classmethod
    def mask_text(cls, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Masks all sensitive patterns in the provided text,
        returning the anonymized text and count of masked entities.
        """
        masked = text
        stats = {}

        for pii_type, (pattern, replacement) in cls.PATTERNS.items():
            matches = len(re.findall(pattern, masked))
            if matches > 0:
                stats[pii_type] = matches
                masked = re.sub(pattern, replacement, masked)

        return masked, stats

pii_masking_service = PIIMaskingService()
