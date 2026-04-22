# backtest.py
import pandas as pd
import os
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

CACHE_DIR = os.getenv("CACHE_DIR", "./cache")
PORTFOLIO_PATH = os.getenv("PORTFOLIO_PATH", "./portfolio.csv")
OUTPUT_PATH = os.getenv("BACKTEST_OUTPUT", "./backtest_result.csv")
BENCHMARK_PATH = os.getenv("BENCHMARK_OUTPUT", "./benchmark_result.csv")

START_DATE = os.getenv("BACKTEST_START", "2024-01-19")
END_DATE = os.getenv("BACKTEST_END", "2026-01-16")


def run_backtest() -> pd.Series:
    """
    Runs a simple equal-weight backtest over the stocks in portfolio.csv.
    Price history is loaded from the local cache.
    Saves results to backtest_result.csv and prints key metrics.
    """
    # --- Benchmark ---
    print(f"📥 Downloading N225 benchmark ({START_DATE} → {END_DATE})…")
    raw = yf.download("^N225", start=START_DATE, end=END_DATE, progress=False)
    bench_prices = raw["Close"].squeeze()
    bench_returns = bench_prices.pct_change().dropna()
    bench_cumulative = (1 + bench_returns).cumprod()

    # --- Portfolio ---
    if not os.path.exists(PORTFOLIO_PATH):
        raise FileNotFoundError(
            f"Portfolio file not found: {PORTFOLIO_PATH}\n"
            "Run fundamentals.py to generate it first."
        )

    portfolio = pd.read_csv(PORTFOLIO_PATH)
    codes = portfolio["Code"].astype(str).tolist()

    price_data: dict[str, pd.Series] = {}
    for code in codes:
        path = os.path.join(CACHE_DIR, f"{code}.csv")
        if not os.path.exists(path):
            print(f"  ⚠️  {code}: cache not found — skipping")
            continue
        df = pd.read_csv(path, parse_dates=["Date"])
        df = df.sort_values("Date").set_index("Date")
        price_data[code] = df["AdjC"]

    if not price_data:
        raise ValueError(
            "No price data loaded. Ensure cache files exist in CACHE_DIR."
        )

    # --- Equal-weight portfolio returns ---
    prices = pd.DataFrame(price_data).dropna()
    returns = prices.pct_change().dropna()
    portfolio_returns = returns.mean(axis=1)
    cumulative = (1 + portfolio_returns).cumprod()
    cumulative.name = "Portfolio"

    # --- Save ---
    cumulative.to_csv(OUTPUT_PATH)

    bench_aligned = bench_cumulative.reindex(cumulative.index, method="ffill")
    bench_aligned = bench_aligned / bench_aligned.iloc[0]
    bench_aligned.name = "Benchmark"
    bench_aligned.to_csv(BENCHMARK_PATH)

    # --- Metrics ---
    total_return = (cumulative.iloc[-1] - 1) * 100
    mdd = ((cumulative / cumulative.cummax()) - 1).min() * 100
    cagr = (cumulative.iloc[-1] ** (252 / len(cumulative)) - 1) * 100
    sharpe = (
        portfolio_returns.mean() / portfolio_returns.std() * (252 ** 0.5)
    )
    bench_total = (float(bench_cumulative.iloc[-1]) - 1) * 100

    print(f"\n✅ Backtest complete!")
    print(f"   Period    : {cumulative.index[0].date()} → {cumulative.index[-1].date()}")
    print(f"   Return    : {total_return:.2f}%")
    print(f"   MDD       : {mdd:.2f}%")
    print(f"   CAGR      : {cagr:.2f}%")
    print(f"   Sharpe    : {sharpe:.2f}")
    print(f"   N225      : {bench_total:.2f}%")

    return cumulative


if __name__ == "__main__":
    run_backtest()
