CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

alter table categories add column type text;
