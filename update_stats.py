"""
update_stats.py
1. git pull (GitHub 최신 index.html 받기)
2. Instagram 팔로워 수 수집
3. index.html 업데이트
4. git push
"""

import re
import sys
import time
import subprocess
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("[ERROR] playwright not installed")
    sys.exit(1)

USERNAME   = "sona_tokyolife"
TARGET_URL = f"https://www.instagram.com/{USERNAME}/"
REPO_DIR   = Path(__file__).parent
INDEX_PATH = REPO_DIR / "index.html"


def format_followers(count: int) -> dict:
    if count >= 10_000:
        man = count / 10_000
        man_str = f"{man:.1f}".rstrip("0").rstrip(".")
        return {"ko": f"{man_str}\ub9cc", "ja": f"{man_str}\u4e07\u4eba", "en": f"{round(count/1000)}K"}
    return {"ko": f"{count:,}", "ja": f"{count:,}\u4eba", "en": f"{count:,}"}


def parse_count(text: str):
    text = text.strip().replace(",", "").replace(" ", "")
    for pat, mul in [(r"([\d.]+)[Mm]", 1_000_000), (r"([\d.]+)[Kk]", 1_000),
                     (r"([\d.]+)\u4e07", 10_000), (r"(\d+)", 1)]:
        m = re.match(pat, text)
        if m:
            val = int(float(m.group(1)) * mul)
            if val > 100:
                return val
    return None


# 토큰은 환경변수 또는 .env 파일에서 읽음
import os
# .env 파일에서 토큰 로드
_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())
_token = os.environ.get("GITHUB_TOKEN", "")
_base  = "https://github.com/KIMKEMI/kray-website.git"
GITHUB_REPO_URL = f"https://{_token}@github.com/KIMKEMI/kray-website.git" if _token else _base

def git_pull():
    result = subprocess.run(["git", "pull", GITHUB_REPO_URL, "main"],
                           cwd=REPO_DIR, capture_output=True, text=True)
    print(f"[git pull] {result.stdout.strip() or result.stderr.strip()}")


def fetch_followers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
            locale="ja-JP",
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.new_page()
        try:
            print(f"[Playwright] Accessing {TARGET_URL}")
            page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30_000)
            time.sleep(6)

            # 팝업 닫기
            for sel in ["[aria-label='Close']", "button:has-text('Not now')", 
                        "button:has-text('Later')", "button:has-text('나중에')",
                        "button:has-text('後で')", "._a9--._ap36._a9_1"]:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        print(f"[popup] closed: {sel}")
                        time.sleep(2)
                        break
                except Exception:
                    pass

            time.sleep(3)

            for li in page.locator("ul li").all():
                try:
                    text = li.inner_text()
                    if re.search(r"follower|フォロワー|팔로워", text, re.IGNORECASE):
                        nums = re.findall(r"[\d,.]+\s*[KkMm\u4e07]?", text)
                        for n in nums:
                            val = parse_count(n.strip())
                            if val and val > 1000:
                                print(f"[li] Followers: {val:,}")
                                return val
                except Exception:
                    pass

            # span에서 직접 찾기
            try:
                spans = page.locator("span").all()
                for span in spans:
                    try:
                        text = span.inner_text().strip()
                        if re.match(r"^[\d,.]+[KkMm]?$", text):
                            val = parse_count(text)
                            if val and 10000 < val < 10000000:
                                parent_text = span.locator("xpath=../..").inner_text()
                                if re.search(r"follower|フォロワー|팔로워", parent_text, re.IGNORECASE):
                                    print(f"[span] Followers: {val:,}")
                                    return val
                    except Exception:
                        pass
            except Exception:
                pass

            html = page.content()
            for pat in [r'"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)\}',
                        r'"followers_count"\s*:\s*(\d+)',
                        r'"follower_count"\s*:\s*(\d+)']:
                m = re.search(pat, html)
                if m:
                    val = int(m.group(1))
                    if val > 1000:
                        print(f"[JSON] Followers: {val:,}")
                        return val

            # 페이지 텍스트 전체 검색
            body = page.inner_text("body")
            for pat in [r"([\d,]+)\s*[Ff]ollowers", r"([\d,]+)\s*フォロワー", r"([\d,]+)\s*팔로워"]:
                m = re.search(pat, body)
                if m:
                    val = parse_count(m.group(1))
                    if val and val > 1000:
                        print(f"[body] Followers: {val:,}")
                        return val

            print("[WARN] Could not find follower count.")
            print(f"[DEBUG] title: {page.title()}")
            print(f"[DEBUG] url: {page.url}")
        except Exception as e:
            print(f"[ERROR] {e}", file=sys.stderr)
        finally:
            browser.close()
    return None


def update_index(formatted: dict) -> bool:
    if not INDEX_PATH.exists():
        print(f"[ERROR] index.html not found: {INDEX_PATH}")
        return False

    html = INDEX_PATH.read_text(encoding="utf-8")

    html = html.replace("__FOLLOWERS_KO__", formatted["ko"])
    html = html.replace("__FOLLOWERS_JA__", formatted["ja"])
    html = html.replace("__FOLLOWERS_EN__", formatted["en"])

    html = re.sub(r'(\{value:")([^"]+)(",label:"팔로워 수")',
                  lambda m: m.group(1) + formatted["ko"] + m.group(3), html)
    html = re.sub(r'(\{value:")([^"]+)(",label:"フォロワー数")',
                  lambda m: m.group(1) + formatted["ja"] + m.group(3), html)
    html = re.sub(r'(\{value:")([^"]+)(",label:"Followers")',
                  lambda m: m.group(1) + formatted["en"] + m.group(3), html)

    INDEX_PATH.write_text(html, encoding="utf-8")
    print(f"[OK] index.html updated: {formatted['en']}")
    return True


def git_push():
    # 파일 타임스탬프 강제 갱신 → git이 반드시 변경으로 감지
    INDEX_PATH.touch()
    for cmd in [["git", "add", "index.html"],
                ["git", "commit", "--allow-empty", "-m", "chore: update Instagram follower count [skip ci]"],
                ["git", "push", GITHUB_REPO_URL, "main"]]:
        result = subprocess.run(cmd, cwd=REPO_DIR, capture_output=True, text=True)
        out = result.stdout.strip() + result.stderr.strip()
        if result.returncode != 0:
            if "nothing to commit" in out:
                print("[git] Nothing to commit")
                return True
            print(f"[git] FAIL: {' '.join(cmd)}: {out}")
            return False
        print(f"[git] OK: {' '.join(cmd)}")
    return True


if __name__ == "__main__":
    print("=" * 50)
    print(" Instagram Follower Count Update")
    print("=" * 50)

    # 1. GitHub 최신 파일 받기
    git_pull()

    # 2. 팔로워 수 수집
    count = fetch_followers()
    if count is None:
        print("[FAIL] Could not fetch follower count")
        sys.exit(1)

    formatted = format_followers(count)
    print(f"[OK] Followers: {count:,} -> {formatted['en']}")

    # 3. index.html 업데이트
    update_index(formatted)

    # 4. push
    pushed = git_push()
    if pushed:
        print("[DONE] Successfully updated and pushed!")
    else:
        print("[WARN] Push failed")
    sys.exit(0 if pushed else 1)
