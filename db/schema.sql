
-- db/schema.sql

-- Habilita la extensión de UUID si es necesario (en Supabase puede ya estar activa)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  unit TEXT,
  is_offer BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
