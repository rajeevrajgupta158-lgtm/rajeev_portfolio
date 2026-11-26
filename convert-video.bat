@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo  Cinematic Portfolio Frame Converter (Kohra Engine)
echo  Converts any MP4 video into optimized WebP frames
echo ========================================================
echo.

set INPUT_FILE=%1

if "%INPUT_FILE%"=="" (
    echo [!] No video specified.
    echo Drag and drop an MP4 video onto this .bat file, or
    set /p INPUT_FILE="Enter video filename (e.g. hero.mp4): "
)

if not exist "%INPUT_FILE%" (
    echo [ERROR] File not found: %INPUT_FILE%
    pause
    exit /b 1
)

if not exist "frames" (
    mkdir frames
)

echo [*] Extracting frames from: %INPUT_FILE%
echo [*] Scaling to 1080p Full HD (1920x1080), WebP format (Quality: 82)...
echo.

ffmpeg -i "%INPUT_FILE%" -an -vf "scale=1920:-2" -c:v libwebp -quality 82 "frames\frame_%%04d.webp"

echo.
echo [DONE] Frames have been extracted into the 'frames/' folder!
echo Now open index.html in your browser to see your scrollytelling in action.
echo.
pause
