-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  pin_hash TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL
);

CREATE TABLE job_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  days TEXT NOT NULL,
  time_range TEXT NOT NULL,
  priority INTEGER DEFAULT 0
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  duration INTERVAL,
  status TEXT DEFAULT 'active',
  modified_at TIMESTAMP WITH TIME ZONE,
  modification_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE breaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTERVAL
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT,
  billable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default users (admin and main user)
INSERT INTO users (name, email, pin_hash, is_admin)
VALUES 
  ('Admin', 'admin@example.com', '$2a$10$XdrzX2Vt8KHWqIEZSzfGVeIm6SBtUVVYLUcbpnQYGKY1YxdwqK7Iq', TRUE),
  ('User', 'user@example.com', '$2a$10$hACwQ5oXKUxZceZe.0q2IO7Y5vv7zW9oRnwJx.9TAGnCUyVR7T9fS', FALSE);

-- The pin_hash values above are for pins:
-- Admin: 1234
-- User: 2216
-- In a real app, you would generate these securely