@echo off
rem Removes the logon task created by scripts\install.cmd. Project files are left
rem untouched.
setlocal

set "TASK_NAME=JAS"

echo uninstalling scheduled task: %TASK_NAME%
schtasks /end /tn "%TASK_NAME%" > nul 2>&1
schtasks /delete /tn "%TASK_NAME%" /f
if errorlevel 1 (
  echo JAS: could not remove the scheduled task ^(it may not be registered^). 1>&2
)

echo to install it again, run 'scripts\install.cmd'
echo %cmdcmdline% | find /i "%~nx0" > nul && pause
exit /b 0
