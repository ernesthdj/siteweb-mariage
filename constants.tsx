
import { ExhibitionTheme } from './types';

// ============================================================================
// CONFIGURATION DES ALBUMS PHOTO
// ============================================================================

export const EXHIBITION_THEMES: ExhibitionTheme[] = [
  {
    id: 'showcase',
    type: 'showcase',
    title: "Un Mariage en Lumière",
    subtitle: "Expérience immersive",
    coverUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770064512/Couverture_nbazb6.png',
    description: "Découvrez un mariage complet à travers une présentation unique — cliquez sur chaque tableau pour révéler l'instant capturé.",
    photos: [] // Utilise MOCK_GALLERY_PHOTOS à la place
  },
  {
    id: 'wedding',
    type: 'wedding',
    title: "Noces d'Éternité",
    subtitle: "L'élégance du serment",
    coverUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg',
    description: "Une capture intemporelle des instants de grâce où deux âmes s'unissent.",
    photos: [
      { id: 'w1', url: 'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971497/DSC05639_zrfsdd.jpg', title: 'Premier regard', subtitle: "L'instant suspendu", width: 400, height: 600, rotation: -2 },
      { id: 'w2', url: 'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971496/_DSC9596_jadlvn.jpg', title: 'Promesses', subtitle: 'Éternité scellée', width: 380, height: 570, rotation: 1.5 },
      { id: 'w3', url: 'https://res.cloudinary.com/dzoshz4ut/image/upload/q_auto,f_auto/v1769971494/DSC04015_obav3q.jpg', title: 'Union sacrée', subtitle: 'Deux âmes', width: 600, height: 400, rotation: -1 },
    ]
  },
  {
    id: 'nature',
    type: 'nature',
    title: 'Brume Organique',
    subtitle: 'Murmures sauvages',
    coverUrl: '/photos/nature/cover.jpg',
    description: "La nature dans son état brut, entre silence forestier et échos minéraux.",
    photos: []
  },
  {
    id: 'culinary',
    type: 'culinary',
    title: 'Saveurs Obscures',
    subtitle: "L'art de la table",
    coverUrl: '/photos/culinary/cover.jpg',
    description: 'Quand la gastronomie devient une sculpture de lumière et de contrastes.',
    photos: []
  },
  {
    id: 'fashion',
    type: 'fashion',
    title: 'Noir Couture',
    subtitle: 'Lignes & Silhouettes',
    coverUrl: '/photos/fashion/cover.jpg',
    description: 'Une exploration graphique du vêtement comme une seconde peau architecturale.',
    photos: []
  },
  {
    id: 'urban',
    type: 'urban',
    title: 'Béton Brisé',
    subtitle: 'Géométrie urbaine',
    coverUrl: '/photos/urban/cover.jpg',
    description: "L'exploration des lignes et des silences au cœur du chaos citadin.",
    photos: []
  },
  {
    id: 'architecture',
    type: 'architecture',
    title: 'Minimalisme Corbuséen',
    subtitle: 'Espace & Vide',
    coverUrl: '/photos/architecture/cover.jpg',
    description: "La structure comme poésie. Le béton devient une page blanche pour l'ombre.",
    photos: []
  },
  {
    id: 'birth',
    type: 'birth',
    title: 'Souffle Premier',
    subtitle: 'La vie qui commence',
    coverUrl: '/photos/birth/cover.jpg',
    description: 'La douceur infinie des premiers regards et de la fragilité nouvelle.',
    photos: []
  },
  {
    id: 'portrait',
    type: 'portrait',
    title: "Visages d'Âme",
    subtitle: 'Intimité révélée',
    coverUrl: '/photos/portrait/cover.jpg',
    description: "Dépasser la surface pour capturer l'essence même du sujet.",
    photos: []
  }
];

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'moonlit',
    title: 'Moonlit Teacups',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1769971796/Moonlit_Teacups_mahq0t.mp3'
  },
  {
    id: 'lanterns',
    title: 'Moonlight On Old Sketches',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1770049420/Moonlight_On_Old_Sketches_jppzjm.mp3'
  },
  {
    id: 'waltz',
    title: 'Moonlit Teacup Waltz',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1770078465/Moonlit_Teacup_Waltz_hicjnp.mp3'
  }
];

// ============================================================================
// PHOTOS MOCK - Portraits pour la galerie showcase
// ============================================================================
export interface MockPhoto {
  id: string;
  mosaicUrl: string;    // Photo pour la mosaïque
  carouselUrl: string;  // Photo pour le carousel plein écran
  title?: string;
}

// ============================================================================
// STRUCTURE DES ALBUMS - Chaque album contient ses propres photos
// ============================================================================
export interface GalleryAlbum {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;      // Image de couverture pour la mosaïque d'albums
  description: string;
  photos: MockPhoto[];   // Photos du carousel de cet album
}

export const MOCK_GALLERY_PHOTOS: MockPhoto[] = [
  {
    id: 'mock1',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-19_ztblft.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-19_ztblft.png',
    title: 'Le Premier Regard'
  },
  {
    id: 'mock2',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-26_nfndp8.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-26_nfndp8.png',
    title: 'Tendresse'
  },
  {
    id: 'mock3',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071102/02-5x7-A4-PORTRAIT-frame-20_mdtci3.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071102/02-5x7-A4-PORTRAIT-frame-20_mdtci3.png',
    title: 'Complicité'
  },
  {
    id: 'mock4',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-12_ybmaov.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-12_ybmaov.png',
    title: 'Éternité'
  },
  {
    id: 'mock5',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-16_gugdmr.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071101/02-5x7-A4-PORTRAIT-frame-16_gugdmr.png',
    title: 'Sérénité'
  },
  {
    id: 'mock6',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071099/02-5x7-A4-PORTRAIT-frame-21_gwyxl8.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071099/02-5x7-A4-PORTRAIT-frame-21_gwyxl8.png',
    title: 'Douceur'
  },
  {
    id: 'mock7',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071097/02-5x7-A4-PORTRAIT-frame-07_pmpptz.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071097/02-5x7-A4-PORTRAIT-frame-07_pmpptz.png',
    title: 'Harmonie'
  },
  {
    id: 'mock8',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071096/Portrait2_SO_coqvvc.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071096/Portrait2_SO_coqvvc.png',
    title: 'Passion'
  },
  {
    id: 'mock9',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071093/02-5x7-A4-PORTRAIT-frame-15_wfg5ic.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071093/02-5x7-A4-PORTRAIT-frame-15_wfg5ic.png',
    title: 'Promesse'
  },
  {
    id: 'mock10',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-22_fqagtl.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-22_fqagtl.png',
    title: 'Lumière'
  },
  {
    id: 'mock11',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/54456_gflfoe.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/54456_gflfoe.png',
    title: 'Mains Croisées'
  },
  {
    id: 'mock12',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-06_itusr3.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071092/02-5x7-A4-PORTRAIT-frame-06_itusr3.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock13',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071090/02-5x7-A4-PORTRAIT-frame-23_f4khfm.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071090/02-5x7-A4-PORTRAIT-frame-23_f4khfm.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock14',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-25_rfn95u.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-25_rfn95u.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock15',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-11_x5a8iu.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071088/02-5x7-A4-PORTRAIT-frame-11_x5a8iu.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock16',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-18_xaa6rr.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-18_xaa6rr.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock17',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-17_n23ur2.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071085/02-5x7-A4-PORTRAIT-frame-17_n23ur2.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock18',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071082/02-5x7-A4-PORTRAIT-frame-24_jiydrt.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071082/02-5x7-A4-PORTRAIT-frame-24_jiydrt.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock19',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071080/02-5x7-A4-PORTRAIT-frame-10_oo52wy.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071080/02-5x7-A4-PORTRAIT-frame-10_oo52wy.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock20',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071079/02-5x7-A4-PORTRAIT-frame-03_xgye9l.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071079/02-5x7-A4-PORTRAIT-frame-03_xgye9l.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock21',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071078/02-5x7-A4-PORTRAIT-frame-05_cs8d8e.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071078/02-5x7-A4-PORTRAIT-frame-05_cs8d8e.png',
    title: 'Mariée Princesse'
  },
  {
    id: 'mock22',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079342/02-5x7-A4-PORTRAIT-frame-01_wscpuw.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079342/02-5x7-A4-PORTRAIT-frame-01_wscpuw.png',
    title: 'Gros Sex Dur'
  },
  {
    id: 'mock23',
    mosaicUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079341/02-5x7-A4-PORTRAIT-frame-04_ffuc64.png',
    carouselUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770079341/02-5x7-A4-PORTRAIT-frame-04_ffuc64.png',
    title: 'Gros Sex Dur'
  },
];

// ============================================================================
// CONFIGURATION VISUELLE DES ALBUMS
// ============================================================================
// Modifiez ces valeurs pour contrôler l'apparence de chaque album dans la galerie
// ============================================================================
export interface AlbumDisplayConfig {
  // === IMAGE DE COUVERTURE ===
  image: {
    url: string;             // URL de l'image à afficher pour cet album
    scale: number;           // Taille de l'image (0.1 à 1.0)
    rotation: number;        // Rotation en degrés
    offsetX: number;         // Décalage horizontal en pixels
    offsetY: number;         // Décalage vertical en pixels
  };

  // === TEXTE À CÔTÉ ===
  text: {
    content: string;         // Le texte/description à afficher
    offsetX: number;         // Décalage horizontal du texte
    offsetY: number;         // Décalage vertical du texte
    rotation: number;        // Rotation du texte
    scale: number;           // Échelle du texte
    opacity: number;         // Opacité du texte
  };

  // === LAYOUT ===
  layout: {
    side: 'left' | 'right';  // Album à gauche ou à droite
    marginTop: number;       // Marge en haut de la section
    marginBottom: number;    // Marge en bas de la section
  };
}

// ============================================================================
// ALBUMS DE LA GALERIE - Collection d'albums pour le sélecteur
// ============================================================================
export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: 'album1',
    title: 'Un Mariage en Lumière',
    subtitle: 'Marie & Thomas',
    coverUrl: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770071105/02-5x7-A4-PORTRAIT-frame-19_ztblft.png',
    description: 'Une journée magique capturée dans toute sa splendeur.',
    photos: MOCK_GALLERY_PHOTOS,
  },
  // Ajoutez d'autres albums ici...
];

// ============================================================================
// CONFIGURATION D'AFFICHAGE DE CHAQUE ALBUM
// ============================================================================
// Chaque entrée correspond à un album dans GALLERY_ALBUMS (même index)
// ============================================================================
export const ALBUM_DISPLAY_CONFIGS: AlbumDisplayConfig[] = [
  // ===================== ALBUM 1 =====================
  {
    image: {
      url: 'https://res.cloudinary.com/dzoshz4ut/image/upload/v1770082395/photo_mockup_5_bkzf2z.png',  // <-- MODIFIEZ L'URL ICI
      scale: 0.95,
      rotation: -2,
      offsetX: 0,
      offsetY: 0,
    },
    text: {
      content: "Une journée magique où chaque instant raconte une histoire d'amour. Des préparatifs intimes jusqu'à la danse finale, nous avons capturé l'essence même de leur union.",
      offsetX: 0,
      offsetY: 0,
      rotation: 1,
      scale: 1,
      opacity: 0.85,
    },
    layout: {
      side: 'left',
      marginTop: 0,
      marginBottom: 80,
    },
  },

  // ===================== ALBUM 2 (exemple) =====================
  // {
  //   image: {
  //     url: 'VOTRE_URL_ICI',
  //     scale: 0.80,
  //     rotation: 1.5,
  //     offsetX: 0,
  //     offsetY: 0,
  //   },
  //   text: {
  //     content: "Votre description personnalisée...",
  //     offsetX: 0,
  //     offsetY: 0,
  //     rotation: -1,
  //     scale: 1,
  //     opacity: 0.85,
  //   },
  //   layout: {
  //     side: 'right',
  //     marginTop: 0,
  //     marginBottom: 80,
  //   },
  // },
];
