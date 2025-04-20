-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  time_zone TEXT DEFAULT 'America/New_York',
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_rules table
CREATE TABLE job_rules (
  id SERIAL PRIMARY KEY,
  days TEXT NOT NULL,
  time_range TEXT NOT NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME NOT NULL,
  clock_out TIME,
  duration TEXT,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'modified', 'deleted')),
  breaks JSONB DEFAULT '[]'::jsonb,
  original_data JSONB,
  modified_at TIMESTAMP WITH TIME ZONE,
  modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY user_isolation ON users
  USING (id = auth.uid());

CREATE POLICY time_entries_isolation ON time_entries
  USING (user_id = auth.uid());

CREATE POLICY expenses_isolation ON expenses
  USING (user_id = auth.uid());

-- Admin users can see all data
CREATE POLICY admin_all_access ON users
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY admin_all_access_time_entries ON time_entries
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY admin_all_access_expenses ON expenses
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Insert some initial data
INSERT INTO jobs (name, rate) VALUES
  ('Web Development', 50.00),
  ('Design Work', 45.00),
  ('Client Meeting', 60.00);

INSERT INTO job_rules (days, time_range, job_id) VALUES
  ('Monday-Friday', '9:00-12:00', 1),
  ('Monday-Friday', '12:00-14:00', 3),
  ('Monday-Friday', '14:00-17:00', 2),
  ('Saturday', '10:00-16:00', 1);

-- Create a demo user
INSERT INTO users (name, email, pin) VALUES
  ('Demo User', 'demo@example.com', '2216');

-- Create a demo admin
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', 'password'); -- In a real app, this would be a secure hash
