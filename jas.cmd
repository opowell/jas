@echo off
rem JAS launcher for Windows.
rem
rem Finds a Node runtime, in order of preference:
rem   1. a Node bundled under server\node (as shipped in the release archives)
rem   2. %JAS_NODE%, if set
rem   3. the `node` on PATH
rem Then installs dependencies if they are missing, and starts the server.
setlocal

set "REQUIRED_NODE_MAJOR=20"

set "JAS_HOME=%~dp0"
if "%JAS_HOME:~-1%"=="\" set "JAS_HOME=%JAS_HOME:~0,-1%"
cd /d "%JAS_HOME%"

echo JAS -- Javascript App Server -- starting

set "ARCH=x64"
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "ARCH=arm64"

set "NODE_BIN="
set "NPM_BIN=npm"
for /d %%D in ("%JAS_HOME%\server\node\*-win-%ARCH%") do (
  if not defined NODE_BIN if exist "%%~fD\node.exe" (
    set "NODE_BIN=%%~fD\node.exe"
    set "NPM_BIN=%%~fD\npm.cmd"
  )
)

if not defined NODE_BIN if defined JAS_NODE set "NODE_BIN=%JAS_NODE%"
if not defined NODE_BIN (
  for /f "delims=" %%N in ('where node 2^>nul') do (
    if not defined NODE_BIN set "NODE_BIN=%%~fN"
  )
)
if not defined NODE_BIN (
  echo JAS: no Node.js runtime found. 1>&2
  echo Install Node.js %REQUIRED_NODE_MAJOR% or later ^(https://nodejs.org^), or download a 1>&2
  echo JAS release archive for win-%ARCH%, which bundles one. 1>&2
  goto :fail
)

set "NODE_MAJOR=0"
for /f "delims=" %%V in ('""%NODE_BIN%" -p "process.versions.node.split('.')[0]"" 2^>nul') do set "NODE_MAJOR=%%V"
if %NODE_MAJOR% LSS %REQUIRED_NODE_MAJOR% (
  echo JAS: Node.js %REQUIRED_NODE_MAJOR% or later is required ^(found major version %NODE_MAJOR%^). 1>&2
  goto :fail
)

rem Releases and the git checkout both ship node_modules, so this only runs for
rem an incomplete copy of the project.
if not exist "%JAS_HOME%\node_modules" (
  echo JAS -- dependencies missing, running npm install
  call "%NPM_BIN%" install --omit=dev --no-audit --no-fund
  if errorlevel 1 (
    echo JAS: npm install failed. Install dependencies manually with 'npm install'. 1>&2
    goto :fail
  )
)

"%NODE_BIN%" "%JAS_HOME%\server\jas.js" %*
exit /b %errorlevel%

:fail
rem Keep the window open long enough to read the error when double-clicked.
echo %cmdcmdline% | find /i "%~nx0" > nul && pause
exit /b 1
