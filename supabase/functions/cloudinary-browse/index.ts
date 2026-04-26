import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryFolderEntry {
  name: string;
  path: string;
}

serve(async (req: Request) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérifier les credentials Cloudinary
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Variables Cloudinary non configurées sur le serveur');
    }

    // Vérifier l'authentification via le JWT Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token d\'authentification manquant' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extraire le paramètre folder du body
    const body = await req.json();
    const folder: string = body.folder ?? '';

    const authString = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`);
    const baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

    // Lister les sous-dossiers
    const foldersUrl = folder
      ? `${baseUrl}/folders/${encodeURIComponent(folder)}`
      : `${baseUrl}/folders`;

    const foldersResponse = await fetch(foldersUrl, {
      headers: { Authorization: `Basic ${authString}` },
    });

    let folders: CloudinaryFolderEntry[] = [];
    if (foldersResponse.ok) {
      const foldersData = await foldersResponse.json();
      folders = (foldersData.folders ?? []).map((f: CloudinaryFolderEntry) => ({
        name: f.name,
        path: f.path,
      }));
    }

    // Lister les images du dossier (uniquement si un dossier est spécifié)
    let images: Array<{
      public_id: string;
      url: string;
      thumbnail: string;
      width: number;
      height: number;
      format: string;
    }> = [];

    if (folder) {
      const resourcesUrl = `${baseUrl}/resources/search`;
      const searchResponse = await fetch(resourcesUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expression: `folder:${folder} AND resource_type:image`,
          max_results: 100,
          sort_by: [{ field: 'created_at', direction: 'desc' }],
        }),
      });

      if (searchResponse.ok) {
        const resourcesData = await searchResponse.json();
        images = (resourcesData.resources ?? []).map((r: CloudinaryResource) => ({
          public_id: r.public_id,
          url: r.secure_url,
          thumbnail: r.secure_url.replace('/upload/', '/upload/c_thumb,w_200,h_200/'),
          width: r.width,
          height: r.height,
          format: r.format,
        }));
      }
    }

    return new Response(
      JSON.stringify({ folders, images }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
