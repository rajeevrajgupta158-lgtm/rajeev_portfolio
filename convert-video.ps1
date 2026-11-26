param (
    [string]$Video = "hero.mp4"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Cinematic Portfolio Frame Converter (Kohra Engine)     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path $Video)) {
    Write-Host "[!] Video file not found: $Video" -ForegroundColor Yellow
    Write-Host "Usage: .\convert-video.ps1 -Video 'path\to\your-video.mp4'" -ForegroundColor White
    exit
}

if (-not (Test-Path "frames")) {
    New-Item -ItemType Directory -Path "frames" | Out-Null
}

Write-Host "[*] Extracting Full HD 1080p WebP frames from: $Video..." -ForegroundColor Green
ffmpeg -i $Video -an -vf "scale=1920:-2" -c:v libwebp -quality 82 "frames\frame_%04d.webp"

$frameCount = (Get-ChildItem "frames\*.webp").Count
Write-Host "[+] Successfully generated $frameCount frames in the 'frames/' directory!" -ForegroundColor Green
Write-Host "[+] Open index.html in your browser or run a local server (npx serve / python -m http.server)." -ForegroundColor Cyan
