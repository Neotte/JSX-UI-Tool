@echo off
setlocal

cd /d "%~dp0" || goto fail_cd

set "NODE_HOME=%~dp0.tools\node"
if exist "%NODE_HOME%\node.exe" set "PATH=%NODE_HOME%;%PATH%"

where node.exe >nul 2>nul || goto fail_node
where npm.cmd >nul 2>nul || goto fail_npm

call npm.cmd install || goto fail_cmd
call npm.cmd run start || goto fail_cmd

pause
exit /b 0

:fail_cd
echo Failed to enter the project directory.
pause
exit /b 1

:fail_node
echo Node.js LTS is required.
echo Install Node.js or place portable Node at .tools\node.
pause
exit /b 1

:fail_npm
echo npm.cmd was not found.
echo Check your Node.js installation or .tools\node folder.
pause
exit /b 1

:fail_cmd
echo Command failed. Exit code: %errorlevel%
pause
exit /b %errorlevel%
