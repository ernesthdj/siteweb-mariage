# SAVE — Atypique · Fine Art Wedding Photography
> Derniere mise a jour : 2026-04-26

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
| Navigation 3 sections | ✅ Operationnel (React Router) |
| Animations (Framer Motion) | ✅ Soignees |
| Lecteur audio ambiant | ✅ Fonctionnel (3 pistes Cloudinary) |
| Mini CMS Admin | ✅ Fonctionnel (CRUD complet, /admin) |
| Auth admin | ✅ Supabase Auth (email/mdp) |
| Base de donnees | ✅ Supabase PostgreSQL (table items, RLS) |
| Explorateur Cloudinary | ✅ Navigation dossiers + miniatures |
| Navigation hierarchique | ✅ Collections → Albums → Photos |
| Vue Mosaique | ✅ CSS columns, PNG transparents, drop-shadow |
| Vue Carousel | ✅ Plein ecran, typewriter, navigation clavier/molette |
| Donnees migrees | ✅ 9 collections, 1 album, 26 photos en base |
| Titres mock22-23 | ✅ Nettoyes lors de la migration |
| Build de production | ✅ Vite, TypeScript strict |
| Hebergement | ✅ Vercel (auto-deploy GitHub) |
| Formulaire de contact | ⚠️ Structure HTML uniquement, pas de backend |
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
  /                     → Accueil + Contact (GalleryWall original)
  /portfolio            → Collections depuis Supabase
  /portfolio/:id        → Albums d'une collection
  /portfolio/:id/:aid   → Photos d'un album (mosaique + carousel)

URL admin :
  /admin                → Login → Accueil + AdminToolbar
  /admin/portfolio      → Collections + controles CRUD
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
├── components/                  # Composants site original (racine)
│   ├── Navigation.tsx
│   ├── GalleryWall.tsx
│   ├── AudioPlayer.tsx
│   ├── PhotoFrame.tsx
│   ├── ThemeCanvas.tsx
│   ├── MockGalleryView.tsx
│   ├── MosaicGalleryView.tsx
│   └── ...
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
│   │   ├── PortfolioSection.tsx
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
│       └── globals.css
├── docs/
│   ├── FONDATIONS.md
│   ├── JOURNAL.md
│   ├── QA-REPORT.md
│   ├── DEPLOY.md
│   ├── supabase-setup.sql
│   └── supabase-migration.sql
├── scripts/
│   └── migrate.mjs
├── vercel.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

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
- Creer / modifier / supprimer des items a chaque niveau
- Toggle visible/brouillon (items brouillon en opacite reduite)
- Explorateur Cloudinary integre (parcourir dossiers, miniatures, selection visuelle)
- Confirmation avant suppression (bouton "Confirmer ?" pendant 3s)
- Protection double-clic (state isSubmitting)

---

## Ce qui reste a faire (backlog)

### Priorite haute
- [ ] Implementer la soumission du formulaire de contact
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

*Document mis a jour le 2026-04-26.*
