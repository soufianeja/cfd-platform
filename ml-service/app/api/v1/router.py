from fastapi import APIRouter

from app.api.v1.endpoints import predictions, mesh, training, features, dataset

api_router = APIRouter()

api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(mesh.router,         prefix="/mesh",         tags=["Mesh Analysis"])
api_router.include_router(training.router,     prefix="/training",     tags=["Training"])
api_router.include_router(features.router,     prefix="/features",     tags=["Features"])
api_router.include_router(dataset.router,      prefix="/dataset",      tags=["Dataset"])

