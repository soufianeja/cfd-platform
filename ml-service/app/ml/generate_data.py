"""
generate_data.py — Synthetic CFD Dataset Generator

Generates realistic aerodynamic training data based on published correlations
and known drag coefficients for common geometry types.

Each row represents one "virtual CFD simulation" with:
  - Geometry features (surface_area, volume, frontal_area, dimensions)
  - Simulation parameters (velocity, reynolds)
  - Geometry-specific parameters (rear_wing_angle, slant_angle)
  - Target: drag coefficient (Cd)

Physics references:
  - Ahmed body:   SAE 840300 (Ahmed et al., 1984)
  - Cylinder:     Schlichting, Boundary Layer Theory
  - Sphere:       Clift, Grace & Weber, Bubbles Drops & Particles
  - Flat plate:   Blasius / turbulent correlations
  - Vehicle Cd:   Hucho, Aerodynamics of Road Vehicles
"""

import csv
import random
import math
import os


# ──────────────────────────────────────────────────────────────────────────────
# GEOMETRY CONFIGURATIONS
# Each geometry type defines realistic parameter ranges and a Cd function.
# ──────────────────────────────────────────────────────────────────────────────

GEOMETRY_CONFIGS = {
    # ── FSAE Race Car ──
    # Open-wheel, high downforce, rear wing, lots of exposed suspension
    "fsae": {
        "surface_area": (5.5, 8.5),
        "volume": (0.8, 1.6),
        "frontal_area": (1.0, 1.6),
        "length": (3.2, 4.5),
        "width": (1.3, 1.7),
        "height": (1.0, 1.3),
        "rear_wing_angle": (15, 45),    # degrees — big rear wing
        "slant_angle": (0, 5),          # not applicable, near 0
        "velocity": (15, 50),           # m/s (54-180 km/h)
        "base_cd": 0.80,
    },

    # ── Ahmed Body ──
    # Classic research bluff body — Cd depends strongly on slant_angle
    # At 25° → attached flow → lower Cd (~0.29)
    # At 35° → separated flow → higher Cd (~0.38)
    "ahmed_body": {
        "surface_area": (3.5, 5.0),
        "volume": (0.6, 1.0),
        "frontal_area": (0.08, 0.115),  # standard Ahmed: 0.389m × 0.288m
        "length": (0.9, 1.2),           # standard: 1.044m
        "width": (0.35, 0.42),
        "height": (0.25, 0.32),
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 40),         # the critical parameter!
        "velocity": (20, 60),
        "base_cd": 0.25,
    },

    # ── Cylinder (infinite, crossflow) ──
    # Classic bluff body — Cd depends on Reynolds number
    "cylinder": {
        "surface_area": (1.0, 8.0),
        "volume": (0.1, 3.0),
        "frontal_area": (0.1, 2.0),     # diameter × span
        "length": (0.5, 3.0),           # span
        "width": (0.1, 1.0),            # diameter
        "height": (0.1, 1.0),           # diameter (same as width)
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 0),
        "velocity": (5, 50),
        "base_cd": 1.17,
    },

    # ── Sphere ──
    "sphere": {
        "surface_area": (0.5, 12.0),
        "volume": (0.05, 5.0),
        "frontal_area": (0.05, 3.0),
        "length": (0.1, 1.5),           # diameter
        "width": (0.1, 1.5),
        "height": (0.1, 1.5),
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 0),
        "velocity": (5, 50),
        "base_cd": 0.44,
    },

    # ── Sedan ──
    "sedan": {
        "surface_area": (8.0, 13.0),
        "volume": (2.5, 4.5),
        "frontal_area": (1.8, 2.4),
        "length": (4.0, 5.0),
        "width": (1.6, 1.9),
        "height": (1.3, 1.5),
        "rear_wing_angle": (0, 5),      # small lip spoiler at most
        "slant_angle": (10, 20),         # trunk angle
        "velocity": (20, 50),
        "base_cd": 0.30,
    },

    # ── SUV ──
    "suv": {
        "surface_area": (12.0, 18.0),
        "volume": (4.0, 7.0),
        "frontal_area": (2.5, 3.2),
        "length": (4.3, 5.2),
        "width": (1.8, 2.1),
        "height": (1.6, 1.9),
        "rear_wing_angle": (0, 3),
        "slant_angle": (0, 10),          # blunt rear end
        "velocity": (20, 45),
        "base_cd": 0.38,
    },

    # ── Truck / Semi ──
    "truck": {
        "surface_area": (30.0, 55.0),
        "volume": (20.0, 45.0),
        "frontal_area": (6.0, 10.0),
        "length": (8.0, 16.0),
        "width": (2.4, 2.6),
        "height": (3.5, 4.2),
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 5),
        "velocity": (20, 35),
        "base_cd": 0.72,
    },

    # ── Airfoil (2D, low angle of attack treated as slant_angle) ──
    "airfoil": {
        "surface_area": (0.5, 4.0),
        "volume": (0.02, 0.5),
        "frontal_area": (0.02, 0.2),
        "length": (0.5, 2.0),           # chord
        "width": (0.3, 2.0),            # span
        "height": (0.03, 0.25),         # max thickness
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 12),          # angle of attack
        "velocity": (20, 80),
        "base_cd": 0.008,
    },

    # ── Flat Plate (perpendicular to flow) ──
    "flat_plate": {
        "surface_area": (0.5, 6.0),
        "volume": (0.001, 0.05),
        "frontal_area": (0.25, 3.0),
        "length": (0.01, 0.05),          # thickness (very thin)
        "width": (0.5, 2.0),
        "height": (0.5, 2.0),
        "rear_wing_angle": (0, 0),
        "slant_angle": (0, 0),
        "velocity": (5, 40),
        "base_cd": 1.20,
    },

    # ── Wedge (streamlined front, blunt rear) ──
    "wedge": {
        "surface_area": (1.0, 6.0),
        "volume": (0.2, 2.0),
        "frontal_area": (0.2, 1.5),
        "length": (0.5, 2.5),
        "width": (0.3, 1.5),
        "height": (0.2, 1.0),
        "rear_wing_angle": (0, 0),
        "slant_angle": (10, 60),         # half-angle of wedge
        "velocity": (10, 50),
        "base_cd": 0.55,
    },
}

# Kinematic viscosity of air at ~20°C, sea level (m²/s)
NU_AIR = 1.516e-5


# ──────────────────────────────────────────────────────────────────────────────
# DRAG COEFFICIENT PHYSICS FUNCTIONS
# These apply adjustments on top of base_cd based on physical effects.
# ──────────────────────────────────────────────────────────────────────────────

def calculate_cd(geo_type, params):
    """
    Calculate a realistic Cd based on geometry type and parameters.

    This combines:
    1. A base Cd for the geometry type
    2. Physical adjustments (Reynolds effect, slant angle, wing angle)
    3. Small random noise to simulate CFD variability
    """
    config = GEOMETRY_CONFIGS[geo_type]
    base_cd = config["base_cd"]

    reynolds = params["reynolds"]
    slant_angle = params["slant_angle"]
    rear_wing_angle = params["rear_wing_angle"]
    frontal_area = params["frontal_area"]
    velocity = params["velocity"]

    # ── Reynolds number effect ──
    # Higher Re → thinner boundary layer → slightly different drag
    # Most objects: Cd decreases slightly with Re in the turbulent regime
    if reynolds > 0:
        log_re = math.log10(max(reynolds, 1e3))
        # Normalize around Re = 1e6 (log10 = 6)
        re_factor = 1.0 + 0.02 * (6.0 - log_re)
    else:
        re_factor = 1.0

    # ── Geometry-specific adjustments ──
    cd = base_cd

    if geo_type == "ahmed_body":
        # Ahmed body drag is famous for its slant angle dependence
        # Critical angle at ~30°: below → attached flow, above → separated
        if slant_angle <= 12.5:
            cd = 0.25 + 0.002 * slant_angle
        elif slant_angle <= 30:
            cd = 0.25 + 0.004 * (slant_angle - 12.5)
        else:
            # Flow separates → sudden drag increase
            cd = 0.32 + 0.003 * (slant_angle - 30)

    elif geo_type == "fsae":
        # Rear wing adds significant drag (induced + profile)
        wing_effect = 0.005 * rear_wing_angle  # ~0.075 at 15°, ~0.225 at 45°
        # Larger frontal area relative to body → more drag
        area_effect = 0.05 * (frontal_area - 1.3)
        cd = base_cd + wing_effect + area_effect

    elif geo_type == "cylinder":
        # Cylinder Cd depends on Reynolds number
        if reynolds < 1e3:
            cd = 1.4  # low Re, more viscous drag
        elif reynolds < 2e5:
            cd = 1.17  # subcritical regime
        elif reynolds < 5e5:
            cd = 0.3 + 0.87 * (5e5 - reynolds) / (5e5 - 2e5)  # drag crisis transition
        else:
            cd = 0.3  # supercritical

    elif geo_type == "sphere":
        # Sphere drag crisis around Re = 3-4 × 10^5
        if reynolds < 1e3:
            cd = 0.5
        elif reynolds < 3e5:
            cd = 0.44
        elif reynolds < 5e5:
            cd = 0.1 + 0.34 * (5e5 - reynolds) / (5e5 - 3e5)
        else:
            cd = 0.1

    elif geo_type == "sedan":
        # Trunk slant angle affects wake
        slant_effect = -0.003 * slant_angle  # slight benefit up to a point
        if slant_angle > 18:
            slant_effect = 0.005 * (slant_angle - 18)  # too steep → flow separates
        cd = base_cd + slant_effect

    elif geo_type == "suv":
        # Blunt rear end → high base drag, slant angle has less effect
        cd = base_cd + 0.001 * (slant_angle - 5)

    elif geo_type == "truck":
        # Drag depends heavily on cab-trailer gap and blunt rear
        cd = base_cd + random.uniform(-0.05, 0.05)

    elif geo_type == "airfoil":
        # Cd increases with angle of attack (slant_angle in our schema)
        aoa = slant_angle  # degrees
        cd_friction = 0.006  # base skin friction
        # Induced drag increases ~ aoa²
        cd_induced = 0.0001 * aoa * aoa
        # Flow separation drag (increases steeply above ~10°)
        if aoa > 10:
            cd_sep = 0.01 * (aoa - 10) ** 1.5
        else:
            cd_sep = 0.0
        cd = cd_friction + cd_induced + cd_sep

    elif geo_type == "flat_plate":
        # Nearly constant at high Re
        cd = base_cd

    elif geo_type == "wedge":
        # Cd increases with half-angle
        cd = 0.3 + 0.01 * slant_angle

    # Apply Reynolds effect
    cd *= re_factor

    # ── Velocity effect (compressibility hint at high speeds) ──
    if velocity > 60:
        mach_approx = velocity / 343.0  # speed of sound ~ 343 m/s
        cd *= (1.0 + 0.5 * mach_approx ** 2)  # very mild compressibility

    # ── Random noise (simulating CFD solver variability) ──
    # Different meshes, convergence, turbulence models → ±5% variation
    noise = random.gauss(0, 0.02 * cd)
    cd += noise

    # Clamp to physical range
    cd = max(0.001, cd)

    return round(cd, 5)


# ──────────────────────────────────────────────────────────────────────────────
# DATASET GENERATOR
# ──────────────────────────────────────────────────────────────────────────────

def generate_dataset(output_path="datasets/dataset.csv", num_samples=2000):
    """
    Generate a synthetic CFD dataset and save as CSV.

    Args:
        output_path: Where to save the CSV file
        num_samples: How many rows to generate
    """
    headers = [
        "geometry_type", "surface_area", "volume", "frontal_area",
        "length", "width", "height", "rear_wing_angle", "slant_angle",
        "velocity", "reynolds", "drag"
    ]

    rows = []
    geo_types = list(GEOMETRY_CONFIGS.keys())

    for i in range(num_samples):
        # Pick a geometry type (weighted so we get more of the interesting ones)
        weights = {
            "fsae": 3, "ahmed_body": 2, "sedan": 3, "suv": 2,
            "truck": 1, "cylinder": 2, "sphere": 2, "airfoil": 2,
            "flat_plate": 1, "wedge": 2,
        }
        geo_type = random.choices(
            geo_types,
            weights=[weights.get(g, 1) for g in geo_types],
            k=1
        )[0]

        config = GEOMETRY_CONFIGS[geo_type]

        # Generate random parameters within realistic ranges
        surface_area = round(random.uniform(*config["surface_area"]), 3)
        volume = round(random.uniform(*config["volume"]), 3)
        frontal_area = round(random.uniform(*config["frontal_area"]), 3)
        length = round(random.uniform(*config["length"]), 3)
        width = round(random.uniform(*config["width"]), 3)
        height = round(random.uniform(*config["height"]), 3)

        # Some parameters have fixed range for certain geometries
        rwa_range = config["rear_wing_angle"]
        rear_wing_angle = round(random.uniform(*rwa_range), 1) if rwa_range[1] > 0 else 0.0

        sa_range = config["slant_angle"]
        slant_angle = round(random.uniform(*sa_range), 1) if sa_range[1] > 0 else 0.0

        velocity = round(random.uniform(*config["velocity"]), 2)

        # Reynolds number: Re = V × L / ν
        reynolds = round(velocity * length / NU_AIR)

        # Pack parameters
        params = {
            "surface_area": surface_area,
            "volume": volume,
            "frontal_area": frontal_area,
            "length": length,
            "width": width,
            "height": height,
            "rear_wing_angle": rear_wing_angle,
            "slant_angle": slant_angle,
            "velocity": velocity,
            "reynolds": reynolds,
        }

        # Calculate drag coefficient
        cd = calculate_cd(geo_type, params)

        rows.append([
            geo_type, surface_area, volume, frontal_area,
            length, width, height, rear_wing_angle, slant_angle,
            velocity, reynolds, cd
        ])

    # Shuffle so geometry types are mixed
    random.shuffle(rows)

    # Write CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    # Print summary
    print(f"\n{'='*55}")
    print(f"  [OK] Dataset generated: {output_path}")
    print(f"  Total samples: {num_samples}")
    print(f"{'='*55}")

    # Stats per geometry type
    from collections import Counter, defaultdict
    type_counts = Counter(row[0] for row in rows)
    type_drags = defaultdict(list)
    for row in rows:
        type_drags[row[0]].append(row[-1])

    print(f"\n  {'Geometry':<14} {'Count':>6}   {'Cd min':>8} {'Cd mean':>8} {'Cd max':>8}")
    print(f"  {'-'*14} {'-'*6}   {'-'*8} {'-'*8} {'-'*8}")
    for geo in sorted(type_counts.keys()):
        drags = type_drags[geo]
        print(f"  {geo:<14} {type_counts[geo]:>6}   "
              f"{min(drags):>8.4f} {sum(drags)/len(drags):>8.4f} {max(drags):>8.4f}")

    print()
    return output_path


if __name__ == "__main__":
    generate_dataset()
