# SAVE — Atypique · Fine Art Wedding Photography
> Derniere mise a jour : 2026-04-27

---

## Concept

Site vitrine immersif pour un studio de photographie de mariage haut de gamme.
Nom de marque : **Atypique**
Contact affiche : `hello@atypique-studio.com`
Esthetique : galerie fine art — textures papier, typographies elegantes, navigation spatiale.
**Mini CMS integre** pour gerer le contenu sans toucher au code.

---

## Etat du projet

| Axe | Etat |
|-----|------|
| UI / Layout general | ✅ Termine et responsive |
| Navigation 3 sections (scroll horizontal) | ✅ Accueil + Portfolio + Contact sur une page |
| Animations (Framer Motion) | ✅ Soignees |
| Lecteur audio ambiant | ✅ Fonctionnel (3 pistes Cloudinary) |
| Dark mode galerie nocturne | ✅ Toggle dans navbar, persistance localStorage |
| Beams Background (dark mode) | ✅ Faisceaux dores animes (canvas) |
| Vignette museale (dark mode) | ✅ Attenuee, masquee sur grain-border |
| Mini CMS Admin | ✅ Fonctionnel (CRUD complet, /admin) |
| CMS integre au scroll horizontal | ✅ Collections Supabase dans GalleryWall |
| Auth admin | ✅ Supabase Auth (email/mdp) |
| Base de donnees | ✅ Supabase PostgreSQL (table items, RLS) |
| Explorateur Cloudinary | ✅ Navigation dossiers + miniatures |
| Navigation hierarchique | ✅ Collections → Albums → Photos |
| Vue Mosaique | ✅ CSS columns, PNG transparents, drop-shadow |
| Vue Carousel | ✅ Plein ecran, typewriter, navigation clavier/molette |
| Donnees migrees | ✅ 9 collections, 1 album, 26 photos en base |
| Build de production | ✅ Vite, TypeScript strict |
| Hebergement | ✅ Vercel (auto-deploy GitHub) |
| Formulaire de contact (glass card) | ⚠️ UI glassmorphism terminee, pas de backend |
| Bio photographe | ⚠️ Placeholder Unsplash |
| SEO | ⚠️ Pas de meta tags, OG, sitemap |
| Domaine personnalise | ❌ Pas configure |

---

## Stack technique

```
React 19 + TypeScript 5 + Vite 6
Tailwind CSS (npm, installe localement)
Framer Motion 12
React Router 7
Supabase (PostgreSQL + Auth + RLS)
Vercel (hebergement + Serverless Functions)
Cloudinary (images + audio CDN)
Fonts : Cormorant Garamond · Montserrat · Mrs Saint Delafield
```

---

## Architecture

```
URL publiques :
  /                     → Accueil + Portfolio + Contact (GalleryWall, scroll horizontal)
  /portfolio            → Redirige vers / (scroll au portfolio)
  /portfolio/:id        → Albums d'une collection
  /portfolio/:id/:aid   → Photos d'un album (mosaique + carousel)

URL admin :
  /admin                → Login → Accueil + Portfolio + Contact + AdminToolbar
  /admin/portfolio      → Redirige vers /admin (scroll au portfolio)
  /admin/portfolio/:id  → Albums + controles CRUD
  /admin/portfolio/:id/:aid → Photos + controles CRUD

API Serverless :
  /api/cloudinary-browse → Proxy Cloudinary (dossiers + images)
```

---

## Structure des fichiers

```
SiteWeb_Mariage/
├── api/
│   └── cloudinary-browse.ts     # Vercel Serverless Function
├── components/                  # Composants site vitrine (racine)
│   ├── Navigation.tsx           # Navbar + toggle dark mode
│   ├── GalleryWall.tsx          # Page principale (3 murs horizontaux + CMS)
│   ├── BeamsBackground.tsx      # Faisceaux lumineux animes (dark mode)
│   ├── AudioPlayer.tsx
│   ├── PhotoFrame.tsx
│   ├── ArtisticAccents.tsx
│   └── HandDrawnFrame.tsx
├── src/
│   ├── App.tsx                  # Routing React Router
│   ├── main.tsx                 # Point d'entree
│   ├── components/
│   │   ├── admin/               # Composants CMS
│   │   │   ├── AdminContext.tsx
│   │   │   ├── AdminToolbar.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ItemControls.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── CloudinaryBrowser.tsx
│   │   │   └── AddItemButton.tsx
│   │   ├── gallery/             # Composants galerie
│   │   │   ├── ViewToggle.tsx
│   │   │   └── MosaicWallView.tsx
│   │   ├── PortfolioSection.tsx # Reference (plus route directement)
│   │   ├── AlbumSection.tsx
│   │   └── PhotoSection.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useItems.ts
│   │   └── useCloudinary.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css          # Variables CSS, dark mode, vignette, beams
├── docs/
│   ├── FONDATIONS.md
│   ├── JOURNAL.md
│   ├── QA-REPORT.md
│   ├── DEPLOY.md
│   ├── supabase-setup.sql
│   └── supabase-migration.sql
├── scripts/
│   └── migrate.mjs
├── constants.tsx                # AUDIO_TRACKS uniquement
├── CLAUDE.md
├── vercel.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## Dark mode — Galerie nocturne

- **Toggle** : bouton lune/soleil dans la navbar, persistance localStorage
- **Fond** : brun tamise `#231c14` avec texture papier
- **Vignette** : radial-gradient attenue sur les bords (::after sur .wall-texture)
- **Beams** : 20 faisceaux dores animes (canvas, ::before), uniquement en dark mode
- **Spots** : halos chauds derriere les cadres photo (.photo-spotlight, .canvas-spotlight)
- **Grain** : opacite renforcee (0.08 vs 0.04)
- **Texte** : tons creme/parchemin adaptes
- **Grain-border** : masque en dark mode (opacity: 0)
- **Anti-flash** : script inline dans index.html avant React

---

## Base de donnees (Supabase)

### Table `items` — Item universel auto-reference

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Cle primaire |
| type | TEXT | "collection", "album", "photo" |
| label | TEXT | Titre affiche |
| url | TEXT | URL image Cloudinary |
| description | TEXT | Texte poetique (carousel) |
| subtitle | TEXT | Sous-titre |
| parent_id | UUID | FK → items.id (null = collection racine) |
| position | INTEGER | Ordre d'affichage (drag & drop) |
| visible | BOOLEAN | true = publie, false = brouillon |
| variant | TEXT | Modele visuel ("standard", "showcase") |
| metadata | JSONB | Champ libre extensible |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto (trigger) |

### RLS (Row Level Security)
- Visiteurs (anon) : lecture des items `visible = true` uniquement
- Admin (authenticated) : CRUD complet

### Donnees actuelles
- 9 collections (2 visibles : Showcase + Wedding, 7 brouillons)
- 1 album
- 26 photos (3 wedding + 23 mock)

---

## CMS Admin — Fonctionnalites

- Login via `/admin` (email/mdp Supabase Auth)
- Mode WYSIWYG : navigation identique au site + controles CRUD superposes
- CRUD collections directement dans le scroll horizontal (ruban dynamique)
- Creer / modifier / supprimer des items a chaque niveau
- Toggle visible/brouillon (items brouillon en opacite reduite)
- Explorateur Cloudinary integre (parcourir dossiers, miniatures, selection visuelle)
- Confirmation avant suppression (bouton "Confirmer ?" pendant 3s)
- Protection double-clic (state isSubmitting)

---

## Ce qui reste a faire (backlog)

### Priorite haute
- [ ] Implementer la soumission du formulaire de contact (backend)
- [ ] Remplacer le placeholder bio photographe par une vraie photo
- [ ] Drag & drop pour reordonner les items (prepare, pas encore branche)

### Priorite moyenne
- [ ] SEO : balises meta, OG, sitemap, robots.txt
- [ ] Performances : lazy loading images, optimisation Cloudinary
- [ ] Variantes visuelles selectionnables dans le CMS

### Priorite basse / v2
- [ ] Domaine personnalise `atypique-studio.com`
- [ ] Analytics (Plausible ou GA4)
- [ ] Version multilingue (FR/EN)
- [ ] Edge Function Supabase pour le proxy Cloudinary (alternative a Vercel)

---

## Liens

- **Site en ligne** : https://siteweb-mariage.vercel.app
- **Admin CMS** : https://siteweb-mariage.vercel.app/admin
- **GitHub** : https://github.com/ernesthdj/siteweb-mariage
- **Supabase** : https://peqxvylhqcbhxoqteiih.supabase.co
- **Cloudinary** : cloud name `dzoshz4ut`

---

*Document mis a jour le 2026-04-27.*
