CREATE TABLE crown_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

ALTER TABLE crown_experiences
  ADD COLUMN category_id integer REFERENCES crown_categories(id),
  ADD COLUMN capacity_label text NOT NULL DEFAULT '',
  ADD COLUMN included_text text NOT NULL DEFAULT '',
  ADD COLUMN badges_text text NOT NULL DEFAULT '',
  ADD COLUMN gallery_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

INSERT INTO crown_categories(name,slug,description,sort_order,status) VALUES
  ('VIP','vip','Tables remarquables et attentions exclusives.',10,'PUBLISHED'),
  ('À deux','a-deux','Moments privés pensés pour deux.',20,'PUBLISHED'),
  ('En famille','en-famille','Grandes tables et menus à partager.',30,'PUBLISHED'),
  ('Entre amis','entre-amis','Expériences généreuses pour se retrouver.',40,'PUBLISHED'),
  ('Célébration','celebration','Occasions composées jusque dans les détails.',50,'PUBLISHED')
ON CONFLICT (slug) DO NOTHING;

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY featured DESC,id) AS position
  FROM crown_experiences
)
UPDATE crown_experiences e SET
  category_id = c.id,
  capacity_label = CASE ranked.position WHEN 1 THEN '2 personnes' WHEN 2 THEN '4 personnes' WHEN 3 THEN '4 personnes' ELSE '6 personnes' END,
  included_text = CASE ranked.position
    WHEN 1 THEN 'Menu en plusieurs temps|Accueil privilégié|Table privée'
    WHEN 2 THEN 'Menu de saison|Service au jardin|Dessert à partager'
    WHEN 3 THEN 'Menu au feu|Accords sans alcool|Service dédié'
    ELSE 'Menu familial|Dessert inclus|Grande tablée'
  END,
  badges_text = CASE ranked.position WHEN 1 THEN 'ÉDITION LIMITÉE|CHEF EXPERIENCE' WHEN 2 THEN 'PRIVÉ|VÉGÉTAL' WHEN 3 THEN 'ATLANTIQUE|SIGNATURE' ELSE 'FAMILLE|DIMANCHE' END,
  gallery_urls = CASE WHEN e.image_url IS NULL THEN ARRAY[]::text[] ELSE ARRAY[e.image_url] END,
  sort_order = ranked.position * 10
FROM ranked
JOIN crown_categories c ON c.slug = CASE ranked.position WHEN 1 THEN 'a-deux' WHEN 2 THEN 'vip' WHEN 3 THEN 'entre-amis' ELSE 'en-famille' END
WHERE e.id = ranked.id AND e.category_id IS NULL;

CREATE INDEX idx_crown_experiences_category ON crown_experiences(category_id,status,sort_order);

UPDATE restaurants
SET description = 'Adresse partenaire sélectionnée par TAVO.'
WHERE description ILIKE '%démonstration%';
