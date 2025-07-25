
-- db/schema_orders.sql

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  address_details TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  delivery_option TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  confirm_method TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  cancellation_reason TEXT,
  canceled_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
  shipping_cost numeric DEFAULT 0
);

-- Tabla de productos dentro de un pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);


ALTER TABLE orders
ADD COLUMN destination_lat double precision,
ADD COLUMN destination_lng double precision;