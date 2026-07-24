CREATE TABLE forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[], -- Allows for an array of text tags
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);