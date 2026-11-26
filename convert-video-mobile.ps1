param (
    [string]$Video = "raw_waterfall.mp4"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Cinematic Portfolio Mobile Frame Converter (9:16)      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path $Video)) {
    Write-Host "[!] Video file not found: $Video" -ForegroundColor Yellow
    Write-Host "Usage: .\convert-video-mobile.ps1 -Video 'path\to\your-video.mp4'" -ForegroundColor White
    exit
}

if (-not (Test-Path "frames-mobile")) {
    New-Item -ItemType Directory -Path "frames-mobile" | Out-Null
}

Write-Host "[*] Extracting 9:16 Vertical WebP frames from: $Video..." -ForegroundColor Green
ffmpeg -y -ss 00:00:25.4 -t 3.2 -i $Video -vf "crop=919:1634:1460:263,scale=720:1280" -r 75 -frames:v 240 -c:v libwebp -quality 80 "frames-mobile\frame_%04d.webp"

$frameCount = (Get-ChildItem "frames-mobile\*.webp").Count
Write-Host "[+] Successfully generated $frameCount mobile portrait frames in 'frames-mobile/'!" -ForegroundColor Green
