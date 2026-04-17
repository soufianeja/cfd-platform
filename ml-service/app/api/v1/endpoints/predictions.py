from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ml.predict import predict_drag_and_lift

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
    lift_coefficient: float
    geometry_type: str
    model_version: str = "2.0"

@router.get("/", tags=["Predictions"])
async def list_predictions():
    """Get a list of recent predictions"""
    return {"predictions": []}

@router.post("/", response_model=PredictionResponse, tags=["Predictions"])
async def create_prediction(request: PredictionRequest):
    """Predict drag coefficient (Cd) and lift coefficient (Cl) from geometry features"""
    try:
        result = predict_drag_and_lift(**request.model_dump())
        return PredictionResponse(
            drag_coefficient=round(result["drag_coefficient"], 5),
            lift_coefficient=round(result["lift_coefficient"], 5),
            geometry_type=request.geometry_type,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
