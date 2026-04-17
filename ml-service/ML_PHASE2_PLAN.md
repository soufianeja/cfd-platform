# ML Service — Phase 2 Plan

> Phase 1 (MVP) is COMPLETE. This document outlines next steps.

---

## Phase 2 Overview

| Step | Task | Difficulty |
|------|------|------------|
| 2.1 | Add `/train` endpoint | Easy |
| 2.2 | Laravel backend integration | Medium |
| 2.3 | Frontend prediction UI | Medium |
| 2.4 | STL feature extraction (trimesh) | Medium |
| 2.5 | Model tuning & comparison | Easy |
| 2.6 | **Lift coefficient (Cl) prediction** | Medium |

---

## 2.1 — Add `/train` Endpoint

**Goal**: Retrain the model from the API without running a script manually.

### What to build:
- `POST /api/v1/training/train` — triggers retraining
- `GET /api/v1/training/status` — returns model info (accuracy, training date)

### Files to create/modify:
- **[NEW]** `app/api/v1/endpoints/training.py`
- **[MODIFY]** `app/api/v1/router.py` — register the training router

### Logic:
```python
@router.post("/train")
async def train_model():
    # 1. Call generate_data() to regenerate dataset
    # 2. Call train_model() from app.ml.train
    # 3. Reload the model in predict.py
    # 4. Return metrics (MAE, RMSE, R2)
```

### Security:
- Protect with an API key from `.env`
- `TRAINING_API_KEY=your-secret-key-here`
- Check: `if request.headers.get("X-API-Key") != settings.TRAINING_API_KEY: raise 403`

---

## 2.2 — Laravel Backend Integration

**Goal**: When a user creates a simulation, Laravel calls the ML service to predict Cd.

### What to build:

#### Backend (Laravel)

**[NEW]** `app/Http/Controllers/Api/MlPredictionController.php`
```php
use Illuminate\Support\Facades\Http;

class MlPredictionController extends Controller
{
    public function predict(Request $request)
    {
        // 1. Validate input (same fields as ML API)
        // 2. Forward to ML service
        $response = Http::post('http://localhost:9000/api/v1/predictions/', [
            'geometry_type' => $request->geometry_type,
            'surface_area' => $request->surface_area,
            // ... all 11 fields
        ]);

        // 3. Return ML response to frontend
        return $response->json();

        // 4. (Optional) Save prediction to simulation_metrics table
    }
}
```

**[MODIFY]** `routes/api.php`
```php
Route::post('/ml/predict', [MlPredictionController::class, 'predict']);
```

#### Flow:
```
Frontend → POST /api/ml/predict → Laravel → POST /api/v1/predictions/ → ML Service
                                          ← returns Cd ←
```

---

## 2.3 — Frontend Prediction UI

**Goal**: A page where users input geometry parameters and get instant Cd prediction.

### What to build:

**[NEW]** `frontend/src/pages/PredictPage.jsx`

UI should include:
- Dropdown for `geometry_type` (fsae, sedan, sphere, etc.)
- Input fields for the 10 numerical features
- "Predict" button
- Result card showing predicted Cd
- Visual indicator (color-coded: green=low drag, red=high drag)

### API call:
```javascript
const response = await fetch('/api/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        geometry_type: selectedType,
        surface_area: parseFloat(surfaceArea),
        // ... all fields
    })
});
const data = await response.json();
// data.drag_coefficient → display this
```

### Route:
- Add to `router/index.jsx`: `/predict` → `PredictPage`
- Add navigation link in the header

---

## 2.4 — STL Feature Extraction (trimesh)

**Goal**: When user uploads a .stl file, automatically extract geometry features.

### What to build:

**[NEW]** `app/ml/feature_builder.py`
```python
import trimesh

def extract_features(stl_path: str) -> dict:
    mesh = trimesh.load(stl_path)
    bounds = mesh.bounding_box.extents  # [length, width, height]
    return {
        "surface_area": float(mesh.area),
        "volume": float(abs(mesh.volume)),
        "length": float(bounds[0]),
        "width": float(bounds[1]),
        "height": float(bounds[2]),
        "frontal_area": float(bounds[1] * bounds[2]),
    }
```

**[NEW]** `app/api/v1/endpoints/features.py`
```python
@router.post("/extract")
async def extract_features(file: UploadFile):
    # 1. Save uploaded STL to temp file
    # 2. Call feature_builder.extract_features()
    # 3. Return geometry features as JSON
```

### Requirements:
```
pip install trimesh
```

### Flow:
```
User uploads .stl → extract features → auto-fill prediction form → predict Cd
```

---

## 2.5 — Model Tuning & Comparison

**Goal**: Try different models and hyperparameters to improve accuracy.

### Experiments to try:

#### A. Hyperparameter tuning
```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5, 10],
}
grid_search = GridSearchCV(RandomForestRegressor(), param_grid, cv=5)
grid_search.fit(X_train, y_train)
print(f"Best params: {grid_search.best_params_}")
```

#### B. Compare models
```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

models = {
    "RandomForest": RandomForestRegressor(n_estimators=200),
    "GradientBoosting": GradientBoostingRegressor(n_estimators=200),
    "LinearRegression": LinearRegression(),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    print(f"{name:25s} R2 = {r2:.4f}")
```

#### C. More training data
```python
# Generate more samples for better generalization
generate_dataset(num_samples=10000)
```

---

## 2.6 — Lift Coefficient (Cl) Prediction

**Goal**: Predict Cl alongside Cd using the same pipeline — two models, same features, one API response.

### Approach: Two models in the same pipeline (no duplicate files)

### Files to modify (4 files):

#### [MODIFY] `app/ml/generate_data.py`

Add a `lift` column to the dataset with realistic Cl correlations:

```python
# Typical Cl values per geometry:
CL_VALUES = {
    "airfoil":    (0.2, 1.5),     # wings generate lift (depends on AoA)
    "fsae":       (-3.0, -1.5),   # rear wing = downforce (NEGATIVE!)
    "sedan":      (0.05, 0.30),   # slight lift at speed
    "suv":        (0.10, 0.35),   # boxy shape, some lift
    "truck":      (0.05, 0.15),   # minimal lift
    "cylinder":   (-0.02, 0.02),  # symmetric -> ~0
    "sphere":     (-0.02, 0.02),  # symmetric -> ~0
    "flat_plate": (-0.02, 0.02),  # perpendicular -> ~0
    "ahmed_body": (-0.01, 0.15),  # depends on slant angle
    "wedge":      (0.05, 0.40),   # depends on half-angle
}
```

Key physics for Cl:
- **Airfoils**: `Cl = 2 * pi * angle_of_attack` (thin airfoil theory, simplified)
- **FSAE**: Cl is negative (downforce), increases with `rear_wing_angle`
- **Symmetric bodies** (sphere, cylinder): Cl ≈ 0 + small noise
- **Vehicles**: slight positive lift at speed

Add headers: `[..., "drag", "lift"]`

---

#### [MODIFY] `app/ml/train.py`

Train two separate models:

```python
# Define TWO targets
y_cd = df["drag"]
y_cl = df["lift"]

# Split (same X, two y's)
X_train, X_test, y_cd_train, y_cd_test, y_cl_train, y_cl_test = ...?
# HINT: Split twice with same random_state, OR split indices first:
from sklearn.model_selection import train_test_split
X_train, X_test, y_cd_train, y_cd_test = train_test_split(X, y_cd, test_size=0.2, random_state=42)
# Use same indices for Cl:
_, _, y_cl_train, y_cl_test = train_test_split(X, y_cl, test_size=0.2, random_state=42)

# Train Cd model (you already have this)
cd_model = RandomForestRegressor(n_estimators=200, random_state=42)
cd_model.fit(X_train, y_cd_train)

# Train Cl model (same pattern)
cl_model = RandomForestRegressor(n_estimators=200, random_state=42)
cl_model.fit(X_train, y_cl_train)

# Save both
joblib.dump(cd_model, "models/cd_model.pkl")
joblib.dump(cl_model, "models/cl_model.pkl")

# Evaluate both
print("Cd Model:")
print(f"  R2:  {r2_score(y_cd_test, cd_model.predict(X_test)):.4f}")
print("Cl Model:")
print(f"  R2:  {r2_score(y_cl_test, cl_model.predict(X_test)):.4f}")
```

---

#### [MODIFY] `app/ml/predict.py`

Load both models, return both predictions:

```python
cd_model = joblib.load("models/cd_model.pkl")
cl_model = joblib.load("models/cl_model.pkl")

def predict_drag_and_lift(...):
    # ... same preprocessing as predict_drag ...
    cd = cd_model.predict(input_data)[0]
    cl = cl_model.predict(input_data)[0]
    return {"drag_coefficient": cd, "lift_coefficient": cl}
```

---

#### [MODIFY] `app/api/v1/endpoints/predictions.py`

Update the response to include Cl:

```python
class PredictionResponse(BaseModel):
    drag_coefficient: float
    lift_coefficient: float     # NEW
    geometry_type: str
    model_version: str = "1.0"
```

---

### Sanity checks after implementation:

| Geometry | Expected Cd | Expected Cl |
|----------|------------|-------------|
| FSAE     | 0.7 – 1.1  | -3.0 to -1.5 (downforce!) |
| Sedan    | 0.25 – 0.35 | 0.05 to 0.30 |
| Airfoil  | 0.005 – 0.02 | 0.2 to 1.5 |
| Sphere   | 0.09 – 0.50 | ≈ 0 |
| Cylinder | 0.3 – 1.2  | ≈ 0 |

---

## Phase 3 (Future)

- Multiple models per geometry type
- Anomaly detection (flag unrealistic predictions)
- Auto-retraining when new simulation data is added
- Confidence intervals on predictions
- Training from real simulation data in the database
