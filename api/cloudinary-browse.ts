import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary credentials not configured' });
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const folder = (req.query.folder as string) || '';

  try {
    // Lister les sous-dossiers
    let folders: Array<{ name: string; path: string }> = [];
    try {
      const foldersUrl = folder
        ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/folders/${folder}`
        : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/folders`;

      const foldersRes = await fetch(foldersUrl, {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        folders = (foldersData.folders || []).map((f: { name: string; path: string }) => ({
          name: f.name,
          path: f.path,
        }));
      }
    } catch {
      // Pas de sous-dossiers, on continue
    }

    // Lister les images du dossier
    let images: Array<{ public_id: string; url: string; thumbnail: string; width: number; height: number; format: string }> = [];
    if (folder) {
      const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
      const searchRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expression: `asset_folder="${folder}"`,
          max_results: 100,
          sort_by: [{ field: 'created_at', direction: 'desc' }],
        }),
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        images = (searchData.resources || []).map((r: { public_id: string; secure_url: string; width: number; height: number; format: string }) => ({
          public_id: r.public_id,
          url: r.secure_url,
          thumbnail: r.secure_url.replace('/upload/', '/upload/c_fill,w_200,h_200,q_auto/'),
          width: r.width,
          height: r.height,
          format: r.format,
        }));
      }
    }

    return res.status(200).json({ folders, images });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Cloudinary';
    return res.status(500).json({ error: message });
  }
}
