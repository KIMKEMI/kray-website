const GAS_DASHBOARD_URL = 'https://script.google.com/macros/s/AKfycbyth6DLCBAMXKoENL4gk5z7yxt36Uwg8rN44QsrQpwnn-Bc7Y1hKUuMmzqXXNjG0_0K/exec';

const WATCHLIST_IMAGE_FALLBACKS = {
  'onni-style:10000258': '/api/rakuten-item-image?shop=onni-style&item=tw-hyd',
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
    const timer = setTimeout(() => controller.abort(), 20000);
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
    // 2026-08-24 (Kemi): 대시보드 로딩 속도 개선.
    // 이 데이터는 수집 트리거가 돌 때(수십 분 간격)만 바뀌므로 매 방문마다
    // Apps Script를 5~6초씩 기다릴 이유가 없다.
    //   - max-age=0        : 브라우저는 항상 CDN에 확인(항상 최신 여부 체크)
    //   - s-maxage           : CDN 엣지에서 이 시간 동안 즉시 응답
    //   - stale-while-revalidate : 만료 후에도 우선 캐시본을 즉시 주고,
    //     뒤에서 조용히 새로 받아온다 -> 사용자가 기다리는 일이 사실상 없어진다.
    //
    // 2026-08-31 (Kemi 보고): 자정 직후 리얼타임 랭킹 1위 달성 LINE 알림을
    // 받았는데 사이트에는 "오늘의 성과"가 비어 보였다. 원인은 두 가지였다:
    //  1) GAS 쪽 날짜 계산 버그(recordRankMilestone_에서 수정, day/achievedTime
    //     불일치) - 이게 주 원인.
    //  2) 이 CDN 캐시가 최대 120초(심지어 재검증 지연 시 최대 1800초까지)
    //     오래된 응답을 그대로 내줄 수 있어 위 버그가 없어도 최대 몇 분간은
    //     "방금 달성한 성과"가 안 보일 수 있었다.
    // "오늘의 성과"는 실시간성이 중요한 데이터이므로 캐시 시간을 크게
    // 줄인다. 워치리스트/뉴스 데이터도 같은 응답에 실려가지만, 10~15초
    // 캐시로도 "매 방문마다 5~6초 대기" 문제는 여전히 방지된다.
    const CACHE_POLICY = 'public, max-age=0, s-maxage=15, stale-while-revalidate=60';
    res.setHeader('Cache-Control', CACHE_POLICY);
    res.setHeader('CDN-Cache-Control', CACHE_POLICY);
    res.setHeader('Vercel-CDN-Cache-Control', CACHE_POLICY);
    return res.status(200).json(data);
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Dashboard upstream timed out'
      : (error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ ok: false, error: message });
  }
}
