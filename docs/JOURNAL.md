# Journal — Atypique CMS

## Regles apprises

| # | Regle | Fichier(s) | Date |
|---|-------|------------|------|
| 1 | Un seul admin, pas de gestion de rôles | FONDATIONS.md | 2026-04-26 |
| 2 | Item universel auto-référencé via parent_id | FONDATIONS.md | 2026-04-26 |
| 3 | Cloudinary lecture seule depuis le CMS | FONDATIONS.md | 2026-04-26 |
| 4 | Drag & drop est MVP, pas v2 | FONDATIONS.md | 2026-04-26 |
| 5 | ON DELETE CASCADE sur parent_id — suppression hiérarchique gérée en DB | JOURNAL.md | 2026-04-26 |
| 6 | Supabase anon key = publique (pas secrète), Cloudinary credentials = Edge Function only | JOURNAL.md | 2026-04-26 |
| 7 | Contrainte CHECK valid_hierarchy empêche les collections avec parent et les photos/albums sans parent | JOURNAL.md | 2026-04-26 |
| 8 | Imports cross-boundary src/ <-> racine : PhotoFrame et types.ts sont a la racine, composants CMS dans src/ — chemins relatifs `../../../components/` | JOURNAL.md | 2026-04-26 |
| 9 | Rotations/mounts mosaic deterministes par index (pas Math.random()) pour eviter layout shift au re-render | JOURNAL.md | 2026-04-26 |
| 10 | SECURITY DEFINER sur une RPC Supabase bypass le RLS — ajouter un check `auth.uid()` dans le corps de la fonction ou utiliser SECURITY INVOKER | QA-REPORT.md | 2026-04-26 |
| 11 | Toujours proteger les formulaires contre le double-clic avec un state `isSubmitting` | QA-REPORT.md | 2026-04-26 |
| 12 | Quand un composant recoit des props, il DOIT les destructurer ET les utiliser — sinon elles sont silencieusement ignorees | QA-REPORT.md | 2026-04-26 |
| 13 | Tailwind CDN ne fonctionne pas en build — toujours migrer vers npm (tailwindcss + postcss + autoprefixer) pour la production | JOURNAL.md | 2026-04-26 |
| 14 | Les variables VITE_ sont exposees au client (navigateur) — ne jamais y mettre de secrets, uniquement la cle anon Supabase (publique par design) | DEPLOY.md | 2026-04-26 |
| 15 | Vercel rewrite SPA obligatoire pour React Router — sans la regle `"/(.*)" → "/index.html"`, les routes directes retournent 404 | vercel.json | 2026-04-26 |

## Historique

### SESSION 1 — 2026-04-26

## [PRODUCT OWNER] — 2026-04-26 14:00
**Entree consommee :** Document de fondation `docs/FONDATIONS.md` — concept, stack, structure Item universel, décisions brainstorm
**Output produit :** 7 Epics, 12 User Stories avec critères d'acceptation mesurables (DoD)
**Decisions cles :**
- Epic 1 (Auth) : session expire après 24h, formulaire login simple email/mdp
- Epic 2 (CRUD) : `visible = false` par défaut (brouillon) pour éviter publication accidentelle
- Epic 2 (Delete) : suppression cascade (collection → albums → photos), pas de corbeille en MVP
- Epic 3 (DnD) : drag & drop à chaque niveau, pas seulement collections
- Epic 4 (Cloudinary) : explorateur avec navigation dossiers + miniatures, proxy Edge Function
- Epic 5 (Vues) : carousel existant préservé, mosaïque "mur d'exposition" nouvelle
- Epic 6 (Nav) : breadcrumb pour remonter la hiérarchie, items vides masqués
- Epic 7 (Migration) : nettoyage mock22-23 inclus dans la migration
**Selfdoubt applique :** Ratio 1/6 — seule incertitude sur les specs visuelles exactes de la mosaïque (délégué à Agent #3)
**Alerte agent suivant :** L'Architect doit prévoir le RLS Supabase pour la distinction visiteur/admin. La cascade de suppression doit être gérée en base (ON DELETE CASCADE) ou côté application. Le champ metadata JSONB doit être indexé si on prévoit des recherches futures.

## [SOFTWARE ARCHITECT] — 2026-04-26 14:30
**Entree consommee :** Journal PO (7 Epics, 12 US), Document de fondation, Alerte PO sur RLS/cascade/metadata
**Output produit :**
- Schéma SQL complet table `items` avec contraintes, index, trigger updated_at
- 6 policies RLS (anon=lecture visible, authenticated=CRUD complet)
- Fonction RPC `reorder_items` pour le batch update des positions (drag & drop)
- Edge Function `cloudinary-browse` complète (auth check, list folders, search resources)
- Architecture dossiers frontend (`lib/`, `hooks/`, `contexts/`, `components/admin/`, `pages/`)
- Pattern WYSIWYG Admin (AdminContext + ItemControls wrapper conditionnel)
- Pattern Optimistic Updates pour toutes les mutations
- Plan de migration constants.tsx → Supabase
- Variables d'environnement documentées (client vs serveur)
**Decisions cles :**
- Contrainte CHECK `valid_hierarchy` pour garantir l'intégrité hiérarchique en DB
- React Context + useState plutôt que Zustand (scope suffisant pour admin unique)
- React Router v7 plutôt que TanStack Router (simplicité)
- Framer Motion `<Reorder>` pour le drag & drop (déjà en dépendance)
- Tailwind migration CDN → npm (requis pour build Vercel optimisé)
- Edge Function unique pour dossiers ET ressources Cloudinary (un seul endpoint)
**Selfdoubt applique :** Ratio 2/7 — incertitudes sur le cascade avec RLS (à tester) et Reorder pour grilles 2D (fallback possible sur listes)
**Alerte agent suivant :** Le Designer doit concevoir les contrôles admin (ItemControls) de manière discrète pour ne pas casser l'esthétique fine art. Le CloudinaryBrowser doit rester cohérent avec le design system existant. Le breadcrumb doit s'intégrer à la Navigation existante. Attention au Reorder en grille 2D pour la mosaïque — peut nécessiter un fallback en liste pour le drag & drop admin.

## [UI/UX DESIGNER] — 2026-04-26 15:00
**Entree consommee :** Journaux PO + Architect, code source complet (Navigation, GalleryWall, PhotoFrame, ThemeCanvas, MockGalleryView, MosaicGalleryView, HandDrawnFrame, index.html)
**Output produit :**
- Design tokens extraits du code existant + tokens admin additionnels (danger, success, draft)
- 2 user flows détaillés (admin création, visiteur navigation)
- 9 wireframes textuels : AdminToolbar, ItemControls, bouton Ajouter, ItemForm drawer, CloudinaryBrowser modal, Breadcrumb, ViewToggle, Mosaïque "mur d'exposition", LoginPage
- Règles de validation par champ (ItemForm)
- Table responsive (3 breakpoints : mobile/tablette/desktop)
- Table animations Framer Motion (11 animations spécifiées)
- Paramètres mosaïque organique (rotations, mounts, margins, scales)
**Decisions cles :**
- Toolbar admin en BAS de l'écran (Fitts — ne pas interférer avec la nav existante en haut)
- Drawer latéral droit pour les formulaires (pas de modal plein écran — garder le contexte visuel)
- Cloudinary Browser en modal PAR-DESSUS le drawer (z-[400])
- Bouton ➕ même forme qu'un item (Gestalt — Similarité) avec bordure dashed
- Login page même esthétique que le site (Nielsen #4 — Cohérence)
- Mobile : tap toggle au lieu de hover pour les contrôles admin
- Mosaïque : CSS columns plutôt que grid pour un rendu masonry naturel
- Drag & drop sur la mosaïque : réordonner via liste ordonnée dans la toolbar, pas directement sur la grille 2D (confirmation de l'alerte Architect)
**Selfdoubt applique :** Ratio 1/5 — seule incertitude sur le drag & drop en grille 2D, résolu par fallback en liste ordonnée
**Alerte agent suivant :**
- Backend : le RLS doit filtrer `visible = false` côté anon — le Designer compte sur cette logique pour la distinction visuelle brouillon/publié
- Frontend : réutiliser PhotoFrame.tsx pour la mosaïque (mounts, rotations, parallax). Les contrôles admin sont un wrapper conditionnel, pas une duplication de composants. Le drawer et le CloudinaryBrowser sont les deux seuls composants "non-fine-art" — ils doivent rester minimalistes (blanc, bordures subtiles, pas de décorations)
- Attention au z-index stacking : nav(200) < admin-toolbar(300) < drawer(350) < cloudinary-modal(400)

## [BACKEND DEVELOPER] — 2026-04-26 16:00
**Entree consommee :** Journaux PO + Architect + Designer, code source (`constants.tsx`, `types.ts`, `package.json`), Document de fondation
**Output produit :**
- `docs/supabase-setup.sql` — Script SQL complet : table `items`, 4 index, trigger `updated_at`, 5 policies RLS, fonction RPC `reorder_items`
- `docs/supabase-migration.sql` — Migration des données existantes : 9 collections, 1 album, 23 photos, 3 photos wedding. Titres mock22-23 nettoyés (contenu inapproprié remplacé par "Préparatifs" et "Alliance"). Toutes les URLs Cloudinary preservées
- `src/lib/supabase.ts` — Client Supabase avec validation des variables d'environnement au démarrage
- `src/types/index.ts` — Interface `Item` (miroir exact de la table SQL), types utilitaires (`ItemType`, `CreateItemPayload`, `UpdateItemPayload`, `ReorderEntry`), types Cloudinary (`CloudinaryFolder`, `CloudinaryImage`, `CloudinaryBrowseResponse`)
- `src/hooks/useItems.ts` — Hook CRUD complet avec optimistic updates et rollback sur erreur (fetchItems, createItem, updateItem, deleteItem, reorderItems)
- `src/hooks/useAuth.ts` — Hook auth Supabase (login/logout, session auto-restore, listener onAuthStateChange, isAdmin derive de user)
- `src/hooks/useCloudinary.ts` — Hook explorateur Cloudinary avec navigation dossiers, historique, goBack
- `supabase/functions/cloudinary-browse/index.ts` — Edge Function Deno : verification JWT, proxy API Cloudinary Admin (folders + search resources), CORS headers, generation thumbnails
- `.env.example` — Template variables d'environnement avec commentaires
**Decisions cles :**
- Parametre RPC renomme `p_items` pour eviter conflit avec le nom de table `items` dans la fonction `reorder_items`
- UUIDs fixes pour les collections et albums dans la migration (format `a0000001-...`) pour permettre le referencement `parent_id` des photos
- Collections avec `visible = false` par defaut sauf Showcase et Wedding (qui ont du contenu reel)
- Metadata JSONB utilise pour stocker les config d'affichage album (displayConfig) et les proprietes photo supplementaires (width, height, rotation, subtitle)
- Validation des env vars au boot dans `supabase.ts` avec message d'erreur explicite
- Hook `useCloudinary` maintient un historique de navigation pour le goBack (pile LIFO)
- Edge Function utilise l'API Search v2 de Cloudinary (POST) plutot que l'API Resources (GET) pour le filtrage par dossier
**Selfdoubt applique :** Ratio 1/8 — seule incertitude sur le nommage exact du parametre RPC (`p_items` vs `items`) dans l'appel client-side `supabase.rpc()`. Verifie : Supabase transmet les parametres nommes, le parametre de la fonction SQL est `p_items`, donc l'appel client doit utiliser `{ p_items: entries }`
**Alerte agent suivant :**
- Frontend : la dependance `@supabase/supabase-js` doit etre ajoutee au `package.json` (`npm install @supabase/supabase-js`)
- Frontend : les hooks sont dans `src/hooks/` mais le code existant est a la racine — adapter les imports ou deplacer progressivement
- Frontend : le hook `useItems` ne gere pas le cache cross-composants. Si plusieurs composants appellent `fetchItems`, ils auront chacun leur propre etat. Envisager un Context si necessaire
- QA : tester le RLS en mode anon (items avec `visible=false` ne doivent pas etre retournes) et en mode authenticated (acces complet)
- QA : verifier que la contrainte `valid_hierarchy` rejette bien les INSERT de collection avec parent_id et de photo sans parent_id

## [FRONTEND DEVELOPER] — 2026-04-26 17:00
**Entree consommee :** Journaux PO + Architect + Designer + Backend, code source complet (Navigation, GalleryWall, PhotoFrame, ThemeCanvas, MockGalleryView, MosaicGalleryView, HandDrawnFrame, ArtisticAccents, index.html, constants.tsx, types.ts, App.tsx), hooks Backend (useAuth, useItems, useCloudinary), types Backend (src/types/index.ts)
**Output produit :**
- `src/components/admin/AdminContext.tsx` — Context React (isAdmin derive de useAuth, isEditing toggle, AdminProvider)
- `src/components/admin/LoginPage.tsx` — Page login /admin (formulaire email/mdp, meme esthetique fine art, gestion erreurs, bouton CTA identique)
- `src/components/admin/AdminToolbar.tsx` — Barre admin fixee en bas (h-12, z-[300], toggle edition, breadcrumb simplifie, deconnexion, slide-up Framer Motion)
- `src/components/admin/ItemControls.tsx` — Overlay controles sur items (hover/tap reveal, boutons edit/delete/toggleVisible w-8 rounded-full, drag handle, badge Brouillon ambre, conditionnement isAdmin+isEditing)
- `src/components/admin/ItemForm.tsx` — Drawer lateral droit (w-[400px] md / w-full mobile, z-[351], slide-in right, champs label*/subtitle/url+Cloudinary/description/visible toggle, validation, preview image)
- `src/components/admin/CloudinaryBrowser.tsx` — Modal Cloudinary (z-[400], navigation dossiers, grille images 4cols/2cols, selection avec ring+check, utilise useCloudinary du Backend)
- `src/components/admin/AddItemButton.tsx` — Bouton + dashed (memes dimensions qu'un item, conditionne isAdmin+isEditing, 3 variantes taille)
- `src/components/gallery/ViewToggle.tsx` — Toggle carousel/mosaique (2 icones SVG, actif #8b7355, inactif zinc-300, transition 200ms)
- `src/components/gallery/MosaicWallView.tsx` — Vue mosaique mur d'exposition (CSS columns 2/3/4, reutilise PhotoFrame.tsx, rotations -4/+4 deg, mounts cycliques tape/corners/pin/none, margins irreguliers, smooth scroll EASE_FACTOR 0.05)
- `src/components/gallery/Breadcrumb.tsx` — Fil d'Ariane (fixed top-[72px]/[88px], segments cliquables, separateur chevron, fadeIn+slideRight)
**Decisions cles :**
- Adaptation aux interfaces reelles de l'Agent #4 : `login/logout` (pas signIn/signOut), `images` (pas resources), `browseFolders/goBack` (pas browsePath/setPath), `CloudinaryImage.url/thumbnail` (pas secure_url)
- Suppression du fichier `src/types/cms.ts` redondant au profit de `src/types/index.ts` deja cree par l'Agent #4
- BreadcrumbSegment defini localement dans AdminToolbar et Breadcrumb (pas de type partage necessaire, 2 usages isoles)
- ItemForm.ItemFormData defini localement (interface formulaire != CreateItemPayload/UpdateItemPayload du Backend)
- Item.url traite comme `string | null` (conforme au type Backend) avec fallback `item.url ?? ''` dans MosaicWallView
- MosaicWallView convertit Item CMS en Photo (types.ts racine) pour reutiliser PhotoFrame sans modification
- Rotations et mounts deterministes par index (pas random a chaque render) pour eviter le layout shift
- Mobile : onTouchStart toggle dans ItemControls pour le tap au lieu du hover (spec Designer)
- z-index stacking respecte : nav(200) < Breadcrumb(190) < AdminToolbar(300) < ItemForm overlay(350) + drawer(351) < CloudinaryBrowser(400)
**Selfdoubt applique :** Ratio 1/10 — seule incertitude : le chemin d'import de PhotoFrame depuis `src/components/gallery/MosaicWallView.tsx` vers `components/PhotoFrame.tsx` (racine) utilise `../../../components/PhotoFrame` — valide si le build Vite resout correctement les chemins relatifs hors de `src/`. A verifier lors de l'integration
**Alerte agent suivant :**
- QA : verifier que le z-index stacking ne cree pas de conflit avec le grain-overlay (z-[9999]) et le border overlay (z-[200]) de index.html
- QA : tester le responsive des 10 composants aux 3 breakpoints (375/768/1440)
- QA : valider l'accessibilite (aria-label sur tous les boutons, role="switch" sur le toggle visible, aria-checked, focus visible)
- DevOps : les imports croisent la frontiere src/ <-> racine (PhotoFrame, types.ts) — s'assurer que la config Vite/tsconfig autorise ces chemins
- Integration : App.tsx n'a pas ete modifie — le routing React Router et le wrapping AdminProvider restent a faire

## [QA ENGINEER] — 2026-04-26 18:00
**Entree consommee :** Journaux PO + Architect + Designer + Backend + Frontend, code source complet des 20 fichiers audites
**Output produit :** Rapport QA complet (`docs/QA-REPORT.md`) — 3 critiques, 6 majeurs, 8 mineurs, 5 suggestions. Verification de chaque US/AC du PO
**Decisions cles :**
- SECURITY DEFINER sur reorder_items = faille de securite (anon peut reordonner)
- ItemForm ne transmet pas parentId/itemType = creation d'items impossible
- Double-clic non protege = duplication possible
- React Router + AdminProvider non integres dans App.tsx = CMS non navigable
**Selfdoubt applique :** Ratio 3/6 — incertitudes sur cascade+RLS, import cross-boundary Vite, CORS wildcard. Certitudes sur SECURITY DEFINER, double-clic, props manquantes
**Alerte agent suivant :** NE PAS deployer avant correction des 3 critiques. L'integration React Router est un pre-requis au deploiement. Le DevOps doit aussi verifier que .env est dans .gitignore et que les env vars Vercel sont documentees

## [DEVOPS ENGINEER] — 2026-04-26 19:00
**Entree consommee :** Journaux PO + Architect + Designer + Backend + Frontend + QA, code source (package.json, vite.config.ts, tsconfig.json, index.html, .gitignore, .env.example, src/App.tsx, App.tsx racine, index.tsx racine)
**Output produit :**
- `package.json` — Ajoute dependances : `@supabase/supabase-js`, `react-router-dom` (dependencies), `tailwindcss`, `postcss`, `autoprefixer` (devDependencies). Version bump 0.0.0 → 0.1.0. Script build ajoute `tsc --noEmit` avant `vite build`
- `tailwind.config.ts` — Content pointe vers racine (*.tsx, components/**) ET src/**. Tokens extraits : font-families (sans/serif/handwritten), couleurs (cream, warm)
- `postcss.config.js` — Config standard tailwindcss + autoprefixer
- `src/styles/globals.css` — Directives @tailwind + tous les styles custom migres depuis index.html (body, serif, handwritten, grain-overlay, wall-texture, perspective-1000, scrollbar, vertical-text, selection)
- `src/main.tsx` — Nouveau point d'entree : importe globals.css + src/App (le nouveau avec routing)
- `index.html` — Retire CDN Tailwind (`<script src="cdn.tailwindcss.com">`), retire le bloc `<style>` (migre dans globals.css), retire le `<script type="importmap">` (Vite gere les imports). Script pointe vers `/src/main.tsx`
- `vite.config.ts` — Retire les defines `process.env.GEMINI_API_KEY` (obsoletes). Ajoute alias `@src` pour `src/`. Config build explicite (outDir: dist)
- `tsconfig.json` — Ajoute `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`. Ajoute `baseUrl: "."`. Include couvre racine + components/ + src/. Ajoute alias `@src/*`
- `vercel.json` — SPA rewrite (toutes routes → index.html). Headers securite : X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy restrictive. Cache immutable sur /assets/
- `.gitignore` — Ajoute `.vercel/`, `.env.production.local`
- `docs/DEPLOY.md` — Guide complet 9 etapes : compte Vercel, connexion GitHub, env vars, deploiement, setup Supabase (schema + migration + admin user), Edge Function Cloudinary, domaine personnalise, troubleshooting
**Decisions cles :**
- Point d'entree migre de `index.tsx` (racine, import App racine) vers `src/main.tsx` (import src/App avec routing) — l'ancien `index.tsx` reste en place mais n'est plus reference par index.html
- Tailwind CDN → npm : les classes existantes fonctionnent identiquement, la config custom (content) couvre les fichiers racine et src/
- Pas de CI/CD custom : Vercel auto-deploy depuis GitHub sur chaque push master suffit pour un projet solo
- Pas de Dockerfile : Vercel est serverless, le build se fait dans leur infrastructure
- Variables Gemini retirees de vite.config.ts (obsoletes, le projet utilise Supabase + Cloudinary)
- `tsc --noEmit` ajoute au build script pour detecter les erreurs TypeScript avant le bundling Vite
- Headers de securite appliques a toutes les routes (DENY iframe, nosniff, referrer strict, permissions restrictives)
- Cache immutable sur /assets/ (fichiers hashes par Vite, safe to cache indefinitely)
**Selfdoubt applique :** Ratio 1/8 — seule incertitude : le `tsc --noEmit` avec `strict: true` pourrait echouer sur le code existant (fichiers racine pas ecrits en strict mode). Solution : si le build echoue, les erreurs strict seront a corriger avant deploiement — c'est voulu (qualite). Certitudes : Vercel detecte Vite automatiquement, les rewrites SPA fonctionnent, les headers sont standard, la migration Tailwind CDN → npm est straightforward
**Alerte agent suivant :**
- Knowledge Curator : documenter le workflow de deploiement dans le second brain (Vercel + Supabase + Edge Functions)
- L'ancien `index.tsx` et `App.tsx` a la racine ne sont plus le point d'entree — ils restent pour reference mais pourraient etre supprimes dans un futur cleanup
- Le premier `npm install` + `npm run build` local est necessaire avant de deployer pour verifier que tout compile
- Les 3 critiques QA doivent etre corriges dans le code AVANT le deploiement (SECURITY DEFINER, ItemForm props, double-clic) — le DevOps ne les corrige pas, c'est le perimetre du dev

## [KNOWLEDGE CURATOR] — 2026-04-26 20:00
**Entree consommee :** Journaux des 7 agents (PO, Architect, Designer, Backend, Frontend, QA, DevOps), FONDATIONS.md, QA-REPORT.md complet
**Output produit :**
- `~/.claude/second-brain/projects/atypique-cms.md` — Fiche projet complete (resume, stack, architecture, statut, lecons apprises)
- `~/.claude/second-brain/learnings/errors-to-avoid.md` — 6 nouvelles erreurs documentees (#17-#22) + 5 nouvelles regles emergentes (#9-#13) + section Supabase/Backend detaillee
- `~/.claude/second-brain/learnings/tech-decisions.md` — 8 nouvelles decisions (#11-#18) + section Backend/Supabase detaillee + 4 nouvelles decisions stables (#4-#7)
- `~/.claude/second-brain/learnings/prompt-patterns.md` — 5 nouveaux patterns (#05-#09) + section complete "Patterns multi-agents"
- `~/.claude/second-brain/MANIFESTE.md` — Session 2 documentee + 5 nouvelles regles (#4-#8) + sections patterns/erreurs/tech enrichies + index sessions mis a jour
- `~/.claude/second-brain/00-INDEX.md` — Projet Atypique CMS ajoute aux projets actifs
**Decisions cles :**
- Tous les fichiers existants ont ete mis a jour (pas ecrases) — le contenu FLOWGET et Session 1 est preserve
- Les erreurs sont classees par categorie (Supabase/Backend, DevOps) pour faciliter la recherche future
- Les decisions stables candidates a CLAUDE.md : Supabase par defaut, Item universel, WYSIWYG overlay, CSS columns pour masonry
- Le pattern le plus impactant de cette session : QA comme gate bloquante — a attrape 3 critiques qui auraient ete deployes
**Selfdoubt applique :** Ratio 0/8 — toutes les informations proviennent directement des journaux et du code audite. Aucune hypothese necessaire
**Alerte agent suivant :** Les 3 critiques QA (CRIT-01, CRIT-02, CRIT-03) + l'integration React Router dans App.tsx doivent etre corriges avant le prochain deploiement. Le second brain est a jour et pret pour la session N+1
