@ECHO OFF
setlocal

REM ����� MTBmessenger �ࢥ� server.js 
REM V 1.00 - ��ࢠ� �ᯫ��樮���� �����.

REM==================================================
REM ��⠭���� ��६�����
SET RUNDIR=%~dp0
SET FILES_PATH=%RUNDIR%

REM==================================================
REM ����� MTBmessenger �ࢥ� server.js 
node server.js || (
ECHO %date% %time% - ERROR START server.js
pause
EXIT /B 1
)

EXIT /B 0