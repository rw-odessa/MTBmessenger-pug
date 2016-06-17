@ECHO OFF
setlocal

REM Запуск MTBmessenger сервера server.js 
REM V 1.00 - Первая эксплуатационная версия.

REM==================================================
REM Установка переменных
SET RUNDIR=%~dp0
SET FILES_PATH=%RUNDIR%

REM==================================================
REM Запуск MTBmessenger сервера server.js 
node server.js || (
ECHO %date% %time% - ERROR START server.js
pause
EXIT /B 1
)

EXIT /B 0