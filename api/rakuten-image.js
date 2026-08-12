const ALLOWED_HOSTS = new Set([
  'thumbnail.image.rakuten.co.jp',
  'image.rakuten.co.jp',
]);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed');
  }

  const raw = String(req.query.url || '').trim();
  if (!raw) return res.status(400).end('Missing url');

  let target;
  try {
    target = new URL(raw);
  } catch {
    return res.status(400).end('Invalid url');
  }

  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return res.status(403).end('Host not allowed');
  }

  try {
    const response = await fetch(target.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 Kray-EC-Intelligence/1.0',
      },
    });

    if (!response.ok) {
      return res.status(502).end(`Rakuten image HTTP ${response.status}`);
    }

    const type = response.headers.get('content-type') || 'image/jpeg';
    if (!type.startsWith('image/')) {
      return res.status(502).end('Upstream was not an image');
    }

    const data = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(data);
  } catch (error) {
    return res.status(502).end(error instanceof Error ? error.message : 'Image proxy failed');
  }
}
