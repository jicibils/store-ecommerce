create table order_status_audit (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  old_status text not null,
  new_status text not null,
  reason text not null,
  changed_at timestamptz default now(),
  changed_by text -- opcional si querés saber si fue admin o nombre
);