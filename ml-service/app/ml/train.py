import pandas as pd
import joblib 
import math
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score


DATASET_PATH = "datasets/dataset.csv"
CD_MODEL_PATH = "models/cd_model.pkl"
CL_MODEL_PATH = "models/cl_model.pkl"

# load dataset
df = pd.read_csv(DATASET_PATH)

# preprocess data
# drop non-numeric columns
encoder = LabelEncoder()
df["geometry_type"] = encoder.fit_transform(df["geometry_type"])

# drop rows with NaN values
df = df.dropna()

# define features and targets
X = df.drop(columns=["drag", "lift"])
y_cd = df["drag"]
y_cl = df["lift"]

# split data into training and testing sets (same random_state for consistent split)
X_train, X_test, y_cd_train, y_cd_test = train_test_split(X, y_cd, test_size=0.2, random_state=42)
# Use same indices for Cl split
_, _, y_cl_train, y_cl_test = train_test_split(X, y_cl, test_size=0.2, random_state=42)

# ── Train Cd model ──
cd_model = RandomForestRegressor(n_estimators=200, random_state=42)
cd_model.fit(X_train, y_cd_train)

# ── Train Cl model ──
cl_model = RandomForestRegressor(n_estimators=200, random_state=42)
cl_model.fit(X_train, y_cl_train)

# save models and encoder
joblib.dump(cd_model, CD_MODEL_PATH)
joblib.dump(cl_model, CL_MODEL_PATH)
joblib.dump(encoder, "models/encoder.pkl")

print("Models trained and saved successfully!")
print(f"  - Cd model: {CD_MODEL_PATH}")
print(f"  - Cl model: {CL_MODEL_PATH}")

# ── Evaluate Cd model ──
y_cd_pred = cd_model.predict(X_test)

cd_mae = mean_absolute_error(y_cd_test, y_cd_pred)
cd_mse = mean_squared_error(y_cd_test, y_cd_pred)
cd_r2 = r2_score(y_cd_test, y_cd_pred)

print(f"\n{'='*45}")
print(f"  Cd Model Metrics:")
print(f"{'='*45}")
print(f"  MAE:  {cd_mae:.5f}")
print(f"  MSE:  {cd_mse:.5f}")
print(f"  R2:   {cd_r2:.4f}")

# ── Evaluate Cl model ──
y_cl_pred = cl_model.predict(X_test)

cl_mae = mean_absolute_error(y_cl_test, y_cl_pred)
cl_mse = mean_squared_error(y_cl_test, y_cl_pred)
cl_r2 = r2_score(y_cl_test, y_cl_pred)

print(f"\n{'='*45}")
print(f"  Cl Model Metrics:")
print(f"{'='*45}")
print(f"  MAE:  {cl_mae:.5f}")
print(f"  MSE:  {cl_mse:.5f}")
print(f"  R2:   {cl_r2:.4f}")


# Feature importance — which inputs matter most for Cd?
print(f"\n{'='*45}")
print("  Feature Importance (Cd):")
print(f"{'='*45}")
for name, importance in sorted(zip(X.columns, cd_model.feature_importances_), key=lambda x: -x[1]):
    bar = "#" * int(importance * 50)
    print(f"  {name:20s} {importance:.3f} {bar}")

# Feature importance — which inputs matter most for Cl?
print(f"\n{'='*45}")
print("  Feature Importance (Cl):")
print(f"{'='*45}")
for name, importance in sorted(zip(X.columns, cl_model.feature_importances_), key=lambda x: -x[1]):
    bar = "#" * int(importance * 50)
    print(f"  {name:20s} {importance:.3f} {bar}")
