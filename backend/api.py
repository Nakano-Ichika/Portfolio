# api.py — QuantPath FastAPI Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import os
from dotenv import load_dotenv

from factor_model import get_correlation_data, get_factor_importance_data
from risk_model import calculate_position_size
from report import generate_report

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="QuantPath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# File paths (configurable via .env)
# ---------------------------------------------------------------------------

SCREENER_PATH = os.getenv("SCREENER_PATH", "./screener_result.csv")
BACKTEST_PATH = os.getenv("BACKTEST_OUTPUT", "./backtest_result.csv")
PORTFOLIO_PATH = os.getenv("PORTFOLIO_PATH", "./portfolio.csv")


def _load_screener() -> pd.DataFrame:
    if not os.path.exists(SCREENER_PATH):
        raise HTTPException(
            status_code=404,
            detail="Screener data not found. Run fundamentals.py first.",
        )
    df = pd.read_csv(SCREENER_PATH)
    df["Code"] = df["Code"].astype(str)
    return df.sort_values("Sharpe", ascending=False).reset_index(drop=True)


def _load_backtest() -> pd.Series:
    if not os.path.exists(BACKTEST_PATH):
        raise HTTPException(
            status_code=404,
            detail="Backtest results not found. Run backtest.py first.",
        )
    df = pd.read_csv(BACKTEST_PATH, index_col=0, parse_dates=True)
    return df.iloc[:, 0]


# ---------------------------------------------------------------------------
# Screener
# ---------------------------------------------------------------------------

@app.get("/api/screener")
def get_screener():
    """Returns all screened stocks sorted by Sharpe ratio."""
    df = _load_screener()
    return df.to_dict(orient="records")


# ---------------------------------------------------------------------------
# Portfolio / Position sizing
# ---------------------------------------------------------------------------

@app.get("/api/portfolio")
def get_portfolio(capital: float = 1_000_000):
    """
    Returns inverse-volatility position sizes for the screened universe.
    Pass `?capital=5000000` to change the total capital.
    """
    df = _load_screener()
    result = calculate_position_size(df, total_capital=capital)
    return result.to_dict(orient="records")


# ---------------------------------------------------------------------------
# Backtest
# ---------------------------------------------------------------------------

@app.get("/api/backtest")
def get_backtest():
    """Returns the full cumulative return time-series as [{date, value}]."""
    series = _load_backtest()
    return [
        {"date": str(idx.date()), "value": round(float(v), 6)}
        for idx, v in series.items()
    ]


@app.get("/api/backtest/stats")
def get_backtest_stats():
    """Returns summary performance statistics for the backtest."""
    series = _load_backtest()
    daily_r = series.pct_change().dropna()

    total_return = (series.iloc[-1] - 1) * 100
    mdd = ((series / series.cummax()) - 1).min() * 100
    cagr = (series.iloc[-1] ** (252 / len(series)) - 1) * 100
    sharpe = float(daily_r.mean() / daily_r.std() * (252 ** 0.5)) if daily_r.std() > 0 else 0.0

    return {
        "total_return": round(float(total_return), 2),
        "mdd": round(float(mdd), 2),
        "cagr": round(float(cagr), 2),
        "sharpe": round(sharpe, 2),
        "start_date": str(series.index[0].date()),
        "end_date": str(series.index[-1].date()),
    }


# ---------------------------------------------------------------------------
# Factor model
# ---------------------------------------------------------------------------

@app.get("/api/factor/correlation")
def get_correlation():
    """Returns factor correlation matrix data."""
    df = _load_screener()
    return get_correlation_data(df)


@app.get("/api/factor/importance")
def get_importance():
    """Returns RandomForest feature importances for predicting Sharpe."""
    df = _load_screener()
    return get_factor_importance_data(df)


# ---------------------------------------------------------------------------
# AI Report
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    code: str
    momentum_pct: float
    per: float = 0.0
    pbr: float = 0.0
    roe: float = 0.0


@app.post("/api/report")
def get_report(req: ReportRequest):
    """Generates an AI investment report for a single stock via Gemini."""
    text = generate_report(
        req.code, req.momentum_pct, req.per, req.pbr, req.roe
    )
    return {"report": text}


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}
