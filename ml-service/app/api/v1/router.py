from fastapi import APIRouter

from app.api.v1.endpoints import predictions, mesh

api_router = APIRouter()

api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(mesh.router, prefix="/mesh", tags=["Mesh Analysis"])
