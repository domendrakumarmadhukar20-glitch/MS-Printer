@echo off
TITLE MS PRINTERS — Any Time Print (ATP) Fullscreen Kiosk Launcher
COLOR 0B

echo Starting MS PRINTERS Hardware Print Service and Kiosk Screen...

cd /d "C:\MSPrintersKiosk"

:: 1. Launch Python Background Print Spooler Agent if Python is available
where python >nul 2>&1
if %errorLevel% EQU 0 (
    echo [1/2] Starting Background HP M126nw Spooler Agent...
    start /min "MS_PRINTERS_SPOOLER" python atp_agent.py
) else (
    echo [1/2] Python not detected in PATH. Kiosk will run in Web-Cloud Spool mode.
)

:: 2. Launch Microsoft Edge or Google Chrome in Lockdown Kiosk Mode
set KIOSK_URL=https://msprinter.in/kiosk?mode=kiosk&machine=ATP-ABC-001

echo [2/2] Launching Fullscreen Kiosk at %KIOSK_URL%...

:: Check Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --kiosk "%KIOSK_URL%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --overscroll-history-navigation=0 --kiosk-printing
    exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --kiosk "%KIOSK_URL%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --overscroll-history-navigation=0 --kiosk-printing
    exit /b 0
)

:: Fallback to Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk "%KIOSK_URL%" --incognito --disable-pinch --kiosk-printing
    exit /b 0
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --kiosk "%KIOSK_URL%" --incognito --disable-pinch --kiosk-printing
    exit /b 0
)

:: Default browser fallback
start "" "%KIOSK_URL%"
exit /b 0
