"""
update_stats.py
Instagram @sona_tokyolife 팔로워 수를 Playwright로 수집해
index.html 내 __FOLLOWERS_KO__ / __FOLLOWERS_JA__ / __FOLLOWERS_EN__ 마커를 교체합니다.

실행: python update_stats.py
의존: playwright (chromium), python-dotenv (선택)
"""

import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

TARGET_URL  = "https://www.instagram.com/sona_tokyolife/"
INDEX_PATH  = Path(__file__).parent / "index.html"   # 루트의 index.html

# ── 팔로워 수 포맷 변환 ───────────────────────────────────────
def format_followers(count: int) -> dict:
    """
    정수 팔로워 수 → ko/ja/en 표시 문자열 반환
    예) 148000 → {'ko': '14.8만', 'ja': '14.8万人', 'en': '148K'}
    """
    if count >= 10_000:
        man = count / 10_000
        # 소수점 첫째 자리까지 (필요 없으면 버림)
        man_str = f"{man:.1f}".rstrip('0').rstrip('.')
        return {
            'ko': f"{man_str}만",
            'ja': f"{man_str}万人",
            'en': f"{round(count/1000)}K",
        }
    return {
        'ko': f"{count:,}",
        'ja': f"{count:,}人",
        'en': f"{count:,}",
    }

# ── Playwright로 팔로워 수 수집 ───────────────────────────────
def fetch_followers() -> int | None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="ja-JP",
        )
        page = ctx.new_page()
        try:
            page.goto(TARGET_URL, wait_until="networkidle", timeout=30_000)
            page.wait_for_timeout(3000)

            # ① meta 태그에서 수집 (가장 안정적)
            content = page.locator('meta[name="description"]').get_attribute("content") or ""
            m = re.search(r"([\d,\.]+)\s*(万|[Mm]illion|[Kk])?[\s]*(フォロワー|follower|Follower)", content)
            if m:
                raw = m.group(1).replace(",", "").replace(".", "")
                unit = m.group(2) or ""
                n = int(raw)
                if "万" in unit or unit.lower() == "m" or unit.lower() == "million":
                    n *= 10_000
                elif unit.lower() == "k":
                    n *= 1_000
                print(f"[meta] 팔로워: {n:,}")
                return n

            # ② 페이지 텍스트에서 수집 (fallback)
            text = page.inner_text("body")
            patterns = [
                r"([\d,]+(?:\.\d+)?)\s*万\s*(人?)?\s*(フォロワー|follower)",
                r"([\d,]+(?:\.\d+)?)\s*[Mm]illion\s*follower",
                r"([\d,]+)\s*follower",
            ]
            for pat in patterns:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    raw = m.group(1).replace(",", "")
                    n = float(raw)
                    if "万" in pat:
                        n = int(n * 10_000)
                    elif "illion" in pat:
                        n = int(n * 1_000_000)
                    else:
                        n = int(n)
                    print(f"[body] 팔로워: {n:,}")
                    return n

        except Exception as e:
            print(f"[ERROR] 수집 실패: {e}", file=sys.stderr)
        finally:
            browser.close()

    return None

# ── index.html 마커 교체 ─────────────────────────────────────
def update_index(formatted: dict) -> bool:
    if not INDEX_PATH.exists():
        print(f"[ERROR] {INDEX_PATH} 를 찾을 수 없습니다.", file=sys.stderr)
        return False

    html = INDEX_PATH.read_text(encoding="utf-8")
    original = html

    html = html.replace("__FOLLOWERS_KO__", formatted['ko'])
    html = html.replace("__FOLLOWERS_JA__", formatted['ja'])
    html = html.replace("__FOLLOWERS_EN__", formatted['en'])

    if html == original:
        print("[WARN] 마커를 찾지 못했습니다. index.html에 마커가 있는지 확인하세요.")
        return False

    INDEX_PATH.write_text(html, encoding="utf-8")
    print(f"[OK] index.html 업데이트 완료: {formatted}")
    return True

# ── 메인 ─────────────────────────────────────────────────────
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
