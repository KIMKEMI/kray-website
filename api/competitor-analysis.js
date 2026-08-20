const GAS_DASHBOARD_URL = 'https://script.google.com/macros/s/AKfycbyth6DLCBAMXKoENL4gk5z7yxt36Uwg8rN44QsrQpwnn-Bc7Y1hKUuMmzqXXNjG0_0K/exec';

// rakuten-ranking.js가 내부적으로 15초 타임아웃 + 1회 재시도까지 하므로
// 그보다 넉넉하게 잡아야 정상적으로 느린 응답도 기다려줄 수 있다.
export const maxDuration = 40;

export const config = {
  maxDuration: 40,
};

function flagsFromText(text = '') {
  const t = String(text);
  return {
    coupon: /クーポン|OFF|割引|セール/i.test(t),
    freeShipping: /送料無料/i.test(t),
    points: /ポイント|P[0-9]+倍/i.test(t),
    socialProof: /楽天1位|ランキング1位|人気|高評価/i.test(t),
    urgency: /限定|本日|まで|即納|当日発送/i.test(t),
  };
}

function normalizeTop(item) {
  const p = item || {};
  return {
    rank: p.rank ?? null,
    url: p.itemUrl || p.url || '',
    title: p.title || '',
    imageUrl: p.imageUrl || '',
    price: p.price ?? null,
    reviews: p.reviewCount ?? p.reviews ?? null,
    reviewAverage: p.reviewAverage ?? null,
    pointRate: p.pointRate ?? null,
    shopName: p.shopName || '',
    flags: flagsFromText(`${p.title || ''} ${p.catchcopy || ''}`),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const genreId = String(req.query.genreId || '').trim();
  const myRank = String(req.query.myRank || '').trim();
  if (!/^\d{3,10}$/.test(genreId)) {
    return res.status(400).json({ ok: false, error: 'Invalid genreId' });
  }

  try {
    const upstream = new URL(GAS_DASHBOARD_URL);
    upstream.searchParams.set('action', 'competitor');
    upstream.searchParams.set('genreId', genreId);
    if (myRank) upstream.searchParams.set('myRank', myRank);
    upstream.searchParams.set('_', Date.now().toString());

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    let response;
    try {
      response = await fetch(upstream, {
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
      return res.status(502).json({ ok: false, error: `Apps Script HTTP ${response.status}` });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ ok: false, error: 'Apps Script returned non-JSON' });
    }

    if (!data.ok) {
      return res.status(502).json({ ok: false, error: data.error || 'Competitor analysis failed' });
    }

    const top = Array.isArray(data.top) ? data.top.map(normalizeTop) : [];
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json({
      ok: true,
      genreId,
      source: data.source || 'Rakuten Ichiba Ranking API',
      top,
      mine: null,
      insights: data.insights || { observations: [], actions: [], note: '' },
      fetchedAt: data.fetchedAt || null,
      cached: !!data.cached,
    });
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Competitor analysis timed out'
      : (error instanceof Error ? error.message : 'Competitor analysis failed');
    console.error('competitor-analysis', genreId, message);
    return res.status(502).json({ ok: false, error: message });
  }
}
