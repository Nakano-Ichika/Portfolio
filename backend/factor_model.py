# factor_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

PRICE_FACTORS = ["Momentum_pct", "Volatility_pct", "Sharpe"]
FEATURE_FACTORS = ["Momentum_pct", "Volatility_pct"]


def get_correlation_data(df: pd.DataFrame) -> dict:
    """
    Returns factor correlation matrix as JSON-serialisable dict.
    Only includes columns that are actually present in df.
    """
    available = [f for f in PRICE_FACTORS if f in df.columns]
    if len(available) < 2:
        return {"factors": available, "matrix": [], "labels": available}

    corr = df[available].corr().round(3)
    return {
        "factors": available,
        "matrix": corr.values.tolist(),
        "labels": available,
    }


def get_factor_importance_data(df: pd.DataFrame) -> list[dict]:
    """
    Trains a RandomForest to predict Sharpe from price factors and returns
    feature importances as a JSON-serialisable list.

    Returns an empty list if there is not enough data (< 5 rows).
    """
    if "Sharpe" not in df.columns:
        return []

    features = [f for f in FEATURE_FACTORS if f in df.columns]
    if not features or len(df) < 5:
        return []

    X = df[features].fillna(0)
    y = df["Sharpe"]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    return sorted(
        [
            {"factor": f, "importance": round(float(imp), 4)}
            for f, imp in zip(features, model.feature_importances_)
        ],
        key=lambda x: x["importance"],
        reverse=True,
    )
