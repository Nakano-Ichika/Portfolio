# risk_model.py
import pandas as pd


def calculate_position_size(
    df: pd.DataFrame, total_capital: float = 1_000_000
) -> pd.DataFrame:
    """
    Inverse-volatility position sizing.
    Stocks with lower volatility receive a proportionally larger allocation.

    Args:
        df:            DataFrame with at least [Code, Volatility_pct] columns.
        total_capital: Total capital to allocate in JPY (default 1,000,000).

    Returns:
        DataFrame with [Code, Volatility_pct, weight, position_yen] columns.
    """
    df = df.copy()

    # Drop zero-volatility rows to avoid division by zero
    df = df[df["Volatility_pct"] > 0].reset_index(drop=True)

    if df.empty:
        return pd.DataFrame(columns=["Code", "Volatility_pct", "weight", "position_yen"])

    df["inv_vol"] = 1.0 / df["Volatility_pct"]
    df["weight"] = df["inv_vol"] / df["inv_vol"].sum()
    df["position_yen"] = (df["weight"] * total_capital).round(0)

    return df[["Code", "Volatility_pct", "weight", "position_yen"]]
