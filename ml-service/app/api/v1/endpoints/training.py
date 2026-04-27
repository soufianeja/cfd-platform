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
