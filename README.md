# Atypique — Photographie de Mariage Fine Art

Site vitrine immersif avec mini CMS pour un studio de photographie de mariage haut de gamme. Scroll horizontal, galeries dynamiques, dark mode cinematique, administration inline.

**En production** — deploye sur Vercel.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 · TypeScript (strict) · Tailwind CSS · Framer Motion |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Media** | Cloudinary (CDN images/audio) |
| **API** | Vercel Serverless Functions (proxy Cloudinary) |
| **Deploiement** | Vercel |
| **Build** | Vite |

---

## Fonctionnalites

### Site public
- Experience single-page immersive avec scroll horizontal
- Trois sections : Accueil — Portfolio — Contact
- Galeries en mosaique avec navigation par breadcrumb
- Dark mode cinematique (beams dores animes en canvas, grain de film, effet verre givre)
- Lecteur audio ambiant
- Typographie premium (Cormorant Garamond · Montserrat · Mrs Saint Delafield)

### CMS Admin
- Authentification Supabase
- Edition inline WYSIWYG : collections, albums, photos
- Navigateur d'images Cloudinary integre
- Drag-to-reorder, toggle de visibilite, operations groupees
- Formulaires avec metadonnees extensibles (JSONB)

---

## Architecture

```
src/
├── components/
│   ├── admin/       CMS (login, toolbar, formulaires, navigateur Cloudinary)
│   └── gallery/     Portfolio public (mosaique, breadcrumb, carrousel)
├── hooks/           useAuth · useItems (CRUD Supabase) · useCloudinary
├── lib/             Client Supabase
├── styles/          Variables CSS, dark mode, glass cards
└── types/           Types partages (Item, ItemType)
api/
└── cloudinary-browse.ts   Serverless function (proxy securise)
docs/                      Documentation projet + migrations SQL
```

### Base de donnees

Table unique `items` auto-referencee (collection > album > photo) avec RLS :
- Anonyme : lecture seule (`visible = true`)
- Authentifie : CRUD complet

---

## Demarrage

```bash
npm install
npm run dev
```

Variables d'environnement (`.env.local`) :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Deploiement

Deploye automatiquement sur Vercel. Configuration dans `vercel.json`.

```bash
npm run build    # Build production (dist/)
```

---

## Licence

Projet prive — usage professionnel.
