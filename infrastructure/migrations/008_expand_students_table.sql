ALTER TABLE students
-- Academic scores
ADD COLUMN sgpa_sem1 REAL,
ADD COLUMN sgpa_sem2 REAL,
ADD COLUMN sgpa_sem3 REAL,
ADD COLUMN sgpa_sem4 REAL,
ADD COLUMN sgpa_sem5 REAL,
ADD COLUMN sgpa_sem6 REAL,
ADD COLUMN sgpa_sem7 REAL,
ADD COLUMN sgpa_sem8 REAL,
ADD COLUMN cgpa REAL,
ADD COLUMN iat1 INT,
ADD COLUMN iat2 INT,
ADD COLUMN iat3 INT,
ADD COLUMN attendance INT,
ADD COLUMN study_hours_per_day REAL,
ADD COLUMN backlogs INT,
-- Lifestyle / behavior
ADD COLUMN sleep_hours REAL,
ADD COLUMN screen_time REAL,
ADD COLUMN exercise_hours REAL,
ADD COLUMN diet_type VARCHAR(50),           -- e.g., 'vegetarian', 'non-veg'
ADD COLUMN hostel_day_scholar VARCHAR(20),  -- 'hostel' or 'day-scholar'
ADD COLUMN transport_mode VARCHAR(50),      -- 'bus', 'bike', 'walk'
-- Support / mentorship
ADD COLUMN parent_support REAL,
ADD COLUMN mentor_support REAL,
ADD COLUMN peer_support REAL,
-- Optional additional fields (if needed for ML later)
ADD COLUMN extracurricular INT,
ADD COLUMN favorite_subject VARCHAR(255);
