-- =============================================================================
-- Atypique CMS — Migration des données existantes (constants.tsx → Supabase)
-- À exécuter APRÈS supabase-setup.sql
-- =============================================================================
-- Les UUIDs sont générés via gen_random_uuid() sauf pour les collections/albums
-- qui utilisent des UUIDs fixes pour permettre le référencement parent_id.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. COLLECTIONS (type = 'collection', parent_id = NULL)
-- =============================================================================

-- Collection "Showcase" — galerie immersive principale
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'collection', 'Un Mariage en Lumière', 'Expérience immersive',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770064512/Couverture_nbazb6.png',
   'Découvrez un mariage complet à travers une présentation unique — cliquez sur chaque tableau pour révéler l''instant capturé.',
   0, true, 'showcase');

-- Collection "Wedding"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000002', 'collection', 'Noces d''Éternité', 'L''élégance du serment',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg',
   'Une capture intemporelle des instants de grâce où deux âmes s''unissent.',
   1, true, 'wedding');

-- Collection "Nature"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000003', 'collection', 'Brume Organique', 'Murmures sauvages',
   '/photos/nature/cover.jpg',
   'La nature dans son état brut, entre silence forestier et échos minéraux.',
   2, false, 'nature');

-- Collection "Culinary"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000004', 'collection', 'Saveurs Obscures', 'L''art de la table',
   '/photos/culinary/cover.jpg',
   'Quand la gastronomie devient une sculpture de lumière et de contrastes.',
   3, false, 'culinary');

-- Collection "Fashion"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000005', 'collection', 'Noir Couture', 'Lignes & Silhouettes',
   '/photos/fashion/cover.jpg',
   'Une exploration graphique du vêtement comme une seconde peau architecturale.',
   4, false, 'fashion');

-- Collection "Urban"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000006', 'collection', 'Béton Brisé', 'Géométrie urbaine',
   '/photos/urban/cover.jpg',
   'L''exploration des lignes et des silences au cœur du chaos citadin.',
   5, false, 'urban');

-- Collection "Architecture"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000007', 'collection', 'Minimalisme Corbuséen', 'Espace & Vide',
   '/photos/architecture/cover.jpg',
   'La structure comme poésie. Le béton devient une page blanche pour l''ombre.',
   6, false, 'architecture');

-- Collection "Birth"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000008', 'collection', 'Souffle Premier', 'La vie qui commence',
   '/photos/birth/cover.jpg',
   'La douceur infinie des premiers regards et de la fragilité nouvelle.',
   7, false, 'birth');

-- Collection "Portrait"
INSERT INTO items (id, type, label, subtitle, url, description, position, visible, variant) VALUES
  ('a0000001-0000-0000-0000-000000000009', 'collection', 'Visages d''Âme', 'Intimité révélée',
   '/photos/portrait/cover.jpg',
   'Dépasser la surface pour capturer l''essence même du sujet.',
   8, false, 'portrait');

-- =============================================================================
-- 2. ALBUM (type = 'album', parent_id = collection showcase)
-- =============================================================================

INSERT INTO items (id, type, label, subtitle, url, description, parent_id, position, visible, variant, metadata) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'album', 'Un Mariage en Lumière', 'Marie & Thomas',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-19_ztblft.png',
   'Une journée magique capturée dans toute sa splendeur.',
   'a0000001-0000-0000-0000-000000000001', 0, true, 'standard',
   '{"displayConfig": {"image": {"scale": 0.95, "rotation": -2, "offsetX": 0, "offsetY": 0}, "text": {"content": "Une journée magique où chaque instant raconte une histoire d''amour. Des préparatifs intimes jusqu''à la danse finale, nous avons capturé l''essence même de leur union.", "offsetX": 0, "offsetY": 0, "rotation": 1, "scale": 1, "opacity": 0.85}, "layout": {"side": "left", "marginTop": 0, "marginBottom": 80}}}');

-- =============================================================================
-- 3. PHOTOS DE L'ALBUM "Un Mariage en Lumière" (type = 'photo')
-- =============================================================================

INSERT INTO items (type, label, url, parent_id, position, visible, variant) VALUES
  ('photo', 'Le Premier Regard',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-19_ztblft.png',
   'b0000001-0000-0000-0000-000000000001', 0, true, 'standard'),

  ('photo', 'Tendresse',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-26_nfndp8.png',
   'b0000001-0000-0000-0000-000000000001', 1, true, 'standard'),

  ('photo', 'Complicité',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071102/02-5x7-A4-PORTRAIT-frame-20_mdtci3.png',
   'b0000001-0000-0000-0000-000000000001', 2, true, 'standard'),

  ('photo', 'Éternité',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-12_ybmaov.png',
   'b0000001-0000-0000-0000-000000000001', 3, true, 'standard'),

  ('photo', 'Sérénité',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-16_gugdmr.png',
   'b0000001-0000-0000-0000-000000000001', 4, true, 'standard'),

  ('photo', 'Douceur',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071099/02-5x7-A4-PORTRAIT-frame-21_gwyxl8.png',
   'b0000001-0000-0000-0000-000000000001', 5, true, 'standard'),

  ('photo', 'Harmonie',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071097/02-5x7-A4-PORTRAIT-frame-07_pmpptz.png',
   'b0000001-0000-0000-0000-000000000001', 6, true, 'standard'),

  ('photo', 'Passion',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071096/Portrait2_SO_coqvvc.png',
   'b0000001-0000-0000-0000-000000000001', 7, true, 'standard'),

  ('photo', 'Promesse',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071093/02-5x7-A4-PORTRAIT-frame-15_wfg5ic.png',
   'b0000001-0000-0000-0000-000000000001', 8, true, 'standard'),

  ('photo', 'Lumière',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-22_fqagtl.png',
   'b0000001-0000-0000-0000-000000000001', 9, true, 'standard'),

  ('photo', 'Mains Croisées',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/54456_gflfoe.png',
   'b0000001-0000-0000-0000-000000000001', 10, true, 'standard'),

  ('photo', 'Voile de Mariée',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-06_itusr3.png',
   'b0000001-0000-0000-0000-000000000001', 11, true, 'standard'),

  ('photo', 'Élégance',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071090/02-5x7-A4-PORTRAIT-frame-23_f4khfm.png',
   'b0000001-0000-0000-0000-000000000001', 12, true, 'standard'),

  ('photo', 'Grâce',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-25_rfn95u.png',
   'b0000001-0000-0000-0000-000000000001', 13, true, 'standard'),

  ('photo', 'Rêverie',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-11_x5a8iu.png',
   'b0000001-0000-0000-0000-000000000001', 14, true, 'standard'),

  ('photo', 'Délicatesse',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-18_xaa6rr.png',
   'b0000001-0000-0000-0000-000000000001', 15, true, 'standard'),

  ('photo', 'Reflet',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-17_n23ur2.png',
   'b0000001-0000-0000-0000-000000000001', 16, true, 'standard'),

  ('photo', 'Silhouette',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071082/02-5x7-A4-PORTRAIT-frame-24_jiydrt.png',
   'b0000001-0000-0000-0000-000000000001', 17, true, 'standard'),

  ('photo', 'Émotion',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071080/02-5x7-A4-PORTRAIT-frame-10_oo52wy.png',
   'b0000001-0000-0000-0000-000000000001', 18, true, 'standard'),

  ('photo', 'Instant Suspendu',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071079/02-5x7-A4-PORTRAIT-frame-03_xgye9l.png',
   'b0000001-0000-0000-0000-000000000001', 19, true, 'standard'),

  ('photo', 'Bouquet Final',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071078/02-5x7-A4-PORTRAIT-frame-05_cs8d8e.png',
   'b0000001-0000-0000-0000-000000000001', 20, true, 'standard'),

  -- mock22 et mock23 : titres nettoyés (étaient inappropriés dans constants.tsx)
  ('photo', 'Préparatifs',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079342/02-5x7-A4-PORTRAIT-frame-01_wscpuw.png',
   'b0000001-0000-0000-0000-000000000001', 21, true, 'standard'),

  ('photo', 'Alliance',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079341/02-5x7-A4-PORTRAIT-frame-04_ffuc64.png',
   'b0000001-0000-0000-0000-000000000001', 22, true, 'standard');

-- =============================================================================
-- 4. PHOTOS DE LA COLLECTION "Wedding" (directement dans la collection)
-- =============================================================================

INSERT INTO items (type, label, url, parent_id, position, visible, variant, metadata) VALUES
  ('photo', 'Premier regard',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg',
   'a0000001-0000-0000-0000-000000000002', 0, true, 'standard',
   '{"subtitle": "L''instant suspendu", "width": 400, "height": 600, "rotation": -2}'),

  ('photo', 'Promesses',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971496/_DSC9596_jadlvn.jpg',
   'a0000001-0000-0000-0000-000000000002', 1, true, 'standard',
   '{"subtitle": "Éternité scellée", "width": 380, "height": 570, "rotation": 1.5}'),

  ('photo', 'Union sacrée',
   'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971494/DSC04015_obav3q.jpg',
   'a0000001-0000-0000-0000-000000000002', 2, true, 'standard',
   '{"subtitle": "Deux âmes", "width": 600, "height": 400, "rotation": -1}');

COMMIT;
