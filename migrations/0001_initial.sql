CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cities (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE sectors (
  id serial PRIMARY KEY,
  city_id integer NOT NULL REFERENCES cities(id),
  name text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  UNIQUE(city_id, slug)
);

CREATE TABLE users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN','MANAGER','PARTNER')),
  city_id integer REFERENCES cities(id),
  sector_id integer REFERENCES sectors(id),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE restaurants (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  city_id integer NOT NULL REFERENCES cities(id),
  sector_id integer NOT NULL REFERENCES sectors(id),
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  ordering_radius_m numeric(6,2) NOT NULL DEFAULT 10 CHECK (ordering_radius_m >= 3),
  commission_bps integer CHECK (commission_bps IS NULL OR commission_bps BETWEEN 0 AND 10000),
  description text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_restaurants (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id integer NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  PRIMARY KEY(user_id, restaurant_id)
);

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE collections (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE labels (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE dishes (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  ingredients text NOT NULL DEFAULT '',
  image_url text,
  kcal integer,
  kcal_status text CHECK (kcal_status IN ('VERIFIED','ESTIMATED')),
  category_id integer REFERENCES categories(id),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE dish_labels (
  dish_id integer NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  label_id integer NOT NULL REFERENCES labels(id) ON DELETE RESTRICT,
  approved boolean NOT NULL DEFAULT false,
  PRIMARY KEY(dish_id, label_id)
);

CREATE TABLE restaurant_offers (
  id serial PRIMARY KEY,
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  dish_id integer NOT NULL REFERENCES dishes(id),
  name_override text,
  description_override text,
  image_override text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  is_featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  UNIQUE(restaurant_id, dish_id)
);

CREATE OR REPLACE FUNCTION enforce_featured_offer_limit() RETURNS trigger AS $$
BEGIN
  IF NEW.is_featured AND NEW.status = 'PUBLISHED' AND (
    SELECT count(*) FROM restaurant_offers
    WHERE restaurant_id = NEW.restaurant_id AND is_featured AND status = 'PUBLISHED' AND id <> COALESCE(NEW.id, 0)
  ) >= 2 THEN
    RAISE EXCEPTION 'A restaurant may feature at most two published offers';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurant_featured_limit
BEFORE INSERT OR UPDATE OF is_featured, status ON restaurant_offers
FOR EACH ROW EXECUTE FUNCTION enforce_featured_offer_limit();

CREATE TABLE collection_dishes (
  collection_id integer NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  dish_id integer NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY(collection_id, dish_id)
);

CREATE TABLE crown_experiences (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crown_offers (
  id serial PRIMARY KEY,
  experience_id integer NOT NULL REFERENCES crown_experiences(id),
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  availability_note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  UNIQUE(experience_id, restaurant_id)
);

CREATE TABLE professional_sessions (
  id uuid PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE presence_authorizations (
  id uuid PRIMARY KEY,
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accuracy_m numeric(8,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE visit_sessions (
  id uuid PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  secret_hash text NOT NULL UNIQUE,
  order_sequence integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  visit_session_id uuid NOT NULL REFERENCES visit_sessions(id),
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VALIDATED','DECLINED','CANCELLED')),
  gross_cents integer NOT NULL CHECK (gross_cents >= 0),
  commission_bps integer NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
  commission_cents integer NOT NULL CHECK (commission_cents >= 0),
  billable boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  cancelled_at timestamptz
);

CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  offer_id integer NOT NULL REFERENCES restaurant_offers(id),
  item_name text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL
);

CREATE OR REPLACE FUNCTION prevent_order_item_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Submitted order items are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER immutable_order_items
BEFORE UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION prevent_order_item_mutation();

CREATE TABLE proposals (
  id serial PRIMARY KEY,
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  submitted_by integer NOT NULL REFERENCES users(id),
  type text NOT NULL CHECK (type IN ('NEW_ITEM','PRICE_UPDATE','DESCRIPTION_UPDATE','IMAGE_UPDATE','ITEM_REMOVAL','CROWN')),
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  reviewed_by integer REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id serial PRIMARY KEY,
  restaurant_id integer REFERENCES restaurants(id),
  created_by integer NOT NULL REFERENCES users(id),
  subject text NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  attachment_url text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED')),
  response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE billing_statements (
  id serial PRIMARY KEY,
  restaurant_id integer NOT NULL REFERENCES restaurants(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_cents integer NOT NULL,
  commission_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, period_start, period_end)
);

CREATE TABLE media_assets (
  id serial PRIMARY KEY,
  storage_key text NOT NULL UNIQUE,
  public_url text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  uploaded_by integer NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor_user_id integer REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_dish ON restaurant_offers(dish_id, status);
CREATE INDEX idx_offers_restaurant ON restaurant_offers(restaurant_id, status);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id, submitted_at DESC);
CREATE INDEX idx_proposals_restaurant ON proposals(restaurant_id, status);
CREATE INDEX idx_sessions_expiry ON professional_sessions(expires_at);
