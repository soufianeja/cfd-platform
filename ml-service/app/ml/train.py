import pandas as pd
import joblib 
import math
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score

DATASET_PATH = "datasets/dataset.csv"
MODEL_PATH = "models/cfd_model.pkl"

# load dataset
df = pd.read_csv(DATASET_PATH)

# preprocess data
# drop non-numeric columns
df = df.drop(columns=["geometry_type"])

# drop rows with NaN values
df = df.dropna()

# define features and target
X = df.drop(columns=["drag"])
y = df["drag"]

# split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42)

# train the model
model = RandomForestRegressor(n_estimators=200,random_state=42)
model.fit(X_train,y_train)

# save the model
joblib.dump(model,MODEL_PATH)

print("Model trained and saved successfully!")

# evaluate the model
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test,y_pred)
mse = mean_squared_error(y_test,y_pred)
r2 = r2_score(y_test,y_pred)

print(f"MAE: {mae}")
print(f"MSE: {mse}")
print(f"R2: {r2}")
