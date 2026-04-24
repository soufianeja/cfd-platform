# ML Service — Phase 2 Implementation Plan

> **Status**: Phase 1 (MVP) is ✅ COMPLETE.
> This document is the structured implementation guide for Phase 2.

---

## Overview

Phase 2 transforms the ML service from a standalone prototype into a fully integrated platform feature.
Each step builds on the previous one and must be completed in order.

| Step | Task | Difficulty | Status |
|------|------|------------|--------|
| 2.1 | Cd + Cl dataset generation | Easy | ✅ DONE |
| 2.2 | Train two models (Cd & Cl) | Easy | ✅ DONE |
| 2.3 | Update predict endpoint (Cd + Cl) | Easy | ✅ DONE |
| 2.4 | Add `/train` API endpoint | Medium | ⬜ TODO |
| 2.5 | STL feature extraction (trimesh) | Medium | ⬜ TODO |
| 2.6 | Laravel backend integration | Medium | ⬜ TODO |
| 2.7 | Frontend prediction UI | Medium | ⬜ TODO |
| 2.8 | Model tuning & comparison | Easy | ⬜ TODO |

---

## Step 2.1 — Extend Dataset with Lift Coefficient (Cl)

**Goal**: Add a `lift` column to the training dataset so both Cd and Cl can be learned.

**File**: `app/ml/generate_data.py`

### What to add

Define realistic Cl ranges per geometry type:

```python
CL_VALUES = {
    "airfoil":    (0.2,  1.5),   # wings generate lift
    "fsae":       (-3.0, -1.5),  # rear wing = downforce (NEGATIVE!)
    "sedan":      (0.05, 0.30),  # slight lift at speed
    "suv":        (0.10, 0.35),
    "truck":      (0.05, 0.15),
    "cylinder":   (-0.02, 0.02), # symmetric → ~0
    "sphere":     (-0.02, 0.02),
    "flat_plate": (-0.02, 0.02),
    "ahmed_body": (-0.01, 0.15), # depends on slant angle
    "wedge":      (0.05, 0.40),
}
```

Apply Cl physics rules:
- **Airfoils**: `Cl ≈ 2π × angle_of_attack` (thin airfoil theory)
- **FSAE**: Cl is negative (downforce), scales with `rear_wing_angle`
- **Symmetric bodies** (sphere, cylinder): `Cl ≈ 0 + small noise`
- **Vehicles**: small positive lift at speed

Update the CSV header to include `lift`:
```python
# Before: [..., "drag"]
# After:  [..., "drag", "lift"]
```

**Verification**: Re-run `generate_data.py` and confirm the output CSV has both `drag` and `lift` columns.

---

## Step 2.2 — Train Two Models (Cd and Cl)

**Goal**: Train and save two separate models — one for Cd (`cd_model.pkl`) and one for Cl (`cl_model.pkl`).

**File**: `app/ml/train.py`

### What to change

Split targets before training. Use the same `random_state` so train/test splits are aligned:

```python
y_cd = df["drag"]
y_cl = df["lift"]

# Cd split
X_train, X_test, y_cd_train, y_cd_test = train_test_split(
    X, y_cd, test_size=0.2, random_state=42
)
# Cl split — same random_state ensures aligned test indices
_, _, y_cl_train, y_cl_test = train_test_split(
    X, y_cl, test_size=0.2, random_state=42
)

# Train Cd model
cd_model = RandomForestRegressor(n_estimators=200, random_state=42)
cd_model.fit(X_train, y_cd_train)

# Train Cl model
cl_model = RandomForestRegressor(n_estimators=200, random_state=42)
cl_model.fit(X_train, y_cl_train)

# Save both
joblib.dump(cd_model, "models/cd_model.pkl")
joblib.dump(cl_model, "models/cl_model.pkl")

# Evaluate both
print("=== Cd Model ===")
print(f"  R2:   {r2_score(y_cd_test, cd_model.predict(X_test)):.4f}")
print(f"  MAE:  {mean_absolute_error(y_cd_test, cd_model.predict(X_test)):.4f}")
print("=== Cl Model ===")
print(f"  R2:   {r2_score(y_cl_test, cl_model.predict(X_test)):.4f}")
print(f"  MAE:  {mean_absolute_error(y_cl_test, cl_model.predict(X_test)):.4f}")
```

**Verification**: Both `models/cd_model.pkl` and `models/cl_model.pkl` must exist after running training.

---

## Step 2.3 — Update Predict Endpoint to Return Cd + Cl

**Goal**: Load both models and return both predictions from one API call.

### Files to update

#### `app/ml/predict.py`

Load both models and expose a unified prediction function:

```python
cd_model = joblib.load("models/cd_model.pkl")
cl_model = joblib.load("models/cl_model.pkl")

def predict_drag_and_lift(features: dict) -> dict:
    input_vector = build_features(features)  # same preprocessing
    cd = float(cd_model.predict(input_vector)[0])
    cl = float(cl_model.predict(input_vector)[0])
    return {"drag_coefficient": cd, "lift_coefficient": cl}
```

#### `app/api/v1/endpoints/predictions.py`

Update the response schema to include `lift_coefficient`:

```python
class PredictionResponse(BaseModel):
    drag_coefficient: float
    lift_coefficient: float   # NEW
    geometry_type: str
    model_version: str = "2.0"
```

**Sanity check table** after implementing:

| Geometry | Expected Cd | Expected Cl |
|----------|-------------|-------------|
| FSAE     | 0.7 – 1.1   | −3.0 to −1.5 (downforce) |
| Sedan    | 0.25 – 0.35 | 0.05 to 0.30 |
| Airfoil  | 0.005 – 0.02| 0.2 to 1.5 |
| Sphere   | 0.09 – 0.50 | ≈ 0 |
| Cylinder | 0.3 – 1.2   | ≈ 0 |

**Verification**: Call `POST /api/v1/predictions/` and verify the response contains both `drag_coefficient` and `lift_coefficient`.

---

## Step 2.4 — Add `/train` API Endpoint

**Goal**: Trigger model retraining via HTTP — no need to run scripts manually.

### Files to create / modify

#### [NEW] `app/api/v1/endpoints/training.py`

```python
from fastapi import APIRouter, HTTPException, Header
from app.core.config import settings
from app.ml import generate_data, train

router = APIRouter()

@router.post("/train")
async def retrain_model(x_api_key: str = Header(...)):
    if x_api_key != settings.TRAINING_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # 1. Regenerate dataset
    generate_data.generate_dataset()

    # 2. Retrain both models
    metrics = train.train_models()

    # 3. Return updated metrics
    return {
        "status": "success",
        "cd_model": metrics["cd"],
        "cl_model": metrics["cl"],
    }

@router.get("/status")
async def training_status():
    # Return model version, training date, dataset size
    return train.get_model_info()
```

#### [MODIFY] `app/api/v1/router.py`

Register the new training router:

```python
from app.api.v1.endpoints import predictions, training, features

api_router.include_router(training.router, prefix="/training", tags=["Training"])
```

#### [MODIFY] `.env` / `.env.example`

```
TRAINING_API_KEY=your-secret-key-here
```

**Verification**: `POST /api/v1/training/train` with the correct `X-API-Key` header must return model metrics. A wrong key must return `403`.

---

## Step 2.5 — STL Feature Extraction (trimesh)

**Goal**: When a user uploads a `.stl` file, automatically extract geometry features (area, volume, bounding box, frontal area).

### Files to create / modify

#### [NEW] `app/ml/feature_builder.py`

```python
import trimesh

def extract_features_from_stl(stl_path: str) -> dict:
    mesh = trimesh.load(stl_path)
    bounds = mesh.bounding_box.extents  # [length, width, height]
    return {
        "surface_area": float(mesh.area),
        "volume":        float(abs(mesh.volume)),
        "length":        float(bounds[0]),
        "width":         float(bounds[1]),
        "height":        float(bounds[2]),
        "frontal_area":  float(bounds[1] * bounds[2]),
    }

def build_features(geometry_features: dict, simulation_params: dict) -> list:
    """
    Merge geometry features + simulation parameters into a single ML input vector.
    Missing values default to 0.
    """
    return [
        geometry_features.get("surface_area", 0),
        geometry_features.get("volume", 0),
        geometry_features.get("length", 0),
        geometry_features.get("width", 0),
        geometry_features.get("height", 0),
        geometry_features.get("frontal_area", 0),
        simulation_params.get("velocity", 0),
        simulation_params.get("reynolds", 0),
        simulation_params.get("rear_wing_angle", 0),  # FSAE-specific
        simulation_params.get("slant_angle", 0),       # Ahmed-body-specific
    ]
```

#### [NEW] `app/api/v1/endpoints/features.py`

```python
import tempfile, os
from fastapi import APIRouter, UploadFile, File
from app.ml.feature_builder import extract_features_from_stl

router = APIRouter()

@router.post("/extract")
async def extract_features(file: UploadFile = File(...)):
    # 1. Save uploaded STL to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".stl") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # 2. Extract features
    features = extract_features_from_stl(tmp_path)

    # 3. Clean up
    os.unlink(tmp_path)

    return features
```

#### [MODIFY] `app/api/v1/router.py`

```python
from app.api.v1.endpoints import features
api_router.include_router(features.router, prefix="/features", tags=["Features"])
```

#### Install requirement

```
pip install trimesh
# Add to requirements.txt
```

**Extraction flow**:
```
User uploads .stl
      ↓
POST /api/v1/features/extract
      ↓
trimesh extracts: surface_area, volume, length, width, height, frontal_area
      ↓
Return JSON → auto-fill prediction form → predict Cd + Cl
```

**Verification**: Upload a known STL file (e.g. a sphere) and verify the returned bounding box values are physically reasonable.

---

## Step 2.6 — Laravel Backend Integration

**Goal**: Laravel acts as a secure proxy between the frontend and the ML service. The ML service is never called directly from the browser.

### Files to create / modify

#### [NEW] `app/Http/Controllers/Api/MlPredictionController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MlPredictionController extends Controller
{
    public function predict(Request $request)
    {
        $validated = $request->validate([
            'geometry_type' => 'required|string',
            'surface_area'  => 'required|numeric',
            'volume'        => 'required|numeric',
            'length'        => 'required|numeric',
            'width'         => 'required|numeric',
            'height'        => 'required|numeric',
            'frontal_area'  => 'required|numeric',
            'velocity'      => 'required|numeric',
            'reynolds'      => 'required|numeric',
        ]);

        $response = Http::post(config('services.ml.url') . '/api/v1/predictions/', $validated);

        if ($response->failed()) {
            return response()->json(['error' => 'ML Service unavailable'], 503);
        }

        // Optionally store prediction in simulation_metrics table here

        return $response->json();
    }
}
```

#### [MODIFY] `routes/api.php`

```php
Route::post('/ml/predict', [MlPredictionController::class, 'predict'])->middleware('auth:sanctum');
```

#### [MODIFY] `config/services.php`

```php
'ml' => [
    'url' => env('ML_SERVICE_URL', 'http://localhost:9000'),
],
```

#### [MODIFY] `.env`

```
ML_SERVICE_URL=http://localhost:9000
```

**Integration flow**:
```
Browser → POST /api/ml/predict → Laravel (validates + proxies)
                                ↓
                        POST /api/v1/predictions/ → ML Service (port 9000)
                                ↓
                        { drag_coefficient, lift_coefficient }
                                ↓
                        Laravel → Browser
```

**Verification**: Send a test request to Laravel's `/api/ml/predict` and confirm it returns both `drag_coefficient` and `lift_coefficient`.

---

## Step 2.7 — Frontend Prediction UI

**Goal**: A dedicated page where users select a geometry type, input simulation parameters, and receive an instant Cd + Cl prediction.

### File to create

#### [NEW] `frontend/src/pages/PredictPage.jsx`

**UI Elements**:
- Dropdown for `geometry_type` (fsae, sedan, sphere, etc.)
- Input fields for all numerical parameters (surface area, velocity, Reynolds number, etc.)
- "Predict (AI)" button
- Result card:
  - `Cd ≈ value` — with color coding (green = low drag, red = high drag)
  - `Cl ≈ value` — with color coding (negative = downforce for FSAE)
- Optional: Upload `.stl` button that auto-fills the geometry fields after calling `/api/v1/features/extract`

**API call**:
```javascript
const response = await fetch('/api/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        geometry_type: selectedType,
        surface_area:  parseFloat(surfaceArea),
        // ... all fields
    }),
});
const { drag_coefficient, lift_coefficient } = await response.json();
```

### Route registration

#### [MODIFY] `frontend/src/router/index.jsx`

```jsx
{ path: '/predict', element: <PredictPage /> }
```

#### [MODIFY] `frontend/src/components/Navbar.jsx`

Add a navigation link to `/predict`.

**Verification**: Navigate to `/predict`, fill in values for a sedan, click Predict, and confirm Cd ≈ 0.3 and Cl ≈ 0.15.

---

## Step 2.8 — Model Tuning & Comparison

**Goal**: Evaluate whether Random Forest is the best model, and tune its hyperparameters.

**When to run**: After Steps 2.1–2.3 are working correctly.

### A — Hyperparameter tuning

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators':    [100, 200, 500],
    'max_depth':       [10, 20, None],
    'min_samples_split': [2, 5, 10],
}
grid_search = GridSearchCV(RandomForestRegressor(), param_grid, cv=5, scoring='r2')
grid_search.fit(X_train, y_cd_train)
print(f"Best params: {grid_search.best_params_}")
```

### B — Model comparison

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

models = {
    "RandomForest":       RandomForestRegressor(n_estimators=200, random_state=42),
    "GradientBoosting":   GradientBoostingRegressor(n_estimators=200, random_state=42),
    "LinearRegression":   LinearRegression(),
}

for name, model in models.items():
    model.fit(X_train, y_cd_train)
    preds = model.predict(X_test)
    print(f"{name:25s}  R2={r2_score(y_cd_test, preds):.4f}  MAE={mean_absolute_error(y_cd_test, preds):.4f}")
```

### C — Increase training samples

```python
generate_dataset(num_samples=10_000)
```

**Verification**: Compare the R² and MAE scores. Update `train.py` to use the best-performing model configuration.

---

## Key Rules Across All Steps

| Rule | Why |
|------|-----|
| `build_features()` must be used in **both training and prediction** | Ensures train/predict feature alignment |
| Missing optional values → `0` | Prevents crashes for geometry-specific fields |
| Both models saved as `.pkl` | Required for `/train` endpoint reload |
| ML service never called directly from browser | Security — always proxied through Laravel |
| `random_state=42` for all splits | Ensures reproducible results |

---

## Phase 3 (Next)

See `ML_PHASE3_PLAN.md` for the full plan covering:
- Geometry-specific models per type (FSAE, Ahmed body, etc.)
- Auto-retraining triggered by new validated simulation data
- Anomaly detection for unrealistic predictions
- Confidence intervals on predictions
- Admin dashboard for model monitoring and dataset management
