const RANKING_BASE = 'https://ranking.rakuten.co.jp/daily/';

function cleanText(s = '') {
  return String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m && m[1]) return cleanText(m[1]);
  }
  return '';
}

function absolutize(url = '') {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://ranking.rakuten.co.jp${url}`;
  return url.replace(/^http:\/\//i, 'https://');
}

function parsePrice(text) {
  const matches = [...text.matchAll(/([0-9][0-9,]{1,9})\s*円/g)]
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 10000000);
  return matches.length ? matches[0] : null;
}

function parseReviews(text) {
  const m = text.match(/レビュー\s*\(?\s*([0-9,]+)\s*件\s*\)?/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

function parsePoint(text) {
  const m = text.match(/([0-9]{1,2})%\s*ポイント(?:バック)?/i) || text.match(/ポイント\s*([0-9]{1,2})倍/i);
  return m ? Number(m[1]) : null;
}

function promoFlags(text) {
  const t = cleanText(text);
  return {
    coupon: /クーポン|OFF|割引|セール/i.test(t),
    freeShipping: /送料無料/i.test(t),
    points: /ポイント|P[0-9]+倍/i.test(t),
    socialProof: /楽天1位|ランキング1位|人気|リピ|高評価/i.test(t),
    urgency: /限定|本日|まで|残り|即納|当日発送/i.test(t),
  };
}

function extractRankingProducts(html) {
  const linkRe = /<a\b[^>]*href=["'](https?:\/\/item\.rakuten\.co\.jp\/[^"'#?]+\/?)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  const products = [];
  const seen = new Set();
  let match;
  while ((match = linkRe.exec(html)) && products.length < 12) {
    const url = match[1].replace(/^http:\/\//i, 'https://');
    if (seen.has(url)) continue;
    seen.add(url);
    const from = Math.max(0, match.index - 2200);
    const to = Math.min(html.length, linkRe.lastIndex + 2600);
    const chunk = html.slice(from, to);
    let title = cleanText(match[2]);
    if (!title || title.length < 8) {
      title = firstMatch(chunk, [
        /alt=["']([^"']{8,250})["']/i,
        /title=["']([^"']{8,250})["']/i,
      ]);
    }
    const image = firstMatch(chunk, [
      /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i,
      /<img[^>]+data-src=["'](https?:\/\/[^"']+)["']/i,
    ]);
    const text = cleanText(chunk);
    products.push({
      rank: products.length + 1,
      url,
      title: title.slice(0, 220),
      imageUrl: absolutize(image),
      price: parsePrice(text),
      reviews: parseReviews(text),
      pointRate: parsePoint(text),
      flags: promoFlags(text),
    });
  }
  return products.slice(0, 3);
}

async function fetchHtml(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; KrayECIntelligence/1.0)',
      },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseMyProduct(html, itemUrl) {
  const title = firstMatch(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i,
  ]);
  const imageUrl = absolutize(firstMatch(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  ]));
  const text = cleanText(html.slice(0, 250000));
  let price = null;
  const jsonPrice = html.match(/["']price["']\s*:\s*["']?([0-9,]+(?:\.[0-9]+)?)/i);
  if (jsonPrice) price = Number(String(jsonPrice[1]).replace(/,/g, ''));
  if (!Number.isFinite(price)) price = parsePrice(text);
  return {
    url: itemUrl,
    title: title.slice(0, 220),
    imageUrl,
    price: Number.isFinite(price) ? price : null,
    reviews: parseReviews(text),
    pointRate: parsePoint(text),
    flags: promoFlags(text),
  };
}

function median(nums) {
  const a = nums.filter(Number.isFinite).sort((a, b) => a - b);
  if (!a.length) return null;
  return a[Math.floor(a.length / 2)];
}

function buildInsights(top, mine, myRank) {
  const topPrices = top.map((x) => x.price).filter(Number.isFinite);
  const topReviews = top.map((x) => x.reviews).filter(Number.isFinite);
  const medPrice = median(topPrices);
  const medReviews = median(topReviews);
  const promoCount = top.filter((x) => x.flags.coupon).length;
  const urgencyCount = top.filter((x) => x.flags.urgency).length;
  const pointCount = top.filter((x) => x.flags.points).length;
  const observations = [];
  const actions = [];

  if (mine && Number.isFinite(mine.reviews) && Number.isFinite(medReviews)) {
    if (mine.reviews < medReviews * 0.5) {
      observations.push(`상위 3개 상품의 리뷰 중앙값은 ${medReviews.toLocaleString()}건으로, 자사 상품보다 사회적 증거가 강합니다.`);
      actions.push('리뷰 획득 동선을 강화하고, 기존 리뷰의 핵심 장점을 상세페이지·썸네일 문구에 재활용하세요.');
    } else if (mine.reviews >= medReviews) {
      observations.push('리뷰 수는 상위권과 비교해 크게 밀리지 않습니다. 리뷰보다 오퍼·노출 요소를 우선 점검할 가치가 있습니다.');
    }
  } else if (Number.isFinite(medReviews)) {
    observations.push(`상위 3개 상품의 리뷰 중앙값은 ${medReviews.toLocaleString()}건입니다.`);
  }

  if (mine && Number.isFinite(mine.price) && Number.isFinite(medPrice)) {
    const ratio = mine.price / medPrice;
    if (ratio > 1.2) {
      observations.push(`자사 가격이 상위권 중앙값(약 ¥${medPrice.toLocaleString()})보다 높습니다.`);
      actions.push('무조건 가격 인하보다 쿠폰·포인트·세트가치 등 체감가격을 낮추는 오퍼를 먼저 A/B 테스트하세요.');
    } else if (ratio < 0.8) {
      observations.push(`자사 가격은 상위권 중앙값(약 ¥${medPrice.toLocaleString()})보다 낮아 가격 자체가 가장 큰 약점으로 보이지 않습니다.`);
      actions.push('낮은 가격을 유지하되 첫 이미지에서 소재·기능·사용 장면 등 구매 이유를 더 선명하게 전달하세요.');
    } else {
      observations.push(`가격대는 상위권 중앙값(약 ¥${medPrice.toLocaleString()})과 비슷합니다.`);
    }
  }

  if (promoCount >= 2) {
    observations.push(`상위 3개 중 ${promoCount}개가 쿠폰·할인 메시지를 전면에 사용합니다.`);
    actions.push('이벤트 기간에는 상품명 앞부분과 첫 화면에서 쿠폰/할인 혜택이 즉시 보이도록 구성하세요.');
  }
  if (pointCount >= 2) {
    observations.push(`상위권에서 포인트 혜택 노출이 반복적으로 확인됩니다.`);
    actions.push('가능한 캠페인 기간에 포인트 배율을 경쟁 상품과 맞춰 체감 혜택 격차를 줄이세요.');
  }
  if (urgencyCount >= 2) {
    actions.push('기간 한정·즉납·당일발송 등 실제 제공 가능한 긴급성 메시지를 명확히 노출하세요.');
  }
  if (!actions.length) {
    actions.push('상위 3개 상품의 제목·첫 이미지·가격·리뷰·혜택을 주 1회 비교하고 가장 큰 한 가지 격차부터 테스트하세요.');
    actions.push('상품명 첫 40~60자에 카테고리 핵심 검색어와 핵심 USP를 우선 배치하세요.');
  }

  if (Number.isFinite(myRank) && myRank <= 20) {
    actions.push('이미 상위권에 있으므로 큰 폭의 가격 변경보다 썸네일·쿠폰·포인트를 한 요소씩 테스트해 순위 반응을 기록하세요.');
  } else {
    actions.push('변경 전후 3~7일의 순위 변화를 기록해 어떤 액션이 실제로 순위 개선과 함께 움직였는지 확인하세요.');
  }

  return {
    observations: [...new Set(observations)].slice(0, 4),
    actions: [...new Set(actions)].slice(0, 4),
    note: '랭킹 원인은 Rakuten이 공개하지 않으므로, 아래 내용은 상위 상품의 공개 가격·리뷰·혜택·상품명에서 관찰되는 차이를 기반으로 한 추정입니다.',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const genreId = String(req.query.genreId || '').trim();
  const itemUrl = String(req.query.itemUrl || '').trim();
  const myRank = Number(req.query.myRank || 0) || null;
  if (!/^\d{3,10}$/.test(genreId)) return res.status(400).json({ ok: false, error: 'Invalid genreId' });

  let safeItemUrl = '';
  if (itemUrl) {
    try {
      const u = new URL(itemUrl);
      if (u.protocol === 'https:' && u.hostname === 'item.rakuten.co.jp') safeItemUrl = u.origin + u.pathname;
    } catch {}
  }

  try {
    const rankingUrl = `${RANKING_BASE}${genreId}/`;
    const rankingHtml = await fetchHtml(rankingUrl, 9000);
    const top = extractRankingProducts(rankingHtml);
    let mine = null;
    if (safeItemUrl) {
      try {
        mine = parseMyProduct(await fetchHtml(safeItemUrl, 8000), safeItemUrl);
      } catch {}
    }
    const insights = buildInsights(top, mine, myRank);
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({ ok: true, genreId, source: rankingUrl, top, mine, insights });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : 'Competitor analysis failed' });
  }
}
