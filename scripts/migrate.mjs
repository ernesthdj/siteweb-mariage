/**
 * Script de migration — insère les données existantes dans Supabase
 * Usage: node scripts/migrate.mjs
 */

// Lire depuis les variables d'environnement ou .env.local
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const APIKEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

async function getToken() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': APIKEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL || 'admin@example.com', password: process.env.ADMIN_PASSWORD || 'changeme' })
  });
  const data = await res.json();
  return data.access_token;
}

async function insert(token, items) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
    method: 'POST',
    headers: {
      'apikey': APIKEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(items)
  });
  const data = await res.json();
  if (res.status >= 400) {
    console.error('ERREUR:', JSON.stringify(data));
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

async function main() {
  console.log('Authentification...');
  const token = await getToken();

  // === COLLECTIONS ===
  console.log('\n--- Collections ---');
  const collections = [
    { type: 'collection', label: "Un Mariage en Lumière", subtitle: "Expérience immersive", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770064512/Couverture_nbazb6.png", description: "Découvrez un mariage complet à travers une présentation unique — cliquez sur chaque tableau pour révéler l'instant capturé.", position: 0, visible: true, variant: "showcase" },
    { type: 'collection', label: "Noces d'Éternité", subtitle: "L'élégance du serment", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg", description: "Une capture intemporelle des instants de grâce où deux âmes s'unissent.", position: 1, visible: true, variant: "standard" },
    { type: 'collection', label: "Brume Organique", subtitle: "Murmures sauvages", url: "/photos/nature/cover.jpg", description: "La nature dans son état brut, entre silence forestier et échos minéraux.", position: 2, visible: false, variant: "standard" },
    { type: 'collection', label: "Saveurs Obscures", subtitle: "L'art de la table", url: "/photos/culinary/cover.jpg", description: "Quand la gastronomie devient une sculpture de lumière et de contrastes.", position: 3, visible: false, variant: "standard" },
    { type: 'collection', label: "Noir Couture", subtitle: "Tissu et caractère", url: "/photos/fashion/cover.jpg", description: "La mode comme expression brute.", position: 4, visible: false, variant: "standard" },
    { type: 'collection', label: "Béton Brisé", subtitle: "Géométrie sauvage", url: "/photos/urban/cover.jpg", description: "L'urbain dans ce qu'il a de plus graphique.", position: 5, visible: false, variant: "standard" },
    { type: 'collection', label: "Minimalisme Corbuséen", subtitle: "Lignes et silence", url: "/photos/architecture/cover.jpg", description: "L'architecture réduite à l'essentiel.", position: 6, visible: false, variant: "standard" },
    { type: 'collection', label: "Souffle Premier", subtitle: "L'aube d'une vie", url: "/photos/birth/cover.jpg", description: "Les premières heures, les premiers regards.", position: 7, visible: false, variant: "standard" },
    { type: 'collection', label: "Visages d'Âme", subtitle: "L'intime dévoilé", url: "/photos/portrait/cover.jpg", description: "Le portrait comme miroir de l'âme.", position: 8, visible: false, variant: "standard" },
  ];

  const insertedCollections = await insert(token, collections);
  insertedCollections.forEach(c => console.log(`  ✓ ${c.label} (${c.id})`));

  // Récupérer les IDs
  const showcaseId = insertedCollections.find(c => c.label === "Un Mariage en Lumière")?.id;
  const weddingId = insertedCollections.find(c => c.label === "Noces d'Éternité")?.id;

  if (!showcaseId || !weddingId) {
    console.error('Collections principales non trouvées!');
    return;
  }

  // === ALBUM dans Showcase ===
  console.log('\n--- Album ---');
  const albums = [
    { type: 'album', label: "Un Mariage en Lumière", subtitle: "Sophie & Thomas — Juin 2024", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770064512/Couverture_nbazb6.png", description: "Une journée d'amour capturée dans sa plus belle lumière.", position: 0, visible: true, parent_id: showcaseId }
  ];

  const insertedAlbums = await insert(token, albums);
  insertedAlbums.forEach(a => console.log(`  ✓ ${a.label} (${a.id})`));
  const albumId = insertedAlbums[0]?.id;

  // === PHOTOS Wedding (3 photos dans Noces d'Éternité) ===
  console.log('\n--- Photos Wedding ---');
  const weddingPhotos = [
    { type: 'photo', label: "Premier regard", subtitle: "L'instant suspendu", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg", position: 0, visible: true, parent_id: weddingId, metadata: { width: 400, height: 600, rotation: -2 } },
    { type: 'photo', label: "Promesses", subtitle: "Éternité scellée", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971496/_DSC9596_jadlvn.jpg", position: 1, visible: true, parent_id: weddingId, metadata: { width: 380, height: 570, rotation: 1.5 } },
    { type: 'photo', label: "Union sacrée", subtitle: "Deux âmes", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971494/DSC04015_obav3q.jpg", position: 2, visible: true, parent_id: weddingId, metadata: { width: 600, height: 400, rotation: -1 } },
  ];

  const insertedWedding = await insert(token, weddingPhotos);
  insertedWedding.forEach(p => console.log(`  ✓ ${p.label}`));

  // === PHOTOS Showcase (23 photos mock dans l'album) ===
  console.log('\n--- Photos Showcase (23 mock) ---');
  const mockPhotos = [
    { label: "Le Premier Regard", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770059771/photo_mockup_1_zcr8o3.png" },
    { label: "Tendresse", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770059801/photo_mockup_2_gkf5p1.png" },
    { label: "Complicité", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770059830/photo_mockup_3_epxfzw.png" },
    { label: "Éternité", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770078835/photo_mockup_4_qp4qt7.png" },
    { label: "Promesses", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770078914/photo_mockup_5_nnxhfv.png" },
    { label: "Lumière Dorée", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770078946/photo_mockup_6_gqalg1.png" },
    { label: "Harmonie", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079004/photo_mockup_7_kcckka.png" },
    { label: "Passion", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079144/photo_mockup_8_v1pf3u.png" },
    { label: "Serment", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079202/photo_mockup_9_j7ahpe.png" },
    { label: "Crépuscule", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079237/photo_mockup_10_ry3qgs.png" },
    { label: "Alliance", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079275/photo_mockup_11_d3cojt.png" },
    { label: "Grâce", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079313/photo_mockup_12_h8gsfh.png" },
    { label: "Murmures", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079547/photo_mockup_13_ymgp8s.png" },
    { label: "Éclat", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079596/photo_mockup_14_swlxjj.png" },
    { label: "Intimité", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079745/photo_mockup_15_aapfvw.png" },
    { label: "Rêverie", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079803/photo_mockup_16_tsgbfl.png" },
    { label: "Sérénité", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079852/photo_mockup_17_jxjxui.png" },
    { label: "Délicatesse", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079954/photo_mockup_18_kuhxss.png" },
    { label: "Félicité", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079998/photo_mockup_19_cbeyxg.png" },
    { label: "Douceur", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770080043/photo_mockup_20_xm2xjr.png" },
    { label: "Émerveillement", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770080076/photo_mockup_21_mlbtj6.png" },
    { label: "Préparatifs", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770080132/photo_mockup_22_lkrwdj.png" },
    { label: "Alliance Éternelle", url: "https://res.cloudinary.com/dzoshz4ut/image/upload/v1770080160/photo_mockup_23_ywfnlh.png" },
  ].map((p, i) => ({
    type: 'photo',
    label: p.label,
    url: p.url,
    position: i,
    visible: true,
    parent_id: albumId,
  }));

  const insertedMock = await insert(token, mockPhotos);
  console.log(`  ✓ ${insertedMock.length} photos insérées`);

  // === VÉRIFICATION ===
  console.log('\n=== Résumé ===');
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/items?select=type`, {
    headers: { 'apikey': APIKEY, 'Authorization': `Bearer ${token}` }
  });
  const all = await countRes.json();
  const counts = all.reduce((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {});
  console.log(`  Collections: ${counts.collection || 0}`);
  console.log(`  Albums: ${counts.album || 0}`);
  console.log(`  Photos: ${counts.photo || 0}`);
  console.log(`  Total: ${all.length}`);
  console.log('\n✅ Migration terminée !');
}

main().catch(console.error);
