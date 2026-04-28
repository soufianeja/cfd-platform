import json
import math
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


DATASET_PATH      = "datasets/dataset.csv"
REAL_DATASET_PATH = "datasets/real_simulations.csv"
CD_MODEL_PATH     = "models/cd_model.pkl"
CL_MODEL_PATH     = "models/cl_model.pkl"
BEST_PARAMS_PATH  = "models/best_params.json"
MODEL_INFO_PATH   = "models/model_info.json"


# ── Version helpers ─────────────────────────────────────────────────────────────

def _get_current_version() -> int:
    """Read current model version from model_info.json (default 0)."""
    try:
        with open(MODEL_INFO_PATH) as f:
            return int(json.load(f).get("model_version", 0))
    except (FileNotFoundError, ValueError, KeyError):
        return 0


def _get_next_version() -> int:
    return _get_current_version() + 1


def save_model_info(cd_metrics: dict, cl_metrics: dict, dataset_size: int) -> None:
    """Persist training run metadata to models/model_info.json."""
    info = {
        "model_version": _get_next_version(),
        "training_date": __import__("datetime").datetime.utcnow().isoformat(),
        "dataset_size":  dataset_size,
        "cd_model": {
            "mae":  round(cd_metrics["mae"], 6),
            "rmse": round(math.sqrt(cd_metrics["mse"]), 6),
            "r2":   round(cd_metrics["r2"],  6),
        },
        "cl_model": {
            "mae":  round(cl_metrics["mae"], 6),
            "rmse": round(math.sqrt(cl_metrics["mse"]), 6),
            "r2":   round(cl_metrics["r2"],  6),
        },
    }
    os.makedirs("models", exist_ok=True)
    with open(MODEL_INFO_PATH, "w") as f:
        json.dump(info, f, indent=2)
    print(f"  [versioning] Model v{info['model_version']} saved → {MODEL_INFO_PATH}")


def _load_best_params(target: str) -> dict:
    """
    Load tuned hyperparameters from best_params.json if it exists.

    Returns a dict of kwargs for RandomForestRegressor, or {} to use
    sklearn defaults (n_estimators=200 fallback applied in train_models).

    Args:
        target: "cd" or "cl"
    """
    if os.path.exists(BEST_PARAMS_PATH):
        with open(BEST_PARAMS_PATH) as f:
            best = json.load(f)
        params = best.get(target, {})
        if params:
            print(f"  [tune] Using best params for {target}: {params}")
            return params
    return {}


def train_models():
    # ── Load & preprocess dataset ──────────────────────────────────────────────
    df = pd.read_csv(DATASET_PATH)

    encoder = LabelEncoder()
    df["geometry_type"] = encoder.fit_transform(df["geometry_type"])
    df = df.dropna()

    X    = df.drop(columns=["drag", "lift"])
    y_cd = df["drag"]
    y_cl = df["lift"]

    # Same random_state → aligned test indices for both targets
    X_train, X_test, y_cd_train, y_cd_test = train_test_split(
        X, y_cd, test_size=0.2, random_state=42
    )
    _,       _,      y_cl_train, y_cl_test = train_test_split(
        X, y_cl, test_size=0.2, random_state=42
    )

    # ── Build models using tuned params (or sensible defaults) ─────────────────
    cd_params = _load_best_params("cd") or {"n_estimators": 200}
    cl_params = _load_best_params("cl") or {"n_estimators": 200}

    cd_model = RandomForestRegressor(random_state=42, **cd_params)
    cl_model = RandomForestRegressor(random_state=42, **cl_params)

    cd_model.fit(X_train, y_cd_train)
    cl_model.fit(X_train, y_cl_train)

    # ── Persist models and encoder ─────────────────────────────────────────────
    os.makedirs("models", exist_ok=True)
    joblib.dump(cd_model, CD_MODEL_PATH)
    joblib.dump(cl_model, CL_MODEL_PATH)
    joblib.dump(encoder,  "models/encoder.pkl")

    # ── Evaluate ───────────────────────────────────────────────────────────────
    y_cd_pred = cd_model.predict(X_test)
    cd_metrics = {
        "mae": float(mean_absolute_error(y_cd_test, y_cd_pred)),
        "mse": float(mean_squared_error(y_cd_test,  y_cd_pred)),
        "r2":  float(r2_score(y_cd_test,            y_cd_pred)),
    }

    y_cl_pred = cl_model.predict(X_test)
    cl_metrics = {
        "mae": float(mean_absolute_error(y_cl_test, y_cl_pred)),
        "mse": float(mean_squared_error(y_cl_test,  y_cl_pred)),
        "r2":  float(r2_score(y_cl_test,            y_cl_pred)),
    }

    print("\n=== Cd Model ===")
    print(f"  R²:  {cd_metrics['r2']:.4f}")
    print(f"  MAE: {cd_metrics['mae']:.4f}")
    print("=== Cl Model ===")
    print(f"  R²:  {cl_metrics['r2']:.4f}")
    print(f"  MAE: {cl_metrics['mae']:.4f}")

    # ── Persist versioned model info ───────────────────────────────────────────
    save_model_info(cd_metrics, cl_metrics, dataset_size=len(df))

    return {"cd": cd_metrics, "cl": cl_metrics}


def get_model_info() -> dict:
    """
    Return model metadata for the /training/status endpoint.
    Reads model_info.json if available, otherwise falls back to best_params.json.
    """
    # Primary source: versioned model_info.json
    if os.path.isfile(MODEL_INFO_PATH):
        with open(MODEL_INFO_PATH) as f:
            info = json.load(f)
        # Also surface tuned-params metadata
        tuned = os.path.exists(BEST_PARAMS_PATH)
        info["tuned"] = tuned
        info["status"] = "trained"
        return info

    # Fallback for systems that haven't run a versioned training yet
    tuned = os.path.exists(BEST_PARAMS_PATH)
    best_params = {}
    if tuned:
        with open(BEST_PARAMS_PATH) as f:
            best_params = json.load(f)

    return {
        "model_version": 1,
        "status":        "trained",
        "tuned":         tuned,
        "best_params":   best_params,
        "dataset_path":  DATASET_PATH,
    }


if __name__ == "__main__":
    train_models()
