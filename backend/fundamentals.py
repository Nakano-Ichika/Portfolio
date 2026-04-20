# fundamentals.py
import requests
import pandas as pd
import yfinance as yf
import os
import glob
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

API_KEY = os.getenv("JQUANTS_API_KEY")
BASE_URL = "https://api.jquants.com/v2/equities/bars/daily"

# ── IMPORTANT: set CACHE_DIR in your .env to point at your actual cache ──
# e.g.  CACHE_DIR=/Users/ichika/quants/cache
CACHE_DIR = os.getenv("CACHE_DIR", "./cache")
SCREENER_OUTPUT = os.getenv("SCREENER_PATH", "./screener_result.csv")
PORTFOLIO_OUTPUT = os.getenv("PORTFOLIO_PATH", "./portfolio.csv")

os.makedirs(CACHE_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Price-based factors
# ---------------------------------------------------------------------------

def get_price_factors_from_cache(code: str, days: int = 400) -> dict:
    """
    Reads cached OHLCV data and computes momentum, volatility, and Sharpe.
    Raises FileNotFoundError if the cache file doesn't exist.
    Raises ValueError if history is insufficient or volatility is zero.
    """
    path = os.path.join(CACHE_DIR, f"{code}.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Cache not found: {path}")

    df = pd.read_csv(path)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").tail(days)

    if df.shape[0] < 252:
        raise ValueError(
            f"{code}: insufficient history ({df.shape[0]} days, need 252)"
        )

    df["Momentum"] = df["AdjC"].pct_change(252) * 100
    df["Volatility"] = df["AdjC"].pct_change().std() * (252 ** 0.5) * 100

    latest = df.dropna(subset=["Momentum"]).iloc[-1]
    vol = float(latest["Volatility"])

    if vol == 0:
        raise ValueError(f"{code}: zero volatility")

    return {
        "Code": code,
        "Momentum_pct": round(float(latest["Momentum"]), 2),
        "Volatility_pct": round(vol, 2),
        "Sharpe": round(float(latest["Momentum"]) / vol, 2),
    }


# ---------------------------------------------------------------------------
# Cache management
# ---------------------------------------------------------------------------

def update_cache(code: str) -> None:
    """Fetches only new data since the last cached date and appends it."""
    path = os.path.join(CACHE_DIR, f"{code}.csv")
    if not os.path.exists(path):
        print(f"⚠️  {code}: no existing cache. Fetch full history first.")
        return

    existing = pd.read_csv(path, parse_dates=["Date"])
    last_date = pd.to_datetime(existing["Date"].max())
    from_date = (last_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    to_date = pd.Timestamp.today().strftime("%Y-%m-%d")

    if from_date >= to_date:
        print(f"   {code}: already up to date ({last_date.date()})")
        return

    headers = {"x-api-key": API_KEY}
    params = {"code": code, "from_date": from_date, "to_date": to_date}
    r = requests.get(BASE_URL, headers=headers, params=params, timeout=10)
    r.raise_for_status()

    records = r.json().get("daily_quotes", [])
    if not records:
        print(f"   {code}: no new data from API")
        return

    new_data = pd.DataFrame(records).rename(
        columns={"AdjustmentClose": "AdjC"}
    )[["Date", "AdjC"]]
    combined = (
        pd.concat([existing, new_data])
        .drop_duplicates("Date")
        .sort_values("Date")
    )
    combined.to_csv(path, index=False)
    print(f"   {code}: updated to {to_date} (+{len(new_data)} rows)")


# ---------------------------------------------------------------------------
# Fundamental factors (Yahoo Finance)
# ---------------------------------------------------------------------------

def get_fundamental_factors(code: str) -> dict:
    """
    Fetches PER, PBR, and ROE from Yahoo Finance.
    JQuants codes are 5-digit (e.g. '72030'); Yahoo uses 4-digit + '.T'.
    Falls back to 0.0 on any error.
    """
    ticker_symbol = f"{str(code)[:-1]}.T"
    try:
        info = yf.Ticker(ticker_symbol).info
        return {
            "PER": round(float(info.get("trailingPE") or 0), 2),
            "PBR": round(float(info.get("priceToBook") or 0), 2),
            "ROE": round(float((info.get("returnOnEquity") or 0) * 100), 2),
        }
    except Exception as e:
        print(f"  ⚠️  {code} fundamentals error: {e}")
        return {"PER": 0.0, "PBR": 0.0, "ROE": 0.0}


# ---------------------------------------------------------------------------
# Universe
# ---------------------------------------------------------------------------

def get_all_listed_prime() -> list:
    """Returns all TSE Prime Market stock codes via JQuants master API."""
    headers = {"x-api-key": API_KEY}
    r = requests.get(
        "https://api.jquants.com/v2/equities/master",
        headers=headers,
        timeout=15,
    )
    r.raise_for_status()
    df = pd.DataFrame(r.json()["data"])
    return df[df["MktNm"] == "プライム"]["Code"].tolist()


# ---------------------------------------------------------------------------
# Single-stock analysis
# ---------------------------------------------------------------------------

def analyze_one(code: str) -> Optional[dict]:
    """
    Combines price factors from cache with fundamental factors from Yahoo.
    Returns None on any failure (stock is silently skipped in screening).
    """
    try:
        price = get_price_factors_from_cache(code)
        fundamental = get_fundamental_factors(code)
        return {**price, **fundamental}
    except Exception as e:
        print(f"  ⚠️  {code} skipped: {e}")
        return None


# ---------------------------------------------------------------------------
# Full screening pass
# ---------------------------------------------------------------------------

def screen_from_cache(top_n: int = 20, workers: int = 8) -> pd.DataFrame:
    """
    Screens every stock in the cache, saves screener_result.csv and
    portfolio.csv (equal-weighted top_n), then returns the full DataFrame.
    """
    # Sanity-check: confirm the cache directory actually has files
    if not os.path.isdir(CACHE_DIR):
        raise FileNotFoundError(
            f"CACHE_DIR not found: '{CACHE_DIR}'\n"
            f"Set CACHE_DIR in your .env file, e.g.:\n"
            f"  CACHE_DIR=/Users/ichika/quants/cache"
        )

    files = glob.glob(os.path.join(CACHE_DIR, "*.csv"))
    if not files:
        raise FileNotFoundError(
            f"No CSV files found in CACHE_DIR: '{CACHE_DIR}'\n"
            "Make sure your price cache files are in that folder."
        )

    codes = [os.path.basename(f).split(".")[0] for f in files]
    print(f"📊 Screening {len(codes)} stocks from: {CACHE_DIR}")

    with ThreadPoolExecutor(max_workers=workers) as executor:
        raw = list(executor.map(analyze_one, codes))

    results = [r for r in raw if r is not None]

    # Guard: fail clearly if every stock was skipped
    if not results:
        raise ValueError(
            f"All {len(codes)} stocks were skipped.\n"
            "Common causes:\n"
            "  1. Cache files have fewer than 252 rows (not enough history)\n"
            "  2. The 'AdjC' column is missing — check your CSV column names\n"
            "  3. CACHE_DIR points to the wrong folder\n"
            f"Current CACHE_DIR = '{CACHE_DIR}'"
        )

    df = pd.DataFrame(results).sort_values("Sharpe", ascending=False).reset_index(drop=True)
    df.to_csv(SCREENER_OUTPUT, index=False)
    print(f"✅ Screener saved → {SCREENER_OUTPUT} ({len(df)} stocks)")

    top = df.head(top_n).copy()
    top["Weight"] = 1.0 / len(top)
    top.to_csv(PORTFOLIO_OUTPUT, index=False)
    print(f"✅ Portfolio saved → {PORTFOLIO_OUTPUT} ({len(top)} stocks)")

    return df


if __name__ == "__main__":
    df = screen_from_cache()
    print(df[["Code", "Sharpe", "Momentum_pct", "Volatility_pct"]].head(20).to_string())
