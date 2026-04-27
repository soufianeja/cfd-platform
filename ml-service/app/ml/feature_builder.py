import trimesh

SUPPORTED_FORMATS = [".stl", ".obj"]

# The canonical feature order — must match the column order used during training
FEATURE_ORDER = [
    "surface_area",
    "volume",
    "length",
    "width",
    "height",
    "frontal_area",
    "velocity",
    "reynolds",
    "rear_wing_angle",   # FSAE-specific (0 for others)
    "slant_angle",       # Ahmed body-specific (0 for others)
]


def extract_geometry_features(file_path: str) -> dict:
    """
    Extract standardized geometry features from a 3D mesh file.
    Supports .stl and .obj formats.
    Returns a dict with surface_area, volume, length, width, height,
    frontal_area, and aspect_ratio.
    """
    mesh = trimesh.load(file_path, force='mesh')
    bounds = mesh.bounding_box.extents  # [length, width, height]

    width  = float(bounds[1])
    height = float(bounds[2])

    return {
        "surface_area": round(float(mesh.area), 6),
        "volume":       round(float(abs(mesh.volume)), 6),
        "length":       round(float(bounds[0]), 6),
        "width":        round(width, 6),
        "height":       round(height, 6),
        "frontal_area": round(width * height, 6),
        "aspect_ratio": round(float(bounds[0]) / width, 6) if width > 0 else 0,
    }


def build_features(geometry_features: dict, simulation_params: dict) -> list:
    """
    Merge geometry + simulation parameters into an ordered ML input vector.
    Missing keys default to 0. Order must match training column order.
    """
    combined = {**geometry_features, **simulation_params}
    return [combined.get(key, 0) for key in FEATURE_ORDER]
