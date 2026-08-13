const ALLOWED_SHOPS = new Set(['onni-style', 'sonaandtokyo']);

function absolutize(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://')) return `https://${url.slice(7)}`;
  return url;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed');
  }

  const shop = String(req.query.shop || '').trim();
  const item = String(req.query.item || '').trim();
  if (!ALLOWED_SHOPS.has(shop) || !/^[a-zA-Z0-9_-]+$/.test(item)) {
    return res.status(400).end('Invalid item');
  }

  try {
    const pageUrl = `https://item.rakuten.co.jp/${shop}/${item}/`;
    const page = await fetch(pageUrl, {
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 Kray-EC-Intelligence/1.0',
      },
    });
    if (!page.ok) return res.status(502).end(`Rakuten item HTTP ${page.status}`);

    const html = await page.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /https?:\/\/thumbnail\.image\.rakuten\.co\.jp\/[^"'<> ]+/i,
    ];
    let imageUrl = '';
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        imageUrl = absolutize(match[1] || match[0]);
        break;
      }
    }
    if (!imageUrl) return res.status(404).end('Image not found');

    const image = await fetch(imageUrl, {
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: pageUrl,
        'User-Agent': 'Mozilla/5.0 Kray-EC-Intelligence/1.0',
      },
    });
    if (!image.ok) return res.status(502).end(`Rakuten image HTTP ${image.status}`);

    const type = image.headers.get('content-type') || 'image/jpeg';
    if (!type.startsWith('image/')) return res.status(502).end('Upstream was not an image');
    const data = Buffer.from(await image.arrayBuffer());
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(data);
  } catch (error) {
    return res.status(502).end(error instanceof Error ? error.message : 'Item image fallback failed');
  }
}
