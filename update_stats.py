"""
update_stats.py
Instagram 모바일 API를 흉내내어 로그인 없이 팔로워 수를 수집합니다.
"""

import re
import sys
import time
import random
from pathlib import Path

try:
    import requests
except ImportError:
    print("[ERROR] requests 없음", file=sys.stderr)
    sys.exit(1)

USERNAME   = "sona_tokyolife"
INDEX_PATH = Path(__file__).parent / "index.html"

# ── 포맷 변환 ────────────────────────────────────────────────
def format_followers(count: int) -> dict:
    if count >= 10_000:
        man     = count / 10_000
        man_str = f"{man:.1f}".rstrip("0").rstrip(".")
        return {"ko": f"{man_str}만", "ja": f"{man_str}万人", "en": f"{round(count/1000)}K"}
    return {"ko": f"{count:,}", "ja": f"{count:,}人", "en": f"{count:,}"}

# ── 방법 1: oEmbed API (로그인 불필요, 공식 지원) ────────────
def fetch_via_oembed() -> int | None:
    """
    Instagram oEmbed는 공개 프로필 정보를 반환합니다.
    단, 팔로워 수는 포함되지 않을 수 있음 → 시도만
    """
    url = f"https://graph.facebook.com/v18.0/instagram_oembed?url=https://www.instagram.com/{USERNAME}/&access_token=anonymous"
    try:
        r = requests.get(url, timeout=10)
        print(f"[oEmbed] HTTP {r.status_code}")
    except Exception as e:
        print(f"[oEmbed] 실패: {e}")
    return None

# ── 방법 2: Instagram i.instagram.com API ────────────────────
def fetch_via_i_api(session: requests.Session) -> int | None:
    """
    i.instagram.com은 모바일 앱용 API로, 봇 감지가 덜합니다.
    """
    url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
    headers = {
        "User-Agent": "Instagram 269.0.0.18.75 Android (26/8.0.0; 480dpi; 1080x1920; "
                      "OnePlus; ONEPLUS A3010; OnePlus3T; qcom; en_US; 314665256)",
        "Accept": "*/*",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate",
        "X-IG-App-ID": "936619743392459",
        "X-IG-Capabilities": "3brTvwE=",
        "X-IG-Connection-Type": "WIFI",
        "X-IG-Device-ID": f"{random.randint(10**15, 10**16-1):016x}",
    }
    try:
        r = session.get(url, headers=headers, timeout=15)
        print(f"[i.instagram] HTTP {r.status_code}")
        if r.status_code == 200:
            data  = r.json()
            count = (data.get("data", {}).get("user", {})
                        .get("edge_followed_by", {}).get("count"))
            if count is not None:
                print(f"[i.instagram] 팔로워: {count:,}")
                return int(count)
    except Exception as e:
        print(f"[i.instagram] 실패: {e}")
    return None

# ── 방법 3: 공개 GraphQL API ─────────────────────────────────
def fetch_via_graphql(session: requests.Session) -> int | None:
    url = (
        "https://www.instagram.com/graphql/query/"
        "?query_hash=c9100bf9110dd6361671f113dd02e7d"
        f"&variables=%7B%22user_id%22%3A%22{USERNAME}%22%2C%22include_reel%22%3Atrue%7D"
    )
    try:
        r = session.get(url, timeout=15)
        print(f"[GraphQL] HTTP {r.status_code}")
        if r.status_code == 200:
            m = re.search(r'"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)\}', r.text)
            if m:
                n = int(m.group(1))
                print(f"[GraphQL] 팔로워: {n:,}")
                return n
    except Exception as e:
        print(f"[GraphQL] 실패: {e}")
    return None

# ── 방법 4: 모바일 UA로 프로필 HTML 접근 ─────────────────────
def fetch_via_mobile_html(session: requests.Session) -> int | None:
    """
    모바일 UA를 사용하면 로그인 없이 프로필 접근 가능한 경우 있음
    """
    mobile_uas = [
        "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 "
        "Mobile/15E148 Safari/604.1",
    ]
    headers = {
        "User-Agent": random.choice(mobile_uas),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
    }
    try:
        # 먼저 instagram.com 방문해서 쿠키 획득
        session.get("https://www.instagram.com/", headers=headers, timeout=10)
        time.sleep(2)

        url = f"https://www.instagram.com/{USERNAME}/"
        r = session.get(url, headers=headers, timeout=20)
        print(f"[mobile HTML] HTTP {r.status_code}, 크기: {len(r.text):,}자")

        if r.status_code == 200:
            html = r.text
            # 로그인 페이지 감지
            if "Log in" in html and "edge_followed_by" not in html:
                print("[mobile HTML] 로그인 페이지 감지됨")
                return None

            patterns = [
                r'"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)\}',
                r'"followers_count"\s*:\s*(\d+)',
                r'([\d,]+)\s*[Ff]ollowers',
            ]
            for pat in patterns:
                m = re.search(pat, html)
                if m:
                    raw = m.group(1).replace(",", "")
                    if raw.isdigit():
                        n = int(raw)
                        if n > 1000:
                            print(f"[mobile HTML] 팔로워: {n:,}")
                            return n
    except Exception as e:
        print(f"[mobile HTML] 실패: {e}")
    return None

# ── 수집 메인 ────────────────────────────────────────────────
def fetch_followers() -> int | None:
    session = requests.Session()

    for method in [
        lambda: fetch_via_i_api(session),
        lambda: fetch_via_mobile_html(session),
        lambda: fetch_via_graphql(session),
    ]:
        result = method()
        if result is not None:
            return result
        time.sleep(random.uniform(2, 4))

    return None

# ── index.html 마커 교체 ─────────────────────────────────────
def update_index(formatted: dict) -> bool:
    if not INDEX_PATH.exists():
        print(f"[ERROR] {INDEX_PATH} 없음", file=sys.stderr)
        return False
    html     = INDEX_PATH.read_text(encoding="utf-8")
    original = html
    html     = html.replace("__FOLLOWERS_KO__", formatted["ko"])
    html     = html.replace("__FOLLOWERS_JA__", formatted["ja"])
    html     = html.replace("__FOLLOWERS_EN__", formatted["en"])
    if html == original:
        print("[WARN] 마커를 찾지 못했습니다.")
        return False
    INDEX_PATH.write_text(html, encoding="utf-8")
    print(f"[OK] 업데이트 완료: {formatted}")
    return True

# ── 메인 ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Instagram 팔로워 수 업데이트 시작 ===")
    count = fetch_followers()
    if count is None:
        print("[FAIL] 팔로워 수 수집 실패", file=sys.stderr)
        sys.exit(1)
    formatted = format_followers(count)
    print(f"포맷: {formatted}")
    success = update_index(formatted)
    sys.exit(0 if success else 1)
