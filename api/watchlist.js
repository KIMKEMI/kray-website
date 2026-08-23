const GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbyth6DLCBAMXKoENL4gk5z7yxt36Uwg8rN44QsrQpwnn-Bc7Y1hKUuMmzqXXNjG0_0K/exec';

export const maxDuration = 60;
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = String(body.action || '').trim();
  const adminToken = String(body.adminToken || '').trim();

  if (action !== 'addWatchlistItem' && action !== 'removeWatchlistItem') {
    return res.status(400).json({ ok: false, error: 'Unknown action' });
  }
  if (!adminToken) {
    return res.status(401).json({ ok: false, error: '관리자 토큰이 필요합니다.' });
  }

  const payload = { action, adminToken };
  if (action === 'addWatchlistItem') {
    payload.itemUrl = String(body.itemUrl || '').trim();
    if (!payload.itemUrl) {
      return res.status(400).json({ ok: false, error: 'itemUrl이 필요합니다.' });
    }
  } else {
    payload.itemCode = String(body.itemCode || '').trim();
    if (!payload.itemCode) {
      return res.status(400).json({ ok: false, error: 'itemCode가 필요합니다.' });
    }
  }

  const controller = new AbortController();
  // 상품 추가는 GAS 쪽에서 Rakuten 상품/장르 조회 + 초기 랭킹 스냅샷 기록까지
  // 동기로 수행하므로 넉넉한 타임아웃을 둔다.
  const timer = setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch(GAS_EXEC_URL, {
      method: 'POST',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ ok: false, error: 'Upstream API returned a non-JSON response' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(data && data.ok ? 200 : 400).json(data);
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? '작업이 시간 내에 끝나지 않았습니다. 잠시 후 대시보드를 새로고침해 다시 확인해 주세요.'
      : (error instanceof Error ? error.message : 'Watchlist 요청 처리 중 오류가 발생했습니다.');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ ok: false, error: message });
  } finally {
    clearTimeout(timer);
  }
}
