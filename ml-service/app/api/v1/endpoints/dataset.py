from fastapi import APIRouter, BackgroundTasks, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from app.ml.dataset_builder import append_simulation_row, get_dataset_size
from app.ml import train as ml_train

router = APIRouter()


class SimulationRow(BaseModel):
    geometry_type: str
    geometry_features: dict
    simulation_params: dict
    drag_coefficient: float
    lift_coefficient: float


@router.post("/append")
async def append_row(
    data: SimulationRow,
    background_tasks: BackgroundTasks,
    x_api_key: str = Header(...),
):
    """
    Append a validated simulation result to the real dataset.
    Automatically triggers background retraining when RETRAIN_THRESHOLD is reached.
    Requires X-API-Key header matching TRAINING_API_KEY.
    """
    if x_api_key != settings.TRAINING_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

    append_simulation_row(
        geometry_features=data.geometry_features,
        simulation_params=data.simulation_params,
        cd=data.drag_coefficient,
        cl=data.lift_coefficient,
        geometry_type=data.geometry_type,
    )

    size = get_dataset_size()
    retraining_triggered = size >= settings.RETRAIN_THRESHOLD

    if retraining_triggered:
        background_tasks.add_task(ml_train.train_models)

    return {
        "status": "appended",
        "dataset_size": size,
        "retrain_threshold": settings.RETRAIN_THRESHOLD,
        "retraining_triggered": retraining_triggered,
    }


@router.get("/size")
async def dataset_size():
    """Return the current number of validated simulation rows in the real dataset."""
    return {
        "size": get_dataset_size(),
        "retrain_threshold": settings.RETRAIN_THRESHOLD,
    }
