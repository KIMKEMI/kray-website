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
  const itemCode = String(req.query.itemCode || '').trim();
  if (!/^\d{3,10}$/.test(genreId)) {
    return res.status(400).json({ ok: false, error: 'Invalid genreId' });
  }

  try {
    const upstream = new URL(GAS_DASHBOARD_URL);
    upstream.searchParams.set('action', 'competitor');
    upstream.searchParams.set('genreId', genreId);
    if (myRank) upstream.searchParams.set('myRank', myRank);
    if (itemCode) upstream.searchParams.set('myItemCode', itemCode);
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
    const mine = data.mine ? normalizeTop(data.mine) : null;

    /*
     * 2026-08-24 (Kemi): 1~10위가 온전한 응답만 CDN에 캐시한다.
     *
     * 프론트엔드는 순위가 1..10으로 정확히 채워지지 않으면 "잘못된 순위를
     * 표시하지 않는다"는 정책상 표시를 거부한다. 그런데 지금까지는 그런
     * 불완전한 응답까지 10분간 캐시돼서, 업스트림이 잠깐 흔들린 대가를
     * 사용자가 10분 내내 치르고 있었다. (실측 예: [1,2,3,4,6,7,8,9,10,11]
     * -- 5위가 빠지고 11위가 섞여 들어옴)
     *
     * 온전하지 않으면 캐시하지 않고 다음 요청에서 곧바로 다시 시도하게 한다.
     */
    const ranks = top.map((x) => Number(x.rank));
    const isComplete = ranks.length === 10 && ranks.every((r, i) => r === i + 1);

    if (isComplete) {
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    } else {
      res.setHeader('Cache-Control', 'no-store');
      console.log(JSON.stringify({
        tag: 'oracle-proxy', event: 'incomplete_top10',
        genreId, receivedRanks: ranks, count: ranks.length,
      }));
    }
    return res.status(200).json({
      ok: true,
      genreId,
      source: data.source || 'Rakuten Ichiba Ranking API',
      top,
      mine,
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
