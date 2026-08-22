@echo off
rem Registers JAS to start automatically at logon, as a scheduled task.
rem Run scripts\uninstall.cmd to undo.
setlocal

for %%D in ("%~dp0..") do set "JAS_DIR=%%~fD"

set "TASK_NAME=JAS"

echo JAS - installing...
if not exist "%JAS_DIR%\server\logs" mkdir "%JAS_DIR%\server\logs"

schtasks /create /tn "%TASK_NAME%" /tr "\"%JAS_DIR%\jas.cmd\"" /sc onlogon /f
if errorlevel 1 (
  echo JAS: could not register the scheduled task. 1>&2
  echo Try running this script from an Administrator command prompt. 1>&2
  goto :fail
)

echo JAS - COMPLETE. Registered scheduled task: %TASK_NAME%
echo - to check it, run: schtasks /query /tn "%TASK_NAME%"
echo - to start it now without logging out, run: schtasks /run /tn "%TASK_NAME%"
goto :end

:fail
echo %cmdcmdline% | find /i "%~nx0" > nul && pause
exit /b 1

:end
echo %cmdcmdline% | find /i "%~nx0" > nul && pause
exit /b 0
