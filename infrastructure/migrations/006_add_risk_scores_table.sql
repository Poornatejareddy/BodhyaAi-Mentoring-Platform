CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL, -- e.g., 'dropout', 'academic'
    prob REAL NOT NULL, -- The probability score
    model_ver VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add an index for faster lookups on student_id
CREATE INDEX idx_risk_scores_student_id ON risk_scores(student_id);