import csv
import os
from datetime import datetime

DATASET_PATH = "datasets/real_simulations.csv"

HEADERS = [
    "surface_area", "volume", "length", "width", "height", "frontal_area",
    "velocity", "reynolds", "rear_wing_angle", "slant_angle",
    "drag", "lift",
    "geometry_type", "validated_at",
]


def append_simulation_row(
    geometry_features: dict,
    simulation_params: dict,
    cd: float,
    cl: float,
    geometry_type: str,
) -> None:
    """
    Append one validated simulation result to the real-data CSV.
    Called from the Laravel backend via the /dataset/append endpoint.
    Missing feature keys default to 0.
    """
    row = {
        **geometry_features,
        **simulation_params,
        "drag":          cd,
        "lift":          cl,
        "geometry_type": geometry_type,
        "validated_at":  datetime.utcnow().isoformat(),
    }

    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    file_exists = os.path.isfile(DATASET_PATH)

    with open(DATASET_PATH, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HEADERS, extrasaction="ignore")
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)


def get_dataset_size() -> int:
    """Return the number of data rows in the real_simulations CSV (excluding header)."""
    if not os.path.isfile(DATASET_PATH):
        return 0
    with open(DATASET_PATH) as f:
        # subtract 1 for the header row; floor at 0 to handle empty files
        return max(sum(1 for _ in f) - 1, 0)
