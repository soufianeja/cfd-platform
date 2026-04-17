from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ml.predict import predict_drag

router = APIRouter()

class PredictionRequest(BaseModel):
    geometry_type: str = "fsae"
    surface_area: float = 0
    volume: float = 0
    frontal_area: float = 0
    length: float = 0
    width: float = 0
    height: float = 0
    rear_wing_angle: float = 0
    slant_angle: float = 0
    velocity: float = 0
    reynolds: float = 0

class PredictionResponse(BaseModel):
    drag_coefficient: float
    geometry_type: str
    model_version: str = "1.0"

@router.get("/", tags=["Predictions"])
async def list_predictions():
    """Get a list of recent predictions"""
    return {"predictions": []}

@router.post("/", response_model=PredictionResponse, tags=["Predictions"])
async def create_prediction(request: PredictionRequest):
    """Predict drag coefficient from geometry features and simulation parameters"""
    try:
        cd = predict_drag(**request.model_dump())
        return PredictionResponse(
            drag_coefficient=round(cd, 5),
            geometry_type=request.geometry_type,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

