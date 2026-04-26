/** Types de noeud dans l'arborescence CMS */
export type ItemType = 'collection' | 'album' | 'photo';

/** Représentation d'un item tel que stocké dans Supabase */
export interface Item {
  id: string;
  type: ItemType;
  label: string;
  url: string | null;
  description: string | null;
  subtitle: string | null;
  parent_id: string | null;
  position: number;
  visible: boolean;
  variant: string;
  metadata: Record<string, unknown>;
  link: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload pour la création d'un item (champs obligatoires + optionnels) */
export interface CreateItemPayload {
  type: ItemType;
  label: string;
  url?: string;
  description?: string;
  subtitle?: string;
  parent_id?: string;
  position?: number;
  visible?: boolean;
  variant?: string;
  metadata?: Record<string, unknown>;
  link?: string;
}

/** Payload pour la mise à jour partielle d'un item */
export type UpdateItemPayload = Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>;

/** Paire id/position pour le réordonnancement batch */
export interface ReorderEntry {
  id: string;
  position: number;
}

/** Dossier Cloudinary retourné par l'Edge Function */
export interface CloudinaryFolder {
  name: string;
  path: string;
}

/** Image Cloudinary retournée par l'Edge Function */
export interface CloudinaryImage {
  public_id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  format: string;
}

/** Réponse de l'Edge Function cloudinary-browse */
export interface CloudinaryBrowseResponse {
  folders: CloudinaryFolder[];
  images: CloudinaryImage[];
}
