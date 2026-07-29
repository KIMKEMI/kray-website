# Instagram 팔로워 수 자동 업데이트 — 매일 새벽 4시 스케줄러 등록
# PowerShell을 관리자 권한으로 실행 후 이 스크립트를 실행하세요.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonExe = (Get-Command python).Source
$ScriptPath = Join-Path $ScriptDir "update_stats.py"
$LogPath    = Join-Path $ScriptDir "update_log.txt"

# 실행할 명령
$Action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$ScriptPath`"" `
    -WorkingDirectory $ScriptDir

# 매일 새벽 4시
$Trigger = New-ScheduledTaskTrigger -Daily -At "04:00AM"

# PC가 꺼져 있으면 다음 번에 실행
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

# 등록
Register-ScheduledTask `
    -TaskName "KrayInstagramFollowerUpdate" `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "매일 새벽 4시 Instagram 팔로워 수를 업데이트하고 GitHub에 Push합니다." `
    -Force

Write-Host ""
Write-Host "✅ 스케줄러 등록 완료!" -ForegroundColor Green
Write-Host "   매일 새벽 4시에 자동으로 팔로워 수를 업데이트합니다."
Write-Host ""
Write-Host "확인: 작업 스케줄러 → KrayInstagramFollowerUpdate"
