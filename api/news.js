const GAS_DASHBOARD_URL = 'https://script.google.com/macros/s/AKfycbyth6DLCBAMXKoENL4gk5z7yxt36Uwg8rN44QsrQpwnn-Bc7Y1hKUuMmzqXXNjG0_0K/exec';

const WATCHLIST_IMAGE_FALLBACKS = {
  'onni-style:10000258': '/api/rakuten-item-image?shop=onni-style&item=tw-hyd-3',
};

function applyWatchlistFallbacks(data) {
  if (!data || !Array.isArray(data.watchlist)) return data;
  data.watchlist = data.watchlist.map((item) => {
    if (!item || item.imageUrl) return item;
    const fallback = WATCHLIST_IMAGE_FALLBACKS[item.itemCode];
    return fallback ? { ...item, imageUrl: fallback } : item;
  });
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const upstream = new URL(GAS_DASHBOARD_URL);
    upstream.searchParams.set('action', 'dashboard');
    upstream.searchParams.set('_', Date.now().toString());

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(upstream, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          Accept: 'application/json,text/plain,*/*',
          'User-Agent': 'Kray-EC-Intelligence/1.0',
        },
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    if (!response.ok) {
      return res.status(502).json({ ok: false, error: `Upstream API HTTP ${response.status}` });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ ok: false, error: 'Upstream API returned a non-JSON response' });
    }

    data = applyWatchlistFallbacks(data);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Dashboard upstream timed out'
      : (error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ ok: false, error: message });
  }
}
