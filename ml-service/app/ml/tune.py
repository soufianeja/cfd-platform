"""
tune.py — Model Tuning & Comparison for CFD ML Service

Run this script to:
  A. Compare RandomForest, GradientBoosting, and LinearRegression for both Cd and Cl
  B. Tune RandomForest hyperparameters via GridSearchCV (cv=5)
  C. Save best-tuned models → replaces cd_model.pkl / cl_model.pkl
  D. Save best params → models/best_params.json (train.py reads this automatically)

Usage:
    cd ml-service
    python -m app.ml.tune              # tune on existing dataset
    python -m app.ml.tune --resample   # regenerate 10,000 samples first
"""

import json
import os
import argparse

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import LabelEncoder

# ── Paths ──────────────────────────────────────────────────────────────────────
DATASET_PATH    = "datasets/dataset.csv"
BEST_PARAMS_PATH = "models/best_params.json"
CD_MODEL_PATH   = "models/cd_model.pkl"
CL_MODEL_PATH   = "models/cl_model.pkl"

# ── Candidate models ───────────────────────────────────────────────────────────
CANDIDATE_MODELS = {
    "RandomForest (200)": RandomForestRegressor(n_estimators=200, random_state=42),
    "RandomForest (500)": RandomForestRegressor(n_estimators=500, random_state=42),
    "GradientBoosting":   GradientBoostingRegressor(n_estimators=200, random_state=42),
    "LinearRegression":   LinearRegression(),
}

# ── GridSearchCV param grid ────────────────────────────────────────────────────
PARAM_GRID = {
    "n_estimators":      [100, 200, 500],
    "max_depth":         [10, 20, None],
    "min_samples_split": [2, 5, 10],
}


# ── Data loading ───────────────────────────────────────────────────────────────

def load_data():
    """Load dataset, encode geometry type, return aligned train/test splits."""
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
    print(f"\n  Dataset loaded: {len(df):,} rows | "
          f"train: {len(X_train):,} | test: {len(X_test):,}")
    return X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test


# ── A & B — Model comparison ───────────────────────────────────────────────────

def compare_models(X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test):
    """Train each candidate model, evaluate on test set for both Cd and Cl."""
    print("\n" + "=" * 76)
    print("  A+B — MODEL COMPARISON")
    print("=" * 76)
    print(f"  {'Model':<25} {'Cd R²':>8} {'Cd MAE':>8}   {'Cl R²':>8} {'Cl MAE':>8}")
    print(f"  {'-'*25} {'-'*8} {'-'*8}   {'-'*8} {'-'*8}")

    results = {}
    for name, model in CANDIDATE_MODELS.items():
        # Cd
        model.fit(X_train, y_cd_train)
        cd_r2  = r2_score(y_cd_test,  model.predict(X_test))
        cd_mae = mean_absolute_error(y_cd_test, model.predict(X_test))

        # Cl  (re-fit same estimator on Cl)
        model.fit(X_train, y_cl_train)
        cl_r2  = r2_score(y_cl_test,  model.predict(X_test))
        cl_mae = mean_absolute_error(y_cl_test, model.predict(X_test))

        print(f"  {name:<25} {cd_r2:>8.4f} {cd_mae:>8.4f}   {cl_r2:>8.4f} {cl_mae:>8.4f}")
        results[name] = {
            "cd_r2": cd_r2, "cd_mae": cd_mae,
            "cl_r2": cl_r2, "cl_mae": cl_mae,
        }

    best_name = max(results, key=lambda n: results[n]["cd_r2"])
    print(f"\n  → Best model for Cd: {best_name}  (R²={results[best_name]['cd_r2']:.4f})")
    return results


# ── B — Hyperparameter tuning ──────────────────────────────────────────────────

def tune_hyperparameters(X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test):
    """GridSearchCV on RandomForest for both Cd and Cl."""
    print("\n" + "=" * 76)
    print("  B — HYPERPARAMETER TUNING  (RandomForest · GridSearchCV cv=5)")
    print("=" * 76)

    # ── Cd model ──
    print("  [1/2] Tuning Cd model (drag coefficient)...")
    gs_cd = GridSearchCV(
        RandomForestRegressor(random_state=42),
        PARAM_GRID, cv=5, scoring="r2", n_jobs=-1, verbose=0
    )
    gs_cd.fit(X_train, y_cd_train)
    cd_best_params = gs_cd.best_params_
    cd_r2  = r2_score(y_cd_test, gs_cd.best_estimator_.predict(X_test))
    cd_mae = mean_absolute_error(y_cd_test, gs_cd.best_estimator_.predict(X_test))
    print(f"       Best params : {cd_best_params}")
    print(f"       Test  R²    : {cd_r2:.4f}   MAE: {cd_mae:.4f}")

    # ── Cl model ──
    print("\n  [2/2] Tuning Cl model (lift coefficient)...")
    gs_cl = GridSearchCV(
        RandomForestRegressor(random_state=42),
        PARAM_GRID, cv=5, scoring="r2", n_jobs=-1, verbose=0
    )
    gs_cl.fit(X_train, y_cl_train)
    cl_best_params = gs_cl.best_params_
    cl_r2  = r2_score(y_cl_test, gs_cl.best_estimator_.predict(X_test))
    cl_mae = mean_absolute_error(y_cl_test, gs_cl.best_estimator_.predict(X_test))
    print(f"       Best params : {cl_best_params}")
    print(f"       Test  R²    : {cl_r2:.4f}   MAE: {cl_mae:.4f}")

    return gs_cd.best_estimator_, gs_cl.best_estimator_, cd_best_params, cl_best_params


# ── Save best models & params ──────────────────────────────────────────────────

def save_results(cd_model, cl_model, cd_best_params, cl_best_params):
    """Persist the best-tuned models and write best_params.json."""
    os.makedirs("models", exist_ok=True)

    joblib.dump(cd_model, CD_MODEL_PATH)
    joblib.dump(cl_model, CL_MODEL_PATH)

    best_params = {"cd": cd_best_params, "cl": cl_best_params}
    with open(BEST_PARAMS_PATH, "w") as f:
        json.dump(best_params, f, indent=2)

    print("\n" + "=" * 76)
    print("  RESULTS SAVED")
    print("=" * 76)
    print(f"  ✓  {CD_MODEL_PATH:<35} ← best Cd model (tuned RandomForest)")
    print(f"  ✓  {CL_MODEL_PATH:<35} ← best Cl model (tuned RandomForest)")
    print(f"  ✓  {BEST_PARAMS_PATH:<35} ← params picked up by train.py")
    print()


# ── Entry point ────────────────────────────────────────────────────────────────

def tune_and_compare(resample: bool = False):
    # C — Increase samples
    if resample:
        print("\n  [C] Regenerating dataset with 10,000 samples...")
        from app.ml import generate_data
        generate_data.generate_dataset(num_samples=10_000)

    X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test = load_data()

    compare_models(X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test)

    cd_model, cl_model, cd_best, cl_best = tune_hyperparameters(
        X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test
    )

    save_results(cd_model, cl_model, cd_best, cl_best)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Step 2.8 — Tune & compare ML models for CFD Cd/Cl prediction"
    )
    parser.add_argument(
        "--resample",
        action="store_true",
        help="Regenerate the dataset with 10,000 samples before tuning"
    )
    args = parser.parse_args()
    tune_and_compare(resample=args.resample)
