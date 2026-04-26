# Guide de deploiement — Atypique CMS

Ce guide couvre le deploiement complet du site sur **Vercel** (hebergement frontend) et **Supabase** (backend PostgreSQL + Auth + Edge Functions).

---

## Pre-requis

- Un compte GitHub avec le repo pousse
- Node.js 18+ installe localement
- npm installe

---

## Etape 1 — Installer les dependances localement

```bash
npm install
```

Verifier que le build fonctionne :

```bash
npm run build
```

Si le build reussit, le dossier `dist/` est cree. Ne pas le commiter (il est dans `.gitignore`).

---

## Etape 2 — Creer un compte Vercel (gratuit)

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer **Sign Up** → choisir **Continue with GitHub**
3. Autoriser Vercel a acceder au compte GitHub

---

## Etape 3 — Connecter le repo GitHub

1. Dans le dashboard Vercel, cliquer **Add New... → Project**
2. Selectionner le repo `SiteWeb_Mariage` dans la liste
3. Vercel detecte automatiquement **Vite** comme framework
4. Laisser les parametres par defaut :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

---

## Etape 4 — Configurer les variables d'environnement dans Vercel

**Avant le premier deploiement**, ajouter les variables d'environnement :

1. Dans les parametres du projet Vercel → **Settings → Environment Variables**
2. Ajouter :

| Variable | Valeur | Environnements |
|----------|--------|-----------------|
| `VITE_SUPABASE_URL` | `https://votre-projet.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...votre-anon-key` | Production, Preview, Development |

> **Important** : les variables prefixees `VITE_` sont exposees au client (navigateur). La clé anon Supabase est conçue pour être publique — la sécurité est assurée par le RLS (Row Level Security) côté Supabase.

---

## Etape 5 — Premier deploiement

1. Cliquer **Deploy** dans Vercel
2. Attendre la fin du build (1-2 minutes)
3. Vercel fournit une URL du type `https://votre-projet.vercel.app`
4. Le site est en ligne mais ne charge pas encore de donnees (Supabase pas encore configure)

> Chaque `git push` sur `master` declenche automatiquement un nouveau deploiement.

---

## Etape 6 — Configurer Supabase

### 6.1 Creer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **Start your project**
2. Creer un compte (gratuit)
3. Cliquer **New Project**
4. Choisir :
   - **Organization** : creer ou choisir
   - **Name** : `atypique-cms`
   - **Database Password** : generer un mot de passe fort et le sauvegarder
   - **Region** : `West EU (Ireland)` (le plus proche)
5. Attendre la creation (~2 minutes)

### 6.2 Recuperer les identifiants

1. Aller dans **Settings → API**
2. Copier :
   - **Project URL** → c'est `VITE_SUPABASE_URL`
   - **anon public key** → c'est `VITE_SUPABASE_ANON_KEY`
3. Mettre a jour ces valeurs dans Vercel (Etape 4) et dans le `.env` local

### 6.3 Executer le schema SQL

1. Aller dans **SQL Editor** dans le dashboard Supabase
2. Copier-coller le contenu de `docs/supabase-setup.sql`
3. Cliquer **Run**
4. Verifier dans **Table Editor** que la table `items` existe

### 6.4 Executer la migration des donnees

1. Dans **SQL Editor**, creer une nouvelle requete
2. Copier-coller le contenu de `docs/supabase-migration.sql`
3. Cliquer **Run**
4. Verifier dans **Table Editor** que les items apparaissent (collections, albums, photos)

### 6.5 Creer l'utilisateur admin

1. Aller dans **Authentication → Users**
2. Cliquer **Add user → Create new user**
3. Renseigner :
   - **Email** : votre email
   - **Password** : un mot de passe fort
   - Cocher **Auto Confirm User**
4. Cliquer **Create User**

> Il n'y a qu'un seul admin. Pour vous connecter au CMS, allez sur `https://votre-site.vercel.app/admin`.

---

## Etape 7 — Configurer l'Edge Function Supabase (Cloudinary)

L'Edge Function `cloudinary-browse` permet au CMS de naviguer dans les dossiers Cloudinary.

### 7.1 Installer Supabase CLI

```bash
npm install -g supabase
```

### 7.2 Se connecter

```bash
supabase login
supabase link --project-ref votre-project-ref
```

Le `project-ref` se trouve dans **Settings → General** du dashboard Supabase.

### 7.3 Deployer l'Edge Function

```bash
supabase functions deploy cloudinary-browse
```

### 7.4 Configurer les secrets Cloudinary

```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=votre-cloud-name
supabase secrets set CLOUDINARY_API_KEY=votre-api-key
supabase secrets set CLOUDINARY_API_SECRET=votre-api-secret
```

> Ces valeurs se trouvent dans le dashboard Cloudinary → **Settings → API Keys**.

> **Important** : les secrets Cloudinary ne doivent JAMAIS etre dans le code ou le `.env` local. Ils restent uniquement dans les secrets Supabase Edge Functions.

---

## Etape 8 — Tester le site en ligne

1. Aller sur `https://votre-site.vercel.app`
2. Verifier que les collections et photos s'affichent
3. Aller sur `https://votre-site.vercel.app/admin`
4. Se connecter avec l'email/mot de passe cree a l'etape 6.5
5. Verifier que la toolbar admin apparait en bas de l'ecran
6. Tester la creation/modification/suppression d'items

---

## Etape 9 (optionnel) — Domaine personnalise

1. Dans Vercel → **Settings → Domains**
2. Cliquer **Add Domain**
3. Entrer le domaine (ex: `ernestphotography.com`)
4. Suivre les instructions pour configurer les DNS :
   - **Type A** : `76.76.21.21`
   - **Type CNAME** : `cname.vercel-dns.com` (pour le sous-domaine www)
5. Attendre la propagation DNS (5 min a 48h)
6. Vercel configure automatiquement le certificat SSL (HTTPS)

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de developpement (port 3000) |
| `npm run build` | Construire le site pour la production |
| `npm run preview` | Previsualiser le build local |

---

## Troubleshooting

### Le build echoue sur Vercel
- Verifier que les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurees
- Verifier les logs de build dans le dashboard Vercel → **Deployments → dernier deploiement → logs**

### Les donnees ne s'affichent pas
- Verifier que le schema SQL a ete execute dans Supabase
- Verifier que les policies RLS sont actives (Table Editor → items → RLS Policies)
- Verifier que les items ont `visible = true`

### La page admin ne charge pas
- Verifier que le routing SPA fonctionne (vercel.json contient la rewrite rule)
- Verifier dans la console navigateur (F12) qu'il n'y a pas d'erreur Supabase

### L'explorateur Cloudinary ne fonctionne pas
- Verifier que l'Edge Function est deployee (`supabase functions list`)
- Verifier que les secrets sont configures (`supabase secrets list`)
- Verifier les logs de l'Edge Function dans le dashboard Supabase → **Edge Functions → cloudinary-browse → Logs**
