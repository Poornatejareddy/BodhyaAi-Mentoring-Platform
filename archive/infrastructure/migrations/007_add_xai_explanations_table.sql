-- First, add a primary key to the risk_scores table so we can reference it
ALTER TABLE risk_scores ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Now, create the table to store the feature importances for each score
CREATE TABLE xai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score_id UUID NOT NULL REFERENCES risk_scores(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    importance REAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add an index for faster lookups
CREATE INDEX idx_xai_explanations_score_id ON xai_explanations(score_id);