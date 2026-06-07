# Run from D:\Projects\JobTracker\job-tracker\
Set-Location $PSScriptRoot

# Remove stale lock if present
$lock = ".git\index.lock"
if (Test-Path $lock) { Remove-Item $lock -Force; Write-Host "Removed stale lock" }

git add .
git commit -m "Initial commit: Vite + React + Firebase app tracker"
git push -u origin master
