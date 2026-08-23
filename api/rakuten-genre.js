const FIXED_IP_PROXY = 'http://168.110.52.250:8080/ichibagt/api/IchibaGenre/Search/20260701';
const PROXY_TIMEOUT_MS = 15000;

// Vercel 서버리스 함수 자체의 최대 실행 시간을 늘려, 프록시 타임아웃(15초) +
// 재시도 1회를 하기에 충분한 여유를 준다. (플랜에 따라 상한이 다를 수 있음)
export const maxDuration = 30;

export const config = {
  maxDuration: 30,
};

async function fetchOnce(upstream, proxyToken) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    const response = await fetch(upstream, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'X-Kray-Proxy-Token': proxyToken,
      },
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const applicationId = String(body.applicationId || '').trim();
  const accessKey = String(body.accessKey || '').trim();
  const genreId = String(body.genreId || '').trim();
  const proxyToken = String(body.proxyToken || '').trim();

  if (!applicationId || !genreId || !proxyToken) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid parameters' });
  }

  const upstream = new URL(FIXED_IP_PROXY);
  upstream.searchParams.set('applicationId', applicationId);
  if (accessKey) {
    upstream.searchParams.set('accessKey', accessKey);
  }
  upstream.searchParams.set('format', 'json');
  upstream.searchParams.set('formatVersion', '2');
  upstream.searchParams.set('genreId', genreId);

  // 오라클 서버가 일시적으로 느릴 때를 대비해 최대 2회(최초 + 재시도 1회) 시도한다.
  const attempts = 2;
  let lastErrorPayload = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { response, text } = await fetchOnce(upstream, proxyToken);

      if (!response.ok) {
        lastErrorPayload = {
          status: response.status,
          body: {
            ok: false,
            error: `Fixed-IP proxy HTTP ${response.status}`,
            upstreamBody: text.slice(0, 500),
          },
        };
        // 5xx/타임아웃성 오류만 재시도. 4xx(요청 자체 문제)는 즉시 반환.
        if (response.status >= 500 && attempt < attempts) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }
        return res.status(lastErrorPayload.status).json(lastErrorPayload.body);
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

      res.setHeader('Cache-Control', 'no-store, max-age=300');
      return res.status(200).json(data);
    } catch (error) {
      const timedOut = error && error.name === 'AbortError';
      lastErrorPayload = {
        status: timedOut ? 504 : 502,
        body: {
          ok: false,
          error: timedOut
            ? `Fixed-IP proxy timeout after ${PROXY_TIMEOUT_MS / 1000}s`
            : (error instanceof Error ? error.message : 'Genre relay error'),
        },
      };
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
    }
  }

  return res.status(lastErrorPayload.status).json(lastErrorPayload.body);
}
