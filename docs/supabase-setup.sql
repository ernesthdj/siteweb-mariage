-- =============================================================================
-- Atypique CMS — Supabase Setup Script
-- À exécuter dans le SQL Editor de Supabase (une seule fois)
-- =============================================================================

-- Table principale : items (collection > album > photo)
CREATE TABLE items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('collection', 'album', 'photo')),
  label       TEXT NOT NULL,
  url         TEXT,
  description TEXT,
  subtitle    TEXT,
  parent_id   UUID REFERENCES items(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  visible     BOOLEAN NOT NULL DEFAULT false,
  variant     TEXT NOT NULL DEFAULT 'standard',
  metadata    JSONB DEFAULT '{}',
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_hierarchy CHECK (
    (type = 'collection' AND parent_id IS NULL) OR
    (type IN ('album', 'photo') AND parent_id IS NOT NULL)
  )
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_items_parent_id ON items(parent_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_position ON items(parent_id, position);
CREATE INDEX idx_items_visible ON items(visible);

-- Trigger : mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS (Row Level Security) — Sécurité par rôle
-- =============================================================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Visiteurs anonymes : lecture des items publiés uniquement
CREATE POLICY "Visiteurs: lecture items publiés"
  ON items FOR SELECT TO anon
  USING (visible = true);

-- Administrateurs authentifiés : accès complet
CREATE POLICY "Admin: lecture complète"
  ON items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin: création"
  ON items FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin: modification"
  ON items FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin: suppression"
  ON items FOR DELETE TO authenticated
  USING (true);

-- =============================================================================
-- Fonction RPC : réordonnancement batch des items
-- Reçoit un tableau JSON [{id, position}, ...] et met à jour en une seule requête
-- =============================================================================

CREATE OR REPLACE FUNCTION reorder_items(p_items JSONB)
RETURNS void AS $$
BEGIN
  -- CRIT-01 fix : bloquer les appels anonymes (auth.uid() null)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise pour réordonner les items';
  END IF;

  UPDATE items AS i
  SET position = (item->>'position')::int,
      updated_at = now()
  FROM jsonb_array_elements(p_items) AS item
  WHERE i.id = (item->>'id')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
