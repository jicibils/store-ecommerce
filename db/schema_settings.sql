-- Tabla de admin settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_phone TEXT NOT NULL,
  admin_email TEXT NOT NULL,
);