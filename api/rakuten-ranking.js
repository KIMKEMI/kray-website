const FIXED_IP_PROXY = 'http://168.110.52.250:8080/ichibaranking/api/IchibaItem/Ranking/20220601';
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
  const startedAt = Date.now();
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
    return { response, text, latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * 2026-08-24 (Kemi 요청): 오라클 고정IP 프록시(168.110.52.250)의 안정성을
 * 객관적으로 판정하기 위한 구조화 로그.
 * Vercel 런타임 로그에서 tag="oracle-proxy"로 검색하면 전부 모인다.
 * upstream 본문을 같이 남기는 게 핵심 -- 같은 404라도
 *   - 라쿠텐이 "데이터 없음"이라 답한 정상 404 인지
 *   - 오라클 서버가 뻗어서 뱉은 404 인지
 * 를 본문으로만 구별할 수 있기 때문이다.
 */
function logProxy(fields) {
  try {
    console.log(JSON.stringify(Object.assign({ tag: 'oracle-proxy' }, fields)));
  } catch (_) {
    /* 로깅 실패가 본 기능을 막아서는 안 된다 */
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
  const page = Number(body.page || 1);
  const proxyToken = String(body.proxyToken || '').trim();
  // 'realtime'이면 리얼타임 랭킹, 그 외(미지정 포함)는 라쿠텐 기본값인 데일리 랭킹.
  const period = String(body.period || '').trim();

  if (!applicationId || !accessKey || !genreId || !proxyToken || !Number.isFinite(page) || page < 1 || page > 34) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid parameters' });
  }

  const upstream = new URL(FIXED_IP_PROXY);
  upstream.searchParams.set('applicationId', applicationId);
  upstream.searchParams.set('accessKey', accessKey);
  upstream.searchParams.set('format', 'json');
  upstream.searchParams.set('formatVersion', '2');
  upstream.searchParams.set('genreId', genreId);
  upstream.searchParams.set('page', String(page));
  if (period === 'realtime') {
    upstream.searchParams.set('period', 'realtime');
  }

  // 오라클 서버가 일시적으로 느릴 때를 대비해 최대 2회(최초 + 재시도 1회) 시도한다.
  const attempts = 2;
  let lastErrorPayload = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { response, text, latencyMs } = await fetchOnce(upstream, proxyToken);

      if (!response.ok) {
        const snippet = String(text || '').slice(0, 200).replace(/\s+/g, ' ').trim();
        logProxy({
          event: 'upstream_error', genreId, page, period: period || 'daily',
          attempt, status: response.status, latencyMs,
          upstream: snippet || '<empty body>',
        });
        lastErrorPayload = {
          status: response.status,
          // upstream 본문을 error 문자열에 함께 실어야 Apps Script 쪽 로그와
          // proxy_health 시트까지 원인이 그대로 전달된다.
          body: {
            ok: false,
            error: `Fixed-IP proxy HTTP ${response.status} :: ${snippet || '<empty body>'}`,
            upstreamBody: text.slice(0, 500),
            latencyMs,
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
        const snippet = String(text || '').slice(0, 200).replace(/\s+/g, ' ').trim();
        logProxy({
          event: 'non_json', genreId, page, period: period || 'daily',
          attempt, status: response.status, latencyMs, upstream: snippet,
        });
        return res.status(502).json({
          ok: false,
          error: `Fixed-IP proxy returned non-JSON :: ${snippet}`,
          upstreamBody: text.slice(0, 500),
        });
      }

      logProxy({
        event: 'ok', genreId, page, period: period || 'daily',
        attempt, status: 200, latencyMs,
      });
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(data);
    } catch (error) {
      const timedOut = error && error.name === 'AbortError';
      logProxy({
        event: timedOut ? 'timeout' : 'connect_error',
        genreId, page, period: period || 'daily', attempt,
        timeoutMs: timedOut ? PROXY_TIMEOUT_MS : undefined,
        message: error instanceof Error ? error.message : String(error),
      });
      lastErrorPayload = {
        status: timedOut ? 504 : 502,
        body: {
          ok: false,
          error: timedOut
            ? `Fixed-IP proxy timeout after ${PROXY_TIMEOUT_MS / 1000}s`
            : (error instanceof Error ? error.message : 'Ranking relay error'),
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
