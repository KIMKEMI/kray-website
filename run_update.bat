@echo off
cd /d "%~dp0"
python update_stats.py >> update_log.txt 2>&1
git add index.html
git commit -m "chore: update Instagram follower count [skip ci]"
git push
