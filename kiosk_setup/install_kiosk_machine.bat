@echo off
TITLE MS PRINTERS — 24/7 Any Time Print (ATP) Kiosk Machine Installer
COLOR 0A

echo ===============================================================================
echo        MS PRINTERS — ANY TIME PRINT (ATP) HARDWARE KIOSK INSTALLER
echo                 HP LaserJet Pro MFP M126nw + Windows 10/11
echo                          Target: msprinter.in
echo ===============================================================================
echo.

:: Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] Please right-click this file and select 'Run as Administrator'!
    echo kripya is file par right-click karke 'Run as administrator' chune!
    pause
    exit /b 1
)

echo [1/6] Creating Kiosk Root Directory at C:\MSPrintersKiosk...
if not exist "C:\MSPrintersKiosk" mkdir "C:\MSPrintersKiosk"
if not exist "C:\MSPrintersKiosk\spool" mkdir "C:\MSPrintersKiosk\spool"
if not exist "C:\MSPrintersKiosk\logs" mkdir "C:\MSPrintersKiosk\logs"

echo [2/6] Copying Kiosk runtime scripts and configuration...
copy /Y "%~dp0launch_kiosk.bat" "C:\MSPrintersKiosk\" >nul
copy /Y "%~dp0atp_agent.py" "C:\MSPrintersKiosk\" >nul
copy /Y "%~dp0kiosk_config.json" "C:\MSPrintersKiosk\" >nul

echo [3/6] Configuring Windows Power Settings (Disabling Sleep & Screen Turn-off)...
powercfg -change -standby-timeout-ac 0
powercfg -change -monitor-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0
echo       [OK] Machine will now run 24/7 uninterrupted without sleeping.

echo [4/6] Checking for HP LaserJet Pro MFP M126nw Printer Driver...
powershell -Command "Get-Printer | Select-Object Name" | findstr /I "M126" >nul
if %errorLevel% EQU 0 (
    echo       [OK] HP LaserJet M126nw printer detected!
) else (
    echo       [WARNING] HP LaserJet Pro MFP M126nw driver not found yet.
    echo       Ensure the HP printer is connected via USB and drivers are installed.
)

echo [5/6] Adding Kiosk Auto-Start to Windows Startup Folder...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
copy /Y "%~dp0launch_kiosk.bat" "%STARTUP_FOLDER%\MSPrinters_Kiosk_Autostart.bat" >nul
echo       [OK] Kiosk will automatically launch in Fullscreen whenever PC turns ON.

echo [6/6] Creating Desktop Shortcut...
set SCRIPT="%TEMP%\%RANDOM%_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Desktop\Launch MS PRINTERS Kiosk.lnk") >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "C:\MSPrintersKiosk\launch_kiosk.bat" >> %SCRIPT%
echo oLink.Description = "MS PRINTERS 24/7 Fullscreen Kiosk Launcher" >> %SCRIPT%
echo oLink.WorkingDirectory = "C:\MSPrintersKiosk" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo ===============================================================================
echo                 KIOSK INSTALLATION COMPLETED SUCCESSFULLY!
echo ===============================================================================
echo.
echo 1. Desktop par 'Launch MS PRINTERS Kiosk' shortcut ban gaya hai.
echo 2. Computer restart hone par kiosk apne aap Fullscreen me khulega.
echo 3. Machine URL: https://msprinter.in/kiosk
echo.
set /p RUNNOW="Kya aap abhi Kiosk Screen launch karna chahte hain? (Y/N): "
if /I "%RUNNOW%"=="Y" (
    start "" "C:\MSPrintersKiosk\launch_kiosk.bat"
)
pause
exit /b 0
