# CLAUDE.md — Atypique · Fine Art Wedding Photography

Site vitrine immersif + mini CMS pour un studio de photographie de mariage haut de gamme.

---

## Stack

```
React 19 · TypeScript 5 (strict) · Vite 6
Tailwind CSS 3 · Framer Motion 12 · React Router 7
Supabase (PostgreSQL + Auth + RLS)
Vercel (hébergement + Serverless Functions)
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
# Publiques
/                       → Accueil + Contact (GalleryWall)
/portfolio              → Collections depuis Supabase
/portfolio/:id          → Albums d'une collection
/portfolio/:id/:aid     → Photos d'un album (mosaïque + carousel)

# Admin (auth Supabase requise)
/admin                  → Login → CMS WYSIWYG
/admin/portfolio        → Collections + CRUD
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
  Navigation.tsx, GalleryWall.tsx, AudioPlayer.tsx, PhotoFrame.tsx, ...
src/
  App.tsx                       → Routing principal
  main.tsx                      → Point d'entrée
  components/admin/             → CMS (AdminContext, LoginPage, ItemControls, ItemForm, CloudinaryBrowser, ...)
  components/gallery/           → Galerie (MosaicWallView, ViewToggle)
  components/                   → Sections (PortfolioSection, AlbumSection, PhotoSection)
  hooks/                        → useAuth, useItems, useCloudinary
  lib/supabase.ts               → Client Supabase
  types/index.ts                → Types partagés
  styles/globals.css             → Styles globaux + Tailwind
docs/                           → FONDATIONS.md, JOURNAL.md, QA-REPORT.md, DEPLOY.md, SQL setup/migration
scripts/migrate.mjs             → Script de migration des données
```

---

## Path aliases

```
@/*    → racine du projet (./)
@src/* → src/
```

---

## Base de données — Table `items`

Table unique auto-référencée dans Supabase :

| Champ | Type | Rôle |
|-------|------|------|
| id | UUID | PK |
| type | TEXT | "collection" / "album" / "photo" |
| label | TEXT | Titre affiché |
| url | TEXT | URL image Cloudinary |
| description | TEXT | Texte poétique (carousel) |
| subtitle | TEXT | Sous-titre |
| parent_id | UUID | FK → items.id (null = collection racine) |
| position | INTEGER | Ordre d'affichage |
| visible | BOOLEAN | true = publié, false = brouillon |
| variant | TEXT | Modèle visuel ("standard", "showcase") |
| metadata | JSONB | Champ libre extensible |

**RLS** : anon = lecture `visible = true` · authenticated = CRUD complet.

---

## Variables d'environnement

```
VITE_SUPABASE_URL          → URL du projet Supabase (frontend)
VITE_SUPABASE_ANON_KEY     → Clé anonyme Supabase (frontend)
CLOUDINARY_CLOUD_NAME      → Configuré dans Vercel env (serverless)
CLOUDINARY_API_KEY         → Configuré dans Vercel env (serverless)
CLOUDINARY_API_SECRET      → Configuré dans Vercel env (serverless)
```

---

## Sécurité appliquée

- Headers Vercel : X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict
- Cache immutable sur /assets/
- RLS Supabase active sur la table items
- Secrets Cloudinary côté serveur uniquement (jamais exposés au frontend)
- Protection double-clic sur les actions CMS (isSubmitting)

---

## Conventions

- Esthétique fine art : textures papier, typographies élégantes, animations subtiles
- Composants racine (`components/`) = site vitrine original
- Composants `src/components/` = CMS et galerie refactorisés
- Les deux coexistent via les path aliases
