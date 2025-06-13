
-- db/schema_inquires.sql


-- Tabla de consultas
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE inquiries ADD COLUMN seen BOOLEAN DEFAULT false;
