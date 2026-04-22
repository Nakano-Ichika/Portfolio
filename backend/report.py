# report.py
import os
import json
from typing import Union
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
model = genai.GenerativeModel(_MODEL_NAME)


def generate_report(
    code: Union[int, str],
    momentum_pct: float,
    per: float = 0.0,
    pbr: float = 0.0,
    roe: float = 0.0,
) -> str:
    """
    Generates a structured JSON investment brief for a single stock via Gemini.
    Falls back to raw text if JSON parsing fails.
    """
    fundamentals = []
    if per > 0:
        fundamentals.append(f"PER {per:.1f}x")
    if pbr > 0:
        fundamentals.append(f"PBR {pbr:.2f}x")
    if roe > 0:
        fundamentals.append(f"ROE {roe:.1f}%")
    fundamentals_str = ", ".join(fundamentals) if fundamentals else "not available"

    prompt = f"""You are a quantitative equity analyst. A factor model has already screened and ranked stock {code} (TSE-listed).

Quant model outputs:
- 252-day momentum: {momentum_pct:+.1f}%
- Fundamentals: {fundamentals_str}

Based solely on these model outputs, produce a structured investment brief in this exact JSON format (no markdown, no code fences, just raw JSON):

{{
  "signal": "BUY",
  "signal_strength": 4,
  "catalyst": "One sentence explaining the key short-term driver implied by the momentum signal.",
  "thesis": "2-3 sentences explaining why these factor scores suggest outperformance.",
  "bear_case": "1-2 sentences on the main risk or scenario where this thesis breaks.",
  "valuation_comment": "One sentence on what the valuation multiples suggest (or note if unavailable).",
  "confidence": "MEDIUM",
  "confidence_rationale": "One sentence explaining confidence level based on data completeness."
}}

signal must be one of: BUY, HOLD, SELL, WATCH
signal_strength must be 1-5 (1=weak, 5=strong conviction)
confidence must be one of: HIGH, MEDIUM, LOW
All text fields must be in English. Be concise and grounded in the provided data.""".strip()

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    # Validate it's parseable JSON — return as-is (api.py wraps in {"report": ...})
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        return text
