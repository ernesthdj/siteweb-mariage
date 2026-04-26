# Rapport QA — Atypique CMS
> Agent #6 — QA Engineer
> Date : 2026-04-26

---

## SELFDOUBT — Audit d'incertitude

| # | Affirmation | Niveau | Action |
|---|-------------|--------|--------|
| 1 | La fonction RPC `reorder_items` avec `SECURITY DEFINER` est un risque de privilege escalation | ✅ Certain | Verifie dans `supabase-setup.sql` ligne 90 — bypass RLS confirme |
| 2 | Les `as` castings dans les hooks ne causent pas de crash runtime | ⚠️ Probable | Supabase SDK retourne `unknown` — le cast est un raccourci acceptable si le schema DB est stable |
| 3 | Le CORS `Access-Control-Allow-Origin: *` de l'Edge Function est problematique | ⚠️ Probable | Supabase Edge Functions gerent eux-memes le CORS — le wildcard est standard pour les functions invoquees via le SDK |
| 4 | L'import cross-boundary `../../../components/PhotoFrame` fonctionne dans Vite | ⚠️ Probable | Vite resout les chemins relatifs hors de `src/` par defaut, mais `tsconfig.json` pourrait restreindre |
| 5 | Le double-clic sur "Creer" dans ItemForm cause une duplication | ✅ Certain | Aucun guard `isSubmitting` dans le formulaire — verifie dans le code |
| 6 | La suppression cascade fonctionne avec RLS actif | ⚠️ Probable | PostgreSQL `ON DELETE CASCADE` s'execute au niveau DB, mais les policies RLS peuvent bloquer la suppression des enfants si l'utilisateur n'a pas acces aux enfants — a tester |

**Hedge-to-Verify Ratio : 3/6**
Actions recommandees : tester la cascade avec RLS, verifier la resolution du chemin cross-boundary, valider le comportement du double-clic.

---

## Resume

| Severite | Nombre |
|----------|--------|
| **Critiques (bloquants)** | 3 |
| **Majeurs (fonctionnels)** | 6 |
| **Mineurs (qualite)** | 8 |
| **Suggestions** | 5 |

---

## Bugs critiques (bloquants)

### CRIT-01 — `reorder_items` SECURITY DEFINER bypass le RLS

**Fichier :** `docs/supabase-setup.sql` ligne 90
**Probleme :** La fonction RPC `reorder_items` est declaree `SECURITY DEFINER`, ce qui signifie qu'elle s'execute avec les privileges du proprietaire de la fonction (superuser), pas de l'appelant. Tout utilisateur disposant du droit `anon` peut appeler cette RPC et reorganiser les items, meme sans etre authentifie.
**Impact :** Un visiteur non authentifie peut modifier l'ordre des items via un appel direct `supabase.rpc('reorder_items', ...)`.
**Fix recommande :** Ajouter un check d'authentification dans le corps de la fonction :
```sql
IF auth.uid() IS NULL THEN
  RAISE EXCEPTION 'Authentification requise';
END IF;
```
Ou mieux : utiliser `SECURITY INVOKER` (defaut) et ajouter une RLS policy sur UPDATE pour la colonne `position`.

### CRIT-02 — Pas de protection contre le double-clic / double-soumission dans ItemForm

**Fichier :** `src/components/admin/ItemForm.tsx`
**Probleme :** Le bouton "Creer l'item" / "Sauvegarder" n'a aucun etat `isSubmitting` / `disabled` pendant la requete. Un double-clic rapide appelle `onSave()` deux fois, ce qui peut creer des doublons en base.
**Impact :** Duplication d'items dans la base de donnees.
**Fix recommande :** Ajouter un state `isSubmitting`, desactiver le bouton pendant l'appel, et le reactiver apres reponse/erreur.

### CRIT-03 — ItemForm ignore `parentId` et `itemType` dans les props

**Fichier :** `src/components/admin/ItemForm.tsx` ligne 32
**Probleme :** Le composant recoit `parentId` et `itemType` en props mais ne les destructure PAS (seuls `mode`, `item`, `onClose`, `onSave` sont destructures). Ces valeurs ne sont donc jamais transmises au callback `onSave()`.
**Impact :** L'appelant de `onSave` ne recoit ni le `parent_id`, ni le `type` de l'item a creer. Le `CreateItemPayload` sera incomplet — les champs `type` et `parent_id` seront absents, ce qui viole la contrainte `CHECK valid_hierarchy` en base et causera une erreur 400.
**Fix recommande :** Destructurer `parentId` et `itemType`, les inclure dans le payload `onSave`.

---

## Bugs majeurs (fonctionnels)

### MAJ-01 — `updateItem` capture une closure stale de `items`

**Fichier :** `src/hooks/useItems.ts` lignes 71-102
**Probleme :** Le `useCallback` pour `updateItem` depend de `[items]` dans son tableau de dependances. Le `previousItems` pour le rollback est capture au moment de l'appel, mais comme `items` est dans les deps, la fonction est recree a chaque changement d'items. Si deux updates sont lances quasi-simultanement, le rollback du second peut ecraser le premier update reussi.
**Impact :** Rollback incorrect en cas de mises a jour concurrentes rapides (ex: toggle visible sur deux items rapidement).

### MAJ-02 — `deleteItem` meme probleme de closure stale

**Fichier :** `src/hooks/useItems.ts` lignes 104-124
**Probleme :** Meme pattern que MAJ-01 avec `[items]` dans les deps du `useCallback`.
**Impact :** Rollback incorrect en cas de suppressions rapides consecutives.

### MAJ-03 — `useCloudinary.browseFolders` ajoute au historique meme quand le folder est vide string initial

**Fichier :** `src/hooks/useCloudinary.ts` lignes 47-50
**Probleme :** La condition `if (folder !== undefined)` est vraie meme quand `folder = ''` (string vide). Au premier appel `browseFolders('')` depuis `CloudinaryBrowser.useEffect`, l'historique ajoute `''` (le `currentFolder` initial). Chaque ouverture du browser empile des strings vides dans `folderHistory`.
**Impact :** Le bouton "Retour" navigue vers des dossiers vides fantomes avant de revenir a la racine reelle.

### MAJ-04 — `goBack` dans useCloudinary fait un appel reseau dans une IIFE non-cancelable

**Fichier :** `src/hooks/useCloudinary.ts` lignes 60-98
**Probleme :** La fonction `goBack` lance un fetch dans une IIFE `(async () => { ... })()`. Si le composant se demonte pendant le fetch, les `setState` (`setFolders`, `setImages`, `setLoading`) seront appeles sur un composant demonte. React 18+ ne warn plus pour ca, mais c'est une fuite de logique. De plus, pas de cleanup possible pour annuler le fetch.
**Impact :** State updates sur composant demonte, pas de possibilite d'annulation.

### MAJ-05 — Validation URL trop restrictive dans ItemForm

**Fichier :** `src/components/admin/ItemForm.tsx` ligne 74
**Probleme :** La validation rejette les URLs ne commencant pas par `https://`. Mais dans la migration (`supabase-migration.sql`), plusieurs collections ont des URLs locales (`/photos/nature/cover.jpg`, etc.). L'admin ne pourrait pas editer ces items sans changer l'URL.
**Impact :** Impossible de sauvegarder un item avec une URL relative ou `http://` — meme si c'est voulu, ca bloque l'edition des items existants.
**Fix recommande :** Accepter les URLs relatives (`/...`) et `http://` en plus de `https://`, ou appliquer la validation uniquement si l'URL n'est pas vide.

### MAJ-06 — `setUrl(item.url)` dans ItemForm alors que `item.url` peut etre `null`

**Fichier :** `src/components/admin/ItemForm.tsx` ligne 50
**Probleme :** Dans le `useEffect` de reset, `setUrl(item.url)` assigne potentiellement `null` a `url` (qui est type `string`). TypeScript ne le bloquera pas si `strict` n'est pas applique sur les assignations de state. Le state initial utilise `item?.url ?? ''`, mais le reset ne le fait pas.
**Impact :** Le champ URL affiche "null" comme texte si l'item n'a pas d'URL.
**Fix recommande :** `setUrl(item.url ?? '')`.

---

## Bugs mineurs (qualite)

### MIN-01 — `as` castings non securises dans useItems

**Fichiers :** `src/hooks/useItems.ts` lignes 40, 61, 90
**Probleme :** `data as Item[]` et `data as Item` font un cast non verifie. Si le schema Supabase diverge du type TypeScript `Item`, aucune erreur runtime ne sera levee — juste des valeurs `undefined` silencieuses.
**Recommandation :** Utiliser un runtime validator (Zod) ou au minimum ajouter des assertions a la development.

### MIN-02 — `as` castings dans useCloudinary

**Fichier :** `src/hooks/useCloudinary.ts` lignes 43, 88
**Probleme :** Meme pattern que MIN-01 pour la reponse de l'Edge Function.

### MIN-03 — BreadcrumbSegment defini deux fois

**Fichiers :** `src/components/admin/AdminToolbar.tsx` ligne 14, `src/components/gallery/Breadcrumb.tsx` ligne 12
**Probleme :** L'interface `BreadcrumbSegment` est dupliquee dans deux fichiers differents. Si l'une evolue sans l'autre, ca creera une incompatibilite silencieuse.
**Recommandation :** Extraire dans `src/types/index.ts`.

### MIN-04 — `CloudinaryFolder` et `CloudinaryImage` importes mais non utilises en tant que types dans CloudinaryBrowser

**Fichier :** `src/components/admin/CloudinaryBrowser.tsx` ligne 11
**Probleme :** Les types sont importes mais `CloudinaryFolder` n'est utilise que dans un callback parametre — TypeScript le resout, mais l'import pourrait utiliser `import type` pour la clarte et le tree-shaking.

### MIN-05 — Icone visible/masque identique dans ItemControls

**Fichier :** `src/components/admin/ItemControls.tsx` ligne 131
**Probleme :** Le meme emoji `\u{1F441}` (oeil) est utilise pour les deux etats (publier ET masquer). L'utilisateur ne peut pas distinguer visuellement l'action qui sera effectuee.
**Fix recommande :** Utiliser `\u{1F441}` pour "Publier" (rendre visible) et un oeil barre ou autre icone pour "Masquer".

### MIN-06 — `useEffect` dans MosaicWallView bloque le scroll du body globalement

**Fichier :** `src/components/gallery/MosaicWallView.tsx` lignes 64-69
**Probleme :** `document.body.style.overflow = 'hidden'` est un side-effect global. Si plusieurs composants font la meme chose (ex: le modal Cloudinary), le cleanup d'un composant peut restaurer `auto` alors qu'un autre a encore besoin de `hidden`.
**Recommandation :** Utiliser un compteur de locks ou une ref globale.

### MIN-07 — Pas de `role="alert"` sur les messages d'erreur dans CloudinaryBrowser

**Fichier :** `src/components/admin/CloudinaryBrowser.tsx` ligne 132
**Probleme :** Le message d'erreur n'a pas `role="alert"` — les lecteurs d'ecran ne l'annonceront pas.

### MIN-08 — Pas de confirmation avant suppression dans ItemControls

**Fichier :** `src/components/admin/ItemControls.tsx` ligne 42
**Probleme :** Le clic sur "Supprimer" appelle directement `onDelete(item)` sans confirmation. Avec la cascade en base, supprimer une collection supprime tous ses albums et photos.
**Impact :** Suppression accidentelle irreversible (pas de corbeille en MVP).
**Recommandation :** Ajouter un `window.confirm()` ou un dialog de confirmation, surtout pour les collections et albums.

---

## Suggestions (non-bloquantes)

### SUG-01 — Ajouter un `loading` state ou un `disabled` sur le bouton submit dans LoginPage pendant le login

Le bouton a deja `disabled={loading}`, mais le `loading` est global au hook `useAuth`. Si `useAuth` est utilise ailleurs en parallele, le state `loading` pourrait etre partage de maniere inattendue. Envisager un state local `isLoggingIn`.

### SUG-02 — Le hook `useItems` n'est pas un singleton

Comme signale par l'Agent #4, si plusieurs composants appellent `useItems()`, chacun a sa propre copie du state. Envisager un `ItemsContext` ou migrer vers TanStack Query pour le cache partage.

### SUG-03 — Ajouter des types generiques au client Supabase

`createClient<Database>` avec les types generes par Supabase CLI (`supabase gen types typescript`) eliminerait tous les `as` castings dans les hooks.

### SUG-04 — Ajouter `aria-live="polite"` sur le compteur d'images dans CloudinaryBrowser

Pour que les lecteurs d'ecran annoncent le nombre d'images trouvees quand le contenu du dossier change.

### SUG-05 — Envisager un debounce sur le drag & drop reorder

Le `reorderItems` pourrait etre appele trop frequemment pendant un drag rapide. Un debounce de 300ms eviterait les appels excessifs a la RPC.

---

## Verification des criteres d'acceptation

Les User Stories sont documentees dans le journal du PO (JOURNAL.md). Verification par Epic :

### Epic 1 — Authentification

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Login email/mdp | Formulaire fonctionnel avec gestion erreurs | ✅ PASS | `LoginPage.tsx` — champs valides, erreurs affichees |
| Session restauree au reload | `useAuth` restaure la session au montage | ✅ PASS | `getSession()` + `onAuthStateChange` |
| Session expire apres 24h | Configuration Supabase Auth | ⚠️ NON VERIFIABLE | Depend de la config dashboard Supabase, pas dans le code |
| Deconnexion | Bouton dans AdminToolbar | ✅ PASS | `logout()` appele au clic |
| Route `/admin` cachee | Necessite React Router | ❌ ABSENT | React Router n'est pas encore integre — App.tsx non modifie |

### Epic 2 — CRUD Items

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Creer un item | `createItem` dans useItems + ItemForm | ⚠️ PARTIEL | ItemForm ne transmet pas `type` ni `parent_id` (CRIT-03) |
| Modifier un item | `updateItem` + ItemForm mode edit | ✅ PASS | Optimistic update avec rollback |
| Supprimer un item | `deleteItem` + ItemControls | ⚠️ PARTIEL | Pas de confirmation avant suppression (MIN-08) |
| Toggle visible | `onToggleVisible` dans ItemControls | ✅ PASS | Callback present |
| `visible = false` par defaut | `CreateItemPayload.visible` optionnel (defaut DB) | ✅ PASS | Defaut en DB (`DEFAULT false`) |

### Epic 3 — Drag & Drop

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Reordonner les items | `reorderItems` RPC | ⚠️ SECURITE | RPC `SECURITY DEFINER` bypass RLS (CRIT-01) |
| Positions avec gaps | Pattern gaps (10, 20, 30) | ❌ ABSENT | Le code `reorderItems` recoit les positions en parametre mais aucun algorithme de gaps n'est implemente cote frontend |
| UI drag handle | Handle dans ItemControls | ✅ PASS | Icone `⁞⁞` avec cursor-grab |

### Epic 4 — Explorateur Cloudinary

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Navigation dossiers | `browseFolders` + `goBack` | ⚠️ BUG | Historique empile des vides (MAJ-03) |
| Grille d'images | Grid 2/4 cols dans CloudinaryBrowser | ✅ PASS | Miniatures + selection |
| Selection image → URL auto | `handleCloudinarySelect` → `setUrl` | ✅ PASS | Fonctionne correctement |
| Proxy securise | Edge Function avec JWT check | ✅ PASS | Credentials jamais cote client |

### Epic 5 — Vues Visiteur

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Vue carousel (existante) | Preservee | ⚠️ NON VERIFIABLE | Le code existant n'a pas ete modifie, mais pas d'integration visible |
| Vue mosaique mur | `MosaicWallView.tsx` | ✅ PASS | CSS columns, rotations, mounts cycliques |
| Toggle carousel/mosaique | `ViewToggle.tsx` | ✅ PASS | 2 modes, icones SVG, actif/inactif |

### Epic 6 — Navigation

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Breadcrumb | `Breadcrumb.tsx` | ✅ PASS | Segments cliquables, chevrons |
| Items vides masques visiteur | RLS `visible = true` | ✅ PASS | Policy `anon` filtre |

### Epic 7 — Migration

| AC | Description | Statut | Commentaire |
|----|-------------|--------|-------------|
| Donnees existantes migrees | `supabase-migration.sql` | ✅ PASS | 9 collections, 1 album, 26 photos |
| Mock22-23 nettoyes | Titres remplaces | ✅ PASS | "Preparatifs" et "Alliance" |

---

## Checklist securite

| # | Verification | Resultat | Detail |
|---|-------------|----------|--------|
| 1 | RLS : anon ne voit pas `visible=false` | ✅ OK | Policy `USING (visible = true)` pour `anon` |
| 2 | RLS : anon ne peut pas INSERT/UPDATE/DELETE | ✅ OK | Policies uniquement pour `authenticated` |
| 3 | Cloudinary credentials jamais cote client | ✅ OK | Uniquement dans l'Edge Function via `Deno.env` |
| 4 | Pas de secrets hardcodes | ✅ OK | `.env.example` a des placeholders, pas de vrais tokens |
| 5 | XSS : pas de `dangerouslySetInnerHTML` | ✅ OK | Grep confirme : 0 occurrence dans tout le projet |
| 6 | Injection SQL : requetes parametrees | ✅ OK | Tout passe par le SDK Supabase |
| 7 | JWT verifie dans l'Edge Function | ✅ OK | `supabase.auth.getUser()` verifie le token |
| 8 | CORS Edge Function | ⚠️ ATTENTION | `Access-Control-Allow-Origin: *` — acceptable pour les Edge Functions Supabase mais restrictif serait mieux |
| 9 | `SECURITY DEFINER` sur la RPC | ❌ FAIL | `reorder_items` bypass le RLS — accessible aux anon (CRIT-01) |
| 10 | Validation inputs serveur | ⚠️ PARTIEL | Contraintes CHECK en DB (type, hierarchy), mais pas de validation sur la longueur de `label` ou le format de `url` |
| 11 | `.env` dans `.gitignore` | ⚠️ NON VERIFIE | `.env.example` present mais `.gitignore` non audite |

---

## Coherence inter-agents

| # | Verification | Resultat | Detail |
|---|-------------|----------|--------|
| 1 | Imports hooks → types | ✅ OK | `useItems`, `useAuth`, `useCloudinary` importent depuis `../types` correctement |
| 2 | Types partages coherents | ✅ OK | `Item`, `ItemType`, `CloudinaryFolder`, `CloudinaryImage` utilises partout |
| 3 | Import cross-boundary PhotoFrame | ⚠️ RISQUE | `../../../components/PhotoFrame` sort de `src/` — dependant de la config `tsconfig.json` / Vite |
| 4 | Import cross-boundary types.ts | ⚠️ RISQUE | `../../../types` (racine) importe dans MosaicWallView — meme risque |
| 5 | z-index stacking | ⚠️ CONFLIT | `grain-overlay` dans `index.html` est a `z-[9999]` et `border-overlay` a `z-[200]` — le border-overlay peut capturer les clics au-dessus du Breadcrumb (z-190) et de la nav |
| 6 | Noms de fonctions hooks ↔ composants | ✅ OK | `login/logout`, `browseFolders/goBack`, `images/folders` sont coherents |
| 7 | React Router non integre | ❌ ABSENT | `App.tsx` n'a pas ete modifie — pas de routing `/admin`, pas de `AdminProvider` wrapping |

---

## Verdict

### ❌ FAIL — avec reserves

**Justification :**

3 bugs critiques empechent le fonctionnement correct du CMS :

1. **CRIT-01** : La RPC `reorder_items` avec `SECURITY DEFINER` permet a n'importe quel visiteur anonyme de reorganiser les items. C'est une faille de securite directe.

2. **CRIT-02** : L'absence de protection contre le double-clic dans `ItemForm` peut creer des doublons en base.

3. **CRIT-03** : `ItemForm` ne transmet pas `parentId` ni `itemType` au callback `onSave`, rendant la creation d'items impossiblement la contrainte `valid_hierarchy` en base rejettera l'INSERT.

De plus, l'integration dans `App.tsx` (React Router + AdminProvider) n'a pas ete realisee — le CMS n'est pas encore navigable.

**Avant de passer a l'Agent #7 (DevOps) :**
- [ ] Corriger CRIT-01, CRIT-02, CRIT-03
- [ ] Integrer React Router et AdminProvider dans App.tsx
- [ ] Corriger MAJ-03 (historique Cloudinary) et MAJ-06 (null URL)
- [ ] Ajouter une confirmation de suppression (MIN-08)

---

## Entree JOURNAL.md

```
## [QA ENGINEER] — 2026-04-26 18:00
**Entree consommee :** Journaux PO + Architect + Designer + Backend + Frontend, code source complet des 20 fichiers audites
**Output produit :** Rapport QA complet — 3 critiques, 6 majeurs, 8 mineurs, 5 suggestions. Verification de chaque US/AC du PO
**Decisions cles :**
- SECURITY DEFINER sur reorder_items = faille de securite (anon peut reordonner)
- ItemForm ne transmet pas parentId/itemType = creation d'items impossible
- Double-clic non protege = duplication possible
- React Router + AdminProvider non integres dans App.tsx = CMS non navigable
**Selfdoubt applique :** Ratio 3/6 — incertitudes sur cascade+RLS, import cross-boundary Vite, CORS wildcard. Certitudes sur SECURITY DEFINER, double-clic, props manquantes
**Alerte agent suivant :** NE PAS deployer avant correction des 3 critiques. L'integration React Router est un pre-requis au deploiement. Le DevOps doit aussi verifier que .env est dans .gitignore et que les env vars Vercel sont documentees
```
