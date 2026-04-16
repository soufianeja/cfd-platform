from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class PredictionRequest(BaseModel):
    geometry_id: int
    parameters: dict

class PredictionResponse(BaseModel):
    status: str
    prediction_id: str
    estimated_time: float

@router.get("/", tags=["Predictions"])
async def list_predictions():
    """Get a list of recent predictions"""
    return {"predictions": []}

@router.post("/", response_model=PredictionResponse, tags=["Predictions"])
async def create_prediction(request: PredictionRequest):
    """Start a new ML prediction based on CFD project parameters"""
    # This is a placeholder for actual ML logic
    return PredictionResponse(
        status="pending",
        prediction_id="pred_123456",
        estimated_time=45.5
    )
