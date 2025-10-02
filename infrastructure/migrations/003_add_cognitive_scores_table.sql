CREATE TABLE cognitive_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    extraversion REAL NOT NULL,
    agreeableness REAL NOT NULL,
    conscientiousness REAL NOT NULL,
    neuroticism REAL NOT NULL,
    openness REAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON cognitive_scores
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();