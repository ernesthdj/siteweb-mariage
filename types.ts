
export enum WallSection {
  HOME = 'home',
  GALLERY = 'gallery',
  PORTFOLIO = 'portfolio',
  DETAIL = 'detail',
  CONTACT = 'contact'
}

export type ThemeType = 'wedding' | 'culinary' | 'urban' | 'birth' | 'nature' | 'fashion' | 'architecture' | 'portrait' | 'showcase';

export type PhotoShape = 'rectangle' | 'circle' | 'polaroid';
export type PhotoMount = 'none' | 'tape' | 'corners' | 'pin';

export interface Photo {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  rotation?: number;
  shape?: PhotoShape;
  mount?: PhotoMount;
}

export interface ExhibitionTheme {
  id: string;
  type: ThemeType;
  title: string;
  subtitle: string;
  coverUrl: string;
  description: string;
  photos: Photo[];
}

export interface Album {
  id: string;
  theme: string;
  title: string;
  description: string;
  coverUrl: string;
  photos: Photo[];
}
