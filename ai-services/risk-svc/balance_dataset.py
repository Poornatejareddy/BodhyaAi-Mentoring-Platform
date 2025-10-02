# ai-services/risk-svc/balance_dataset.py
import pandas as pd
from sklearn.utils import resample
import os

DATA_DIR = "datasets"
INPUT_FILE = os.path.join(DATA_DIR, "academic_dataset.csv")
OUTPUT_FILE = os.path.join(DATA_DIR, "academic_dataset_balanced.csv")

# Load dataset
df = pd.read_csv(INPUT_FILE)

# Separate by class
low = df[df["RiskLevel"] == "Low"]
medium = df[df["RiskLevel"] == "Medium"]
high = df[df["RiskLevel"] == "High"]

# Find the maximum class size
max_size = max(len(low), len(medium), len(high))

# Upsample each class to balance
low_bal = resample(low, replace=True, n_samples=max_size, random_state=42)
medium_bal = resample(medium, replace=True, n_samples=max_size, random_state=42)
high_bal = resample(high, replace=True, n_samples=max_size, random_state=42)

# Combine back
df_balanced = pd.concat([low_bal, medium_bal, high_bal])

# Shuffle rows
df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)

# Save balanced dataset
os.makedirs(DATA_DIR, exist_ok=True)
df_balanced.to_csv(OUTPUT_FILE, index=False)

print(f"✅ Balanced dataset saved: {OUTPUT_FILE}")
print(df_balanced['RiskLevel'].value_counts())
