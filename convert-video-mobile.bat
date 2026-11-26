@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo  Cinematic Portfolio Mobile Frame Converter (9:16)
echo  Converts any MP4 video into vertical 720x1280 WebP frames
echo ========================================================
echo.

set INPUT_FILE=%1

if "%INPUT_FILE%"=="" (
    echo [!] No video specified.
    set /p INPUT_FILE="Enter video filename (e.g. mobile_hero.mp4): "
)

if not exist "%INPUT_FILE%" (
    echo [ERROR] File not found: %INPUT_FILE%
    pause
    exit /b 1
)

if not exist "frames-mobile" (
    mkdir frames-mobile
)

echo [*] Extracting 9:16 Portrait frames from: %INPUT_FILE%
echo [*] Scaling to 720x1280 (9:16 Vertical), WebP format (Quality: 80)...
echo.

ffmpeg -y -i "%INPUT_FILE%" -vf "fps=240/10.533333,scale=720:1280:flags=lanczos" -frames:v 240 -c:v libwebp -quality 80 "frames-mobile\frame_%%04d.webp"

echo.
echo [DONE] 240 vertical mobile frames extracted into 'frames-mobile/' folder!
echo.
pause
