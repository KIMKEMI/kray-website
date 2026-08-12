const FIXED_IP_PROXY = 'http://168.110.52.250:8080/ichibaranking/api/IchibaItem/Ranking/20220601';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const applicationId = String(body.applicationId || '').trim();
  const accessKey = String(body.accessKey || '').trim();
  const genreId = String(body.genreId || '').trim();
  const page = Number(body.page || 1);

  if (!applicationId || !accessKey || !genreId || !Number.isFinite(page) || page < 1 || page > 34) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid parameters' });
  }

  const upstream = new URL(FIXED_IP_PROXY);
  upstream.searchParams.set('applicationId', applicationId);
  upstream.searchParams.set('accessKey', accessKey);
  upstream.searchParams.set('format', 'json');
  upstream.searchParams.set('formatVersion', '2');
  upstream.searchParams.set('genreId', genreId);
  upstream.searchParams.set('page', String(page));

  // The fixed-IP proxy is allowlisted by Rakuten. Vercel is only a timeout guard:
  // Apps Script -> Vercel -> fixed-IP proxy -> Rakuten.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(upstream, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json,text/plain,*/*' },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: `Fixed-IP proxy HTTP ${response.status}`,
        upstreamBody: text.slice(0, 500),
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Fixed-IP proxy returned non-JSON',
        upstreamBody: text.slice(0, 500),
      });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(data);
  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    return res.status(timedOut ? 504 : 502).json({
      ok: false,
      error: timedOut
        ? 'Fixed-IP proxy timeout after 8s'
        : (error instanceof Error ? error.message : 'Ranking proxy error'),
    });
  } finally {
    clearTimeout(timer);
  }
}
