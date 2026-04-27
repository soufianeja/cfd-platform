import tempfile
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.ml.feature_builder import extract_geometry_features, SUPPORTED_FORMATS

router = APIRouter()


@router.post("/extract")
async def extract_features(file: UploadFile = File(...)):
    """
    Upload a .stl or .obj file and receive the extracted geometry features.
    These can be used to auto-fill the prediction form.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported: {SUPPORTED_FORMATS}"
        )

    # Save uploaded file to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        features = extract_geometry_features(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse mesh: {str(e)}")
    finally:
        os.unlink(tmp_path)

    return features
