"""
update_stats.py
Instagram @sona_tokyolife 팔로워 수를 수집해
index.html 내 __FOLLOWERS_KO__ / __FOLLOWERS_JA__ / __FOLLOWERS_EN__ 마커를 교체합니다.

수집 방법 (순서대로 시도):
  1. Instagram web_profile_info API
  2. Instagram JSON 엔드포인트
  3. HTML 파싱
  실패 시 마커 교체하지 않음 (fallback 값이 화면에 표시됨)

실행: python update_stats.py
의존: requests
"""

import re
import sys
import time
import random
from pathlib import Path

try:
    import requests
except ImportError:
    print("[ERROR] requests 패키지가 없습니다. pip install requests", file=sys.stderr)
    sys.exit(1)

USERNAME   = "sona_tokyolife"
INDEX_PATH = Path(__file__).parent / "index.html"

UA_LIST = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
]


# ── 팔로워 수 포맷 변환 ──────────────────────────────────────
def format_followers(count: int) -> dict:
    if count >= 10_000:
        man     = count / 10_000
        man_str = f"{man:.1f}".rstrip("0").rstrip(".")
        return {"ko": f"{man_str}만", "ja": f"{man_str}万人", "en": f"{round(count/1000)}K"}
    return {"ko": f"{count:,}", "ja": f"{count:,}人", "en": f"{count:,}"}


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": random.choice(UA_LIST),
        "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    # 쿠키 초기화
    try:
        s.get("https://www.instagram.com/", timeout=10)
        time.sleep(1.5)
    except Exception:
        pass
    return s


# ── 방법 1: web_profile_info API ─────────────────────────────
def fetch_web_profile(s: requests.Session) -> int | None:
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
    try:
        r = s.get(url, timeout=15, headers={
            **dict(s.headers),
            "X-IG-App-ID": "936619743392459",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": f"https://www.instagram.com/{USERNAME}/",
        })
        if r.status_code == 200:
            data  = r.json()
            count = (data.get("data", {}).get("user", {})
                        .get("edge_followed_by", {}).get("count"))
            if count is not None:
                print(f"[web_profile_info] 팔로워: {count:,}")
                return int(count)
        print(f"[web_profile_info] HTTP {r.status_code}")
    except Exception as e:
        print(f"[web_profile_info] 실패: {e}")
    return None


# ── 방법 2: JSON 엔드포인트 ──────────────────────────────────
def fetch_json_api(s: requests.Session) -> int | None:
    url = f"https://www.instagram.com/{USERNAME}/?__a=1&__d=dis"
    try:
        r = s.get(url, timeout=15)
        if r.status_code == 200:
            data  = r.json()
            count = (data.get("graphql", {}).get("user", {})
                        .get("edge_followed_by", {}).get("count"))
            if count is not None:
                print(f"[JSON API] 팔로워: {count:,}")
                return int(count)
        print(f"[JSON API] HTTP {r.status_code}")
    except Exception as e:
        print(f"[JSON API] 실패: {e}")
    return None


# ── 방법 3: HTML 파싱 ─────────────────────────────────────────
def fetch_html(s: requests.Session) -> int | None:
    url = f"https://www.instagram.com/{USERNAME}/"
    try:
        time.sleep(random.uniform(1.5, 3.0))
        r = s.get(url, timeout=20)
        if r.status_code != 200:
            print(f"[HTML] HTTP {r.status_code}")
            return None
        html = r.text
        patterns = [
            r'"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)\}',
            r'"followers_count"\s*:\s*(\d+)',
        ]
        for pat in patterns:
            m = re.search(pat, html)
            if m:
                n = int(m.group(1))
                print(f"[HTML] 팔로워: {n:,}")
                return n
        print("[HTML] 팔로워 수 패턴 없음")
    except Exception as e:
        print(f"[HTML] 실패: {e}")
    return None


# ── 수집 ────────────────────────────────────────────────────
def fetch_followers() -> int | None:
    s = make_session()
    for method in [fetch_web_profile, fetch_json_api, fetch_html]:
        result = method(s)
        if result is not None:
            return result
        time.sleep(random.uniform(1.5, 3.0))
    return None


# ── index.html 마커 교체 ────────────────────────────────────
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


# ── 메인 ────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Instagram 팔로워 수 업데이트 시작 ===")
    count = fetch_followers()
    if count is None:
        print("[FAIL] 팔로워 수 수집 실패 — 마커를 교체하지 않습니다.", file=sys.stderr)
        sys.exit(1)
    formatted = format_followers(count)
    print(f"포맷: {formatted}")
    success = update_index(formatted)
    sys.exit(0 if success else 1)
