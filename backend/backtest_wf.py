# backtest_wf.py — Walk-Forward Backtest
import pandas as pd
import os
import glob
from dotenv import load_dotenv

load_dotenv()

CACHE_DIR = os.getenv("CACHE_DIR", "./cache")
OUTPUT_PATH = os.getenv("WF_BACKTEST_OUTPUT", "./wf_backtest_result.csv")

# Rebalancing schedule: list of ISO date strings.
# The strategy is evaluated on each date and held until the next.
REBALANCE_DATES: list[str] = ["2025-01-20", "2025-07-01"]
END_DATE: str = "2026-01-16"

MIN_HISTORY_DAYS: int = 252
TOP_N: int = 20


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_all_prices() -> pd.DataFrame:
    """Loads adjusted close prices for all stocks in the cache directory."""
    files = glob.glob(os.path.join(CACHE_DIR, "*.csv"))
    if not files:
        raise FileNotFoundError(
            f"No cache files found in {CACHE_DIR}. "
            "Run fundamentals.py to populate the cache first."
        )

    price_data: dict[str, pd.Series] = {}
    for f in files:
        code = os.path.basename(f).split(".")[0]
        df = pd.read_csv(f, parse_dates=["Date"])
        df = df.sort_values("Date").set_index("Date")
        if "AdjC" in df.columns:
            price_data[code] = df["AdjC"]

    return pd.DataFrame(price_data)


# ---------------------------------------------------------------------------
# Stock selection
# ---------------------------------------------------------------------------

def select_top_n(
    prices: pd.DataFrame,
    as_of_date: str,
    n: int = TOP_N,
) -> list[str]:
    """
    Selects the top-n stocks by Sharpe (momentum / volatility) as of a given
    date, using only historical data available up to that date.
    """
    hist = prices[prices.index <= as_of_date].dropna(axis=1)

    results: list[dict] = []
    for code in hist.columns:
        s = hist[code].dropna()
        if len(s) < MIN_HISTORY_DAYS:
            continue
        momentum = (s.iloc[-1] / s.iloc[-MIN_HISTORY_DAYS] - 1) * 100
        volatility = s.pct_change().std() * (MIN_HISTORY_DAYS ** 0.5) * 100
        if volatility <= 0:
            continue
        results.append({"Code": code, "Sharpe": momentum / volatility})

    if not results:
        raise ValueError(
            f"No stocks passed screening criteria as of {as_of_date}. "
            "Check that cache covers this period."
        )

    top = (
        pd.DataFrame(results)
        .sort_values("Sharpe", ascending=False)
        .head(n)["Code"]
        .tolist()
    )
    print(f"   Stocks selected ({len(top)}): {top}")
    return top


# ---------------------------------------------------------------------------
# Walk-forward engine
# ---------------------------------------------------------------------------

def run_wf_backtest() -> pd.Series:
    """
    Runs a walk-forward backtest:
      1. At each rebalance date, rank all stocks by historical Sharpe.
      2. Hold the top-N equal-weight portfolio until the next rebalance date.
      3. Chain all periods together into a single cumulative return series.

    Returns a pd.Series of cumulative portfolio value (starting at 1.0).
    """
    print("📦 Loading price data…")
    prices = load_all_prices()

    cumulative = pd.Series(dtype=float)
    current_value = 1.0

    for i, start in enumerate(REBALANCE_DATES):
        end = REBALANCE_DATES[i + 1] if i + 1 < len(REBALANCE_DATES) else END_DATE

        print(f"\n📅 Rebalance {i + 1}/{len(REBALANCE_DATES)}: {start} → {end}")
        codes = select_top_n(prices, as_of_date=start)

        period_prices = prices.loc[start:end, codes].dropna()
        if period_prices.empty:
            print(f"   ⚠️  No price data for {start}→{end}, skipping period")
            continue

        period_returns = period_prices.pct_change().dropna()
        port_returns = period_returns.mean(axis=1)
        period_cum = (1 + port_returns).cumprod() * current_value
        current_value = float(period_cum.iloc[-1])
        cumulative = pd.concat([cumulative, period_cum])

    if cumulative.empty:
        raise ValueError("Backtest produced no results. Check price data.")

    # --- Metrics ---
    total_return = (cumulative.iloc[-1] - 1) * 100
    mdd = ((cumulative / cumulative.cummax()) - 1).min() * 100
    cagr = (cumulative.iloc[-1] ** (252 / len(cumulative)) - 1) * 100
    daily_r = cumulative.pct_change().dropna()
    sharpe = daily_r.mean() / daily_r.std() * (252 ** 0.5)

    print(f"\n✅ Walk-Forward Backtest complete!")
    print(f"   Period : {cumulative.index[0].date()} → {cumulative.index[-1].date()}")
    print(f"   Return : {total_return:.2f}%")
    print(f"   MDD    : {mdd:.2f}%")
    print(f"   CAGR   : {cagr:.2f}%")
    print(f"   Sharpe : {sharpe:.2f}")

    cumulative.name = "Portfolio"
    cumulative.to_csv(OUTPUT_PATH)
    return cumulative


if __name__ == "__main__":
    run_wf_backtest()
