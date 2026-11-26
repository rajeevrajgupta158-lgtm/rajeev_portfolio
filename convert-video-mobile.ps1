param (
    [string]$Video = "raw_waterfall_mobile.mp4"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Cinematic Portfolio Mobile Frame Converter (9:16)      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path $Video)) {
    Write-Host "[!] Video file not found: $Video" -ForegroundColor Yellow
    Write-Host "Usage: .\convert-video-mobile.ps1 -Video 'path\to\your-mobile-video.mp4'" -ForegroundColor White
    exit
}

if (-not (Test-Path "frames-mobile")) {
    New-Item -ItemType Directory -Path "frames-mobile" | Out-Null
}

Write-Host "[*] Extracting 9:16 Vertical WebP frames from: $Video..." -ForegroundColor Green
ffmpeg -y -i $Video -vf "fps=240/10.533333,scale=720:1280:flags=lanczos" -frames:v 240 -c:v libwebp -quality 80 "frames-mobile\frame_%04d.webp"

$frameCount = (Get-ChildItem "frames-mobile\*.webp").Count
Write-Host "[+] Successfully generated $frameCount mobile portrait frames in 'frames-mobile/'!" -ForegroundColor Green
