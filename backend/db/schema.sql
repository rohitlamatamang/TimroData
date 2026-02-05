-- schema.sql - Week 3
-- Database schema for TimroData

CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT,
    os TEXT,
    language TEXT,
    timezone TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    city TEXT,
    country TEXT,
    country_code TEXT,
    isp TEXT
);

CREATE TABLE IF NOT EXISTS location_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    latitude REAL,
    longitude REAL,
    accuracy REAL,
    altitude REAL,
    FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    permission_type TEXT,
    permission_state TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);
CREATE INDEX IF NOT EXISTS idx_location_visit ON location_data(visit_id);
