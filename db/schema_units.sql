
-- db/schema_units.sql


-- Tabla de unidades
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
