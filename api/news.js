const GAS_DASHBOARD_URL = 'https://script.google.com/macros/s/AKfycbyth6DLCBAMXKoENL4gk5z7yxt36Uwg8rN44QsrQpwnn-Bc7Y1hKUuMmzqXXNjG0_0K/exec';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const upstream = new URL(GAS_DASHBOARD_URL);
    upstream.searchParams.set('action', 'dashboard');
    upstream.searchParams.set('_', Date.now().toString());

    const response = await fetch(upstream, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        Accept: 'application/json,text/plain,*/*',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: `Upstream API HTTP ${response.status}`,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Upstream API returned a non-JSON response',
      });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
    });
  }
}
