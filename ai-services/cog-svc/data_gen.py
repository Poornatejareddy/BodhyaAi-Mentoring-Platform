# ai-services/cog-svc/data_gen.py
import pandas as pd
import numpy as np
import os
from faker import Faker

fake = Faker()

DATA_DIR = "datasets"
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, "bigfive_dataset.csv")

# Number of synthetic participants
N = 1000

# Number of questions (Likert scale 1–5)
NUM_QUESTIONS = 50

# Generate synthetic responses (1–5)
responses = np.random.randint(1, 6, size=(N, NUM_QUESTIONS))

# Map questions to traits (10 per trait)
trait_map = {
    "Openness": list(range(0, 10)),
    "Conscientiousness": list(range(10, 20)),
    "Extraversion": list(range(20, 30)),
    "Agreeableness": list(range(30, 40)),
    "Neuroticism": list(range(40, 50)),
}

# Calculate trait scores (normalized 0–1)
traits = {}
for trait, idxs in trait_map.items():
    trait_scores = responses[:, idxs].mean(axis=1) / 5.0
    traits[trait] = trait_scores

# Build dataframe
columns = [f"Q{i+1}" for i in range(NUM_QUESTIONS)]
df = pd.DataFrame(responses, columns=columns)

# Add trait scores
for trait, values in traits.items():
    df[trait] = values.round(2)

# Add participant metadata
df["Name"] = [fake.name() for _ in range(N)]
df["Age"] = np.random.randint(18, 30, N)
df["Gender"] = np.random.choice(["Male", "Female"], N)

# Save dataset
df.to_csv(OUTPUT_FILE, index=False)
print(f"✅ Big Five dataset generated: {OUTPUT_FILE} with {N} participants")
print(f"Columns: {len(df.columns)}")
