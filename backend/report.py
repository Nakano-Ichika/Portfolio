# report.py
import os
from typing import Union
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Model is configurable via env var — defaults to gemini-2.5-pro
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
    Generates a Japanese-language investment analysis report for a single
    stock using the Gemini API.

    Args:
        code:         JQuants stock code (e.g. 72030).
        momentum_pct: 252-day price momentum in percent.
        per:          Price-to-earnings ratio (0 if unavailable).
        pbr:          Price-to-book ratio (0 if unavailable).
        roe:          Return on equity in percent (0 if unavailable).

    Returns:
        Markdown-formatted report string from Gemini.
    """
    fundamental_section = ""
    if per > 0 or pbr > 0 or roe > 0:
        fundamental_section = f"""
ファンダメンタル指標:
  - PER: {per:.1f}倍
  - PBR: {pbr:.2f}倍
  - ROE: {roe:.1f}%
"""

    prompt = f"""
あなたは日本株の投資アナリストです。以下のデータをもとに、個人投資家向けの簡潔な分析レポートを日本語で作成してください。

銘柄コード: {code}
モメンタム (252日): {momentum_pct:.1f}%
{fundamental_section}
以下の3点でそれぞれ2〜3文にまとめてください。

**分析**: このデータから読み取れる投資シグナルを述べてください。
**リスク**: 注意すべきリスク要因を述べてください。
**投資判断**: 総合的な見解を短く述べてください。

全体で200字以内に収めてください。
""".strip()

    response = model.generate_content(prompt)
    return response.text
