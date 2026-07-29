"""
update_stats.py
Instagram @sona_tokyolife 프로필 페이지에 Playwright로 접속해
스크린샷을 찍고, 팔로워 수 텍스트를 직접 파싱합니다.
로그인 불필요.
"""

import re
import sys
import time
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("[ERROR] playwright 없음. pip install playwright", file=sys.stderr)
    sys.exit(1)

USERNAME   = "sona_tokyolife"
TARGET_URL = f"https://www.instagram.com/{USERNAME}/"
INDEX_PATH = Path(__file__).parent / "index.html"


# ── 팔로워 수 포맷 변환 ──────────────────────────────────────
def format_followers(count: int) -> dict:
    if count >= 10_000:
        man     = count / 10_000
        man_str = f"{man:.1f}".rstrip("0").rstrip(".")
        return {"ko": f"{man_str}만", "ja": f"{man_str}万人", "en": f"{round(count/1000)}K"}
    return {"ko": f"{count:,}", "ja": f"{count:,}人", "en": f"{count:,}"}


# ── 팔로워 수 텍스트 → 정수 변환 ────────────────────────────
def parse_count(text: str) -> int | None:
    """
    '148K' / '14.8万' / '148,500' / '1.2M' 등을 정수로 변환
    """
    text = text.strip().replace(",", "").replace(" ", "")
    # M / million
    m = re.match(r"([\d.]+)\s*[Mm]", text)
    if m:
        return int(float(m.group(1)) * 1_000_000)
    # K / k
    m = re.match(r"([\d.]+)\s*[Kk]", text)
    if m:
        return int(float(m.group(1)) * 1_000)
    # 万
    m = re.match(r"([\d.]+)\s*万", text)
    if m:
        return int(float(m.group(1)) * 10_000)
    # 純数字
    m = re.match(r"(\d+)", text)
    if m:
        return int(m.group(1))
    return None


# ── Playwright でスクレイピング ──────────────────────────────
def fetch_followers() -> int | None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.new_page()

        try:
            print(f"[Playwright] {TARGET_URL} 접속 중...")
            page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30_000)
            time.sleep(3)

            # 팝업(로그인 권유) 닫기 시도
            for sel in ["[aria-label='Close']", "button:has-text('Not now')",
                        "button:has-text('나중에')", "button:has-text('後で')"]:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        print(f"[Playwright] 팝업 닫음: {sel}")
                        time.sleep(1)
                        break
                except Exception:
                    pass

            # 스크린샷 저장 (디버그용)
            page.screenshot(path="debug_instagram.png", full_page=False)
            print("[Playwright] 스크린샷 저장: debug_instagram.png")

            # ── 방법 1: li 안의 팔로워 수 span ──────────────────
            # Instagram 구조: <li><span><span>148K</span></span> followers</li>
            for li in page.locator("ul li").all():
                text = li.inner_text()
                if re.search(r"follower|フォロワー|팔로워", text, re.IGNORECASE):
                    # 숫자 부분만 추출
                    nums = re.findall(r"[\d,.]+\s*[KkMm万]?", text)
                    for n in nums:
                        val = parse_count(n)
                        if val and val > 100:
                            print(f"[li] 팔로워: {val:,}")
                            return val

            # ── 방법 2: meta description ──────────────────────────
            meta = page.locator('meta[name="description"]').get_attribute("content") or ""
            print(f"[meta] description: {meta[:120]}")
            m = re.search(
                r"([\d,\.]+\s*[KkMm万]?)\s*(Followers|フォロワー|팔로워)",
                meta, re.IGNORECASE
            )
            if m:
                val = parse_count(m.group(1))
                if val:
                    print(f"[meta] 팔로워: {val:,}")
                    return val

            # ── 방법 3: 페이지 전체 텍스트에서 패턴 검색 ──────────
            body = page.inner_text("body")
            patterns = [
                r"([\d,\.]+\s*[KkMm万]?)\s*[Ff]ollowers",
                r"([\d,\.]+\s*[KkMm万]?)\s*フォロワー",
                r"([\d,\.]+\s*[KkMm万]?)\s*팔로워",
            ]
            for pat in patterns:
                m = re.search(pat, body)
                if m:
                    val = parse_count(m.group(1))
                    if val and val > 100:
                        print(f"[body] 팔로워: {val:,}")
                        return val

            print("[Playwright] 팔로워 수를 찾지 못했습니다.")
            print("[body 앞 500자]", body[:500])

        except Exception as e:
            print(f"[ERROR] {e}", file=sys.stderr)
        finally:
            browser.close()

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
        print("[FAIL] 팔로워 수 수집 실패", file=sys.stderr)
        sys.exit(1)
    formatted = format_followers(count)
    print(f"포맷: {formatted}")
    success = update_index(formatted)
    sys.exit(0 if success else 1)
