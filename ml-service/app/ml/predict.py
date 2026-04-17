import joblib
import pandas as pd

MODEL_PATH = "models/cfd_model.pkl"
ENCODER_PATH = "models/encoder.pkl"

# load model and encoder
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

# define the prediction function
def predict_drag(geometry_type,length,width,height,reynolds,velocity,frontal_area,surface_area,volume,slant_angle,rear_wing_angle):
    # create a dataframe from the input data
    input_data = pd.DataFrame({
        "geometry_type":[geometry_type],
        "surface_area":[surface_area],
        "volume":[volume],
        "frontal_area":[frontal_area],
        "length":[length],
        "width":[width],
        "height":[height],
        "rear_wing_angle":[rear_wing_angle],
        "slant_angle":[slant_angle],
        "velocity":[velocity],
        "reynolds":[reynolds]
    })
    
    # preprocess the input data
    input_data["geometry_type"] = encoder.transform(input_data["geometry_type"])
    
    # make the prediction
    prediction = model.predict(input_data)
    
    return prediction[0]

# example usage
if __name__ == "__main__":
    test_cases = [
        {"geometry_type": "fsae", "surface_area": 6.8, "volume": 1.2,
         "frontal_area": 1.3, "length": 4.1, "width": 1.5, "height": 1.2,
         "rear_wing_angle": 30, "slant_angle": 0, "velocity": 30, "reynolds": 3000000},

        {"geometry_type": "sedan", "surface_area": 10.0, "volume": 3.5,
         "frontal_area": 2.2, "length": 4.5, "width": 1.8, "height": 1.4,
         "rear_wing_angle": 0, "slant_angle": 15, "velocity": 33, "reynolds": 5000000},

        {"geometry_type": "sphere", "surface_area": 3.14, "volume": 0.52,
         "frontal_area": 0.785, "length": 0.5, "width": 0.5, "height": 0.5,
         "rear_wing_angle": 0, "slant_angle": 0, "velocity": 25, "reynolds": 800000},
    ]

    for tc in test_cases:
        cd = predict_drag(**tc)
        print(f"  {tc['geometry_type']:12s} -> Cd = {cd:.4f}")
