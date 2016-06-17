@ECHO OFF
setlocal

REM ����� JAVA ������ MTBmessenger.jar 
REM V 1.00 - ��ࢠ� �ᯫ��樮���� �����.

REM==================================================
REM ��⠭���� ��६�����
SET RUNDIR=%~dp0
SET FILES_PATH=%RUNDIR%

REM==================================================
REM �஢�ઠ ������ java
java -version || (
ECHO %date% %time% - ERROR, JAVA NOT FOUND
pause
EXIT /B 1
)
ECHO %date% %time% - OK, JAVA INSTALLED

REM==================================================
REM ����� JAVA ������ MTBmessenger.jar 
REM start javaw -jar MTBmessenger.jar START server_ip_adress server_port client_group
start javaw -jar MTBmessenger.jar START 10.104.4.43 3005 test || (
ECHO %date% %time% - ERROR START MTBmessenger
pause
EXIT /B 1
)

EXIT /B 0