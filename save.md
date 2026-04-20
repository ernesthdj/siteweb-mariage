# SAVE — Atypique · Fine Art Wedding Photography
> Dernière mise à jour : 2026-04-02

---

## Concept

Site vitrine immersif pour un studio de photographie de mariage haut de gamme.
Nom de marque : **Atypique**
Contact affiché : `hello@atypique-studio.com`
Esthétique : galerie fine art — textures papier, cadres dessinés à la main, typographies élégantes, navigation spatiale.

---

## État du projet

| Axe | État |
|-----|------|
| UI / Layout général | ✅ Terminé et responsive |
| Navigation 3 sections | ✅ Opérationnel |
| Animations (Framer Motion) | ✅ Soignées |
| Lecteur audio ambiant | ✅ Fonctionnel (3 pistes Cloudinary) |
| Thème mariage (photos réelles) | ✅ 3 photos réelles |
| Galerie mock (23 photos) | ✅ Cloudinary, carousel + typewriter |
| 8 autres thèmes | ⚠️ Vides (photos[] = []) |
| Formulaire de contact | ⚠️ Structure HTML uniquement, pas de backend |
| Bio photographe | ⚠️ Placeholder Unsplash |
| Données mock sales | ❌ mock22-23 ont des titres inappropriés à nettoyer |
| Build de production | ✅ `/dist` présent |
| Hébergement / déploiement | ❓ Pas configuré |

---

## Stack technique

```
React 19 + TypeScript 5 + Vite 6
Tailwind CSS (CDN)
Framer Motion 12
Cloudinary (images + audio CDN)
Fonts : Cormorant Garamond · Montserrat · Mrs Saint Delafield
```

---

## Structure des fichiers

```
SiteWeb_Mariage/
├── App.tsx                  # Root — état global, layout principal
├── constants.tsx            # Toutes les données (thèmes, photos, albums, pistes audio)
├── types.ts                 # Types TypeScript
├── index.html               # Entrée HTML
├── vite.config.ts
├── package.json
├── components/
│   ├── Navigation.tsx       # Navbar fixed, 3 sections, underline animé
│   ├── GalleryWall.tsx      # Conteneur principal — scroll horizontal, overlay views
│   ├── AudioPlayer.tsx      # Player HTML5 avec fade in/out, UI expandable
│   ├── GalleryView.tsx      # Grille de photos collées (rotation aléatoire)
│   ├── MockGalleryView.tsx  # Carousel plein écran + typewriter
│   ├── MosaicGalleryView.tsx# Grille d'albums défilante
│   ├── ThemeCanvas.tsx      # Carte d'une collection (survol + effets)
│   ├── PhotoFrame.tsx       # Photo encadrée (tape, coins, pin) + parallax
│   ├── ArtisticAccents.tsx  # SVG décoratifs : InkBlot, BowTie, LoveNote…
│   ├── AlbumView.tsx        # Album avec flip 3D à l'ouverture
│   └── HandDrawnFrame.tsx   # Bordure SVG dessinée à la main animée
├── Photos/
│   ├── Mariages/            # Photos de mariage réelles
│   ├── Mocks/               # Images maquette
│   └── Cachet/              # Tampons / cachets
└── Musiques/
    ├── Moonlit Teacups.mp3
    ├── Lanterns Over Old Stone Steps.mp3
    └── Whispers Of Old Paper.mp3
```

---

## Données configurées (constants.tsx)

### 9 Thèmes d'exposition
| ID | Titre | Photos |
|----|-------|--------|
| `wedding` | Noces d'Éternité | 3 photos réelles |
| `nature` | Brume Organique | ❌ vide |
| `culinary` | Saveurs Obscures | ❌ vide |
| `fashion` | Noir Couture | ❌ vide |
| `urban` | Béton Brisé | ❌ vide |
| `architecture` | Minimalisme Corbuséen | ❌ vide |
| `birth` | Souffle Premier | ❌ vide |
| `portrait` | Visages d'Âme | ❌ vide |
| `showcase` | Un Mariage en Lumière | ✅ 23 photos mock (Cloudinary) |

### Galerie mock (`MOCK_GALLERY_PHOTOS`)
- 23 photos Cloudinary
- Titres poétiques : "Le Premier Regard", "Tendresse", "Complicité", "Éternité"…
- **⚠️ mock22-23 : titres placeholder inappropriés à corriger**

### Albums (`GALLERY_ALBUMS`)
- 1 album configuré : "Un Mariage en Lumière"
- `ALBUM_DISPLAY_CONFIGS` : 1 seule config peuplée

### Pistes audio
- 3 pistes lo-fi / ambiance — hébergées sur Cloudinary
- Déclenchées au premier clic sur "Portfolio"

---

## Architecture front-end

```
App.tsx
└── GalleryWall.tsx          # scroll horizontal
    ├── Section Accueil      # hero + bio
    ├── Section Portfolio    # 9 × ThemeCanvas
    │   ├── GalleryView      # overlay grille
    │   ├── MockGalleryView  # overlay carousel
    │   └── MosaicGalleryView# overlay albums
    └── Section Contact      # formulaire
AudioPlayer.tsx              # positionné globalement
Navigation.tsx               # navbar fixed
```

---

## Ce qui reste à faire (backlog identifié)

### Priorité haute
- [ ] Nettoyer les titres mock22-23 (contenu inapproprié)
- [ ] Implémenter la soumission du formulaire de contact (Resend / EmailJS / API propre)
- [ ] Remplacer le placeholder bio photographe par une vraie photo

### Priorité moyenne
- [ ] Peupler les 8 thèmes vides avec de vraies photos (ou retirer les thèmes vides)
- [ ] Ajouter plusieurs configs dans `ALBUM_DISPLAY_CONFIGS`
- [ ] SEO : balises meta, OG, sitemap, robots.txt
- [ ] Performances : lazy loading images, optimisation Cloudinary

### Priorité basse / v2
- [ ] Déploiement (Vercel / Netlify recommandé)
- [ ] Domaine personnalisé `atypique-studio.com`
- [ ] Analytics (Plausible ou GA4)
- [ ] Version multilingue (FR/EN)
- [ ] CMS headless pour gestion de contenu sans code

---

## Points forts du code

- Architecture composants propre et modulaire
- TypeScript strict bien respecté
- Framer Motion utilisé de façon avancée (scroll hooks, layout animations, variants)
- Responsive mobile-first cohérent
- Design system organique (textures, SVG, typographies)
- Build Vite optimisé, prêt pour prod

---

## Notes & décisions techniques

- Tailwind CSS chargé via CDN → ok pour MVP, à passer en install locale si le bundle grossit
- Cloudinary utilisé pour tous les assets lourds → bonne décision pour les perfs
- Pas de backend actuellement → site 100% statique (formulaire à connecter)
- `GEMINI_API_KEY` dans `.env.local` → non utilisé dans le code actuel (feature future ?)
- Pas de système de routing (React Router) → navigation gérée par état local

---

*Document généré à partir de l'exploration complète du projet le 2026-04-02.*
