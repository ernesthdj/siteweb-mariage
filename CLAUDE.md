# CLAUDE.md — Atypique · Fine Art Wedding Photography

Site vitrine immersif + mini CMS pour un studio de photographie de mariage haut de gamme.

---

## Stack

```
React 19 · TypeScript 5 (strict) · Vite 6
Tailwind CSS 3 · Framer Motion 12 · React Router 7
Supabase (PostgreSQL + Auth + RLS)
Vercel (hebergement + Serverless Functions)
Cloudinary (images + audio CDN)
Fonts : Cormorant Garamond · Montserrat · Mrs Saint Delafield
```

---

## Commandes

```bash
npm run dev        # Serveur dev sur localhost:3000
npm run build      # tsc --noEmit && vite build → dist/
npm run preview    # Preview du build de production
```

---

## Architecture des routes

```
# Publiques — page unique avec scroll horizontal
/                       → GalleryWall (Accueil + Portfolio + Contact)
/portfolio              → Redirige vers / (scroll au portfolio)
/portfolio/:id          → Albums d'une collection
/portfolio/:id/:aid     → Photos d'un album (mosaique + carousel)

# Admin (auth Supabase requise)
/admin                  → Login → GalleryWall + AdminToolbar + CRUD inline
/admin/portfolio        → Redirige vers /admin (scroll au portfolio)
/admin/portfolio/:id    → Albums + CRUD
/admin/portfolio/:id/:aid → Photos + CRUD

# API
/api/cloudinary-browse  → Proxy Cloudinary (Vercel Serverless)
```

---

## Structure des fichiers

```
api/cloudinary-browse.ts        → Serverless Function Vercel
components/                     → Composants site vitrine (racine)
  Navigation.tsx                → Navbar + toggle dark/light mode
  GalleryWall.tsx               → Page principale : 3 murs horizontaux + CMS Supabase
  BeamsBackground.tsx           → Faisceaux lumineux animes (dark mode, canvas)
  AudioPlayer.tsx, PhotoFrame.tsx, ArtisticAccents.tsx, HandDrawnFrame.tsx
src/
  App.tsx                       → Routing principal
  main.tsx                      → Point d'entree
  components/admin/             → CMS (AdminContext, LoginPage, ItemControls, ItemForm, CloudinaryBrowser, ...)
  components/gallery/           → Galerie (MosaicWallView, ViewToggle)
  components/                   → Sections (PortfolioSection, AlbumSection, PhotoSection)
  hooks/                        → useAuth, useItems, useCloudinary
  lib/supabase.ts               → Client Supabase
  types/index.ts                → Types partages
  styles/globals.css            → Variables CSS, dark mode, vignette, spots, glass card
constants.tsx                   → AUDIO_TRACKS uniquement
docs/                           → FONDATIONS.md, JOURNAL.md, QA-REPORT.md, DEPLOY.md, SQL
scripts/migrate.mjs             → Script de migration des donnees
```

---

## Path aliases

```
@/*    → racine du projet (./)
@src/* → src/
```

---

## Dark mode

- Toggle lune/soleil dans Navigation.tsx, persistance localStorage
- `data-theme="dark"` sur `<html>`, anti-flash via script inline dans index.html
- Variables CSS : `--bg-color: #1a1510`, `--wall-bg: #231c14`
- Vignette museale attenuee (::after sur .wall-texture)
- BeamsBackground : 20 faisceaux dores animes sur canvas (z-index 45)
- Spots chauds : .photo-spotlight et .canvas-spotlight (drop-shadow dore)
- Grain filmique renforce (opacity 0.08)
- Texte adapte tons creme/parchemin
- Cadre grain (.grain-border) masque en dark mode
- Glass card contact adaptee (fond et bordure attenues)

---

## Base de donnees — Table `items`

Table unique auto-referencee dans Supabase :

| Champ | Type | Role |
|-------|------|------|
| id | UUID | PK |
| type | TEXT | "collection" / "album" / "photo" |
| label | TEXT | Titre affiche |
| url | TEXT | URL image Cloudinary |
| description | TEXT | Texte poetique (carousel) |
| subtitle | TEXT | Sous-titre |
| parent_id | UUID | FK → items.id (null = collection racine) |
| position | INTEGER | Ordre d'affichage |
| visible | BOOLEAN | true = publie, false = brouillon |
| variant | TEXT | Modele visuel ("standard", "showcase") |
| metadata | JSONB | Champ libre extensible |

**RLS** : anon = lecture `visible = true` · authenticated = CRUD complet.

---

## Variables d'environnement

```
VITE_SUPABASE_URL          → URL du projet Supabase (frontend)
VITE_SUPABASE_ANON_KEY     → Cle anonyme Supabase (frontend)
CLOUDINARY_CLOUD_NAME      → Configure dans Vercel env (serverless)
CLOUDINARY_API_KEY         → Configure dans Vercel env (serverless)
CLOUDINARY_API_SECRET      → Configure dans Vercel env (serverless)
```

---

## Securite appliquee

- Headers Vercel : X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict
- Cache immutable sur /assets/
- RLS Supabase active sur la table items
- Secrets Cloudinary cote serveur uniquement (jamais exposes au frontend)
- Protection double-clic sur les actions CMS (isSubmitting)

---

## Conventions

- Esthetique fine art : textures papier, typographies elegantes, animations subtiles
- Composants racine (`components/`) = site vitrine
- Composants `src/components/` = CMS et galerie
- Les deux coexistent via les path aliases
- GalleryWall integre directement le CMS (useItems + useAdmin) pour le portfolio
- Collections affichees dans le scroll horizontal (ruban dynamique)
