"""
update_stats.py
Instagram @sona_tokyolife 팔로워 수를 수집해
index.html 의 __FOLLOWERS_KO__ / __FOLLOWERS_JA__ / __FOLLOWERS_EN__ 마커를 교체합니다.

[로컬 PC에서 실행]
  1. 이 파일이 있는 폴더에서 터미널(명령 프롬프트) 열기
  2. pip install requests playwright
  3. playwright install chromium
  4. python update_stats.py
  5. index.html 변경 확인 후 GitHub Desktop으로 Push
"""

import re
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
import time
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("[ERROR] playwright 없음. 아래 명령어를 실행하세요:")
    print("  pip install playwright")
    print("  playwright install chromium")
    sys.exit(1)

USERNAME   = "sona_tokyolife"
TARGET_URL = f"https://www.instagram.com/{USERNAME}/"
INDEX_PATH = Path(__file__).parent / "index.html"


# ── 팔로워 수 Format 변환 ──────────────────────────────────────
def format_followers(count: int) -> dict:
    if count >= 10_000:
        man     = count / 10_000
        man_str = f"{man:.1f}".rstrip("0").rstrip(".")
        return {"ko": f"{man_str}만", "ja": f"{man_str}万人", "en": f"{round(count/1000)}K"}
    return {"ko": f"{count:,}", "ja": f"{count:,}人", "en": f"{count:,}"}


# ── 팔로워 수 텍스트 파싱 ────────────────────────────────────
def parse_count(text: str) -> int | None:
    text = text.strip().replace(",", "").replace(" ", "")
    for pat, mul in [
        (r"([\d.]+)[Mm]",  1_000_000),
        (r"([\d.]+)[Kk]",  1_000),
        (r"([\d.]+)万",    10_000),
        (r"(\d+)",         1),
    ]:
        m = re.match(pat, text)
        if m:
            val = int(float(m.group(1)) * mul)
            if val > 100:
                return val
    return None


# ── Playwright로 팔로워 수 수집 ──────────────────────────────
def fetch_followers() -> int | None:
    with sync_playwright() as p:
        # headless=True: 백그라운드(스케줄러) 실행 가능
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="ja-JP",
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.new_page()
        try:
            print(f"[Playwright] {TARGET_URL} 접속 중...")
            page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30_000)
            time.sleep(4)

            # 팝업 닫기 시도
            for sel in [
                "[aria-label='Close']",
                "button:has-text('Not now')",
                "button:has-text('나중에')",
                "button:has-text('後で')",
                "button:has-text('닫기')",
            ]:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=1500):
                        btn.click()
                        print(f"[popup] closed: {sel}")
                        time.sleep(1)
                        break
                except Exception:
                    pass

            # ── 방법 1: <li> 팔로워 항목 ───────────────────────
            for li in page.locator("ul li").all():
                try:
                    text = li.inner_text()
                    if re.search(r"follower|フォロワー|팔로워", text, re.IGNORECASE):
                        nums = re.findall(r"[\d,.]+\s*[KkMm万]?", text)
                        for n in nums:
                            val = parse_count(n.strip())
                            if val and val > 1000:
                                print(f"[li] 팔로워: {val:,}")
                                return val
                except Exception:
                    pass

            # ── 방법 2: meta description ────────────────────────
            meta = page.locator('meta[name="description"]').get_attribute("content") or ""
            print(f"[meta] {meta[:120]}")
            m = re.search(
                r"([\d,\.]+\s*[KkMm万]?)\s*(Followers|フォロワー|팔로워)",
                meta, re.IGNORECASE
            )
            if m:
                val = parse_count(m.group(1))
                if val:
                    print(f"[meta] 팔로워: {val:,}")
                    return val

            # ── 방법 3: 페이지 소스에서 JSON 추출 ──────────────
            html = page.content()
            for pat in [
                r'"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)\}',
                r'"followers_count"\s*:\s*(\d+)',
            ]:
                m = re.search(pat, html)
                if m:
                    val = int(m.group(1))
                    if val > 1000:
                        print(f"[JSON] 팔로워: {val:,}")
                        return val

            # ── 방법 4: 페이지 텍스트 ───────────────────────────
            body = page.inner_text("body")
            for pat in [
                r"([\d,\.]+\s*[KkMm万]?)\s*[Ff]ollowers",
                r"([\d,\.]+\s*[KkMm万]?)\s*フォロワー",
                r"([\d,\.]+\s*[KkMm万]?)\s*팔로워",
            ]:
                m = re.search(pat, body)
                if m:
                    val = parse_count(m.group(1))
                    if val and val > 1000:
                        print(f"[body] 팔로워: {val:,}")
                        return val

            print("[WARN] Could not find follower count.")
            print("  -> Check if Instagram profile is accessible in browser.")

        except Exception as e:
            print(f"[ERROR] {e}", file=sys.stderr)
        finally:
            browser.close()

    return None


# ── index.html 팔로워 수 교체 ─────────────────────────────────
def update_index(formatted: dict) -> bool:
    if not INDEX_PATH.exists():
        print(f"[ERROR] index.html not found: {INDEX_PATH}")
        print("  -> Run this script inside the kray-website folder.")
        return False

    html     = INDEX_PATH.read_text(encoding="utf-8")
    original = html

    # ── 방법 1: __FOLLOWERS_XX__ 마커 교체 ─────────────────
    html = html.replace("__FOLLOWERS_KO__", formatted["ko"])
    html = html.replace("__FOLLOWERS_JA__", formatted["ja"])
    html = html.replace("__FOLLOWERS_EN__", formatted["en"])

    # ── 방법 2: stats 배열의 value 값 직접 교체 ─────────────
    # {value:"XX만",label:"팔로워 수",...}  → 새 값으로
    import re
    html = re.sub(
        r'(\{value:")([^"]+)(",label:"팔로워 수")',
        lambda m: m.group(1) + formatted["ko"] + m.group(3),
        html
    )
    html = re.sub(
        r'(\{value:")([^"]+)(",label:"フォロワー数")',
        lambda m: m.group(1) + formatted["ja"] + m.group(3),
        html
    )
    html = re.sub(
        r'(\{value:")([^"]+)(",label:"Followers")',
        lambda m: m.group(1) + formatted["en"] + m.group(3),
        html
    )

    # ── FOLLOWERS_FALLBACK도 최신값으로 ─────────────────────
    html = re.sub(
        r"(const FOLLOWERS_FALLBACK = \{ ko: ')[^']+(' , ja: ')[^']+(' , en: ')[^']+(' \};)",
        lambda m: f"{m.group(1)}{formatted['ko']}{m.group(2)}{formatted['ja']}{m.group(3)}{formatted['en']}{m.group(4)}",
        html
    )
    # 공백 차이 대응
    html = re.sub(
        r"(const FOLLOWERS_FALLBACK = \{ ko: ')[^']+(',\s*ja: ')[^']+(',\s*en: ')[^']+(' \};)",
        lambda m: f"{m.group(1)}{formatted['ko']}{m.group(2)}{formatted['ja']}{m.group(3)}{formatted['en']}{m.group(4)}",
        html
    )

    if html == original:
        print("[WARN] No changes detected.")
        return False

    INDEX_PATH.write_text(html, encoding="utf-8")
    print(f"[OK] index.html 업데이트 완료!")
    print(f"[OK] Updated: {formatted['en']}")
    return True


# ── 메인 ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print(" Instagram Follower Count Update")
    print("=" * 50)

    count = fetch_followers()
    if count is None:
        print("\n[FAIL] Failed to fetch follower count")
        sys.exit(1)

    formatted = format_followers(count)
    print(f"\nFollowers collected: {count:,}")
    print(f"Format: ko={formatted['ko']} / ja={formatted['ja']} / en={formatted['en']}")

    updated = update_index(formatted)
    if not updated:
        print("\n[INFO] index.html - already up to date")
        sys.exit(0)

    print("\n[git] Pushing to GitHub...")
    pushed = git_push()
    if pushed:
        print("\n[DONE] Follower count updated and pushed!")
    else:
        print("\n[WARN] Push failed. Please push manually.")
    sys.exit(0 if pushed else 1)


# ── Git Push ─────────────────────────────────────────────────
def git_push() -> bool:
    import subprocess
    repo_dir = INDEX_PATH.parent

    cmds = [
        ["git", "add", "index.html"],
        ["git", "commit", "-m", "chore: update Instagram follower count [skip ci]"],
        ["git", "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, cwd=repo_dir, capture_output=True, text=True)
        if result.returncode != 0:
            # commit 실패는 "nothing to commit" 일 수 있으므로 무시
            if "nothing to commit" in result.stdout + result.stderr:
                print("[git] No changes - skip push")
                return True
            print(f"[git] {' '.join(cmd)} 실패: {result.stderr.strip()}")
            return False
        print(f"[git] {' '.join(cmd)} ✅")
    return True
