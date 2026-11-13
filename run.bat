@echo off
chcp 65001 > nul
echo ========================================================
echo   سنترال بلس - نظام نقاط البيع والمحافظ وإدارة المحل
echo   Telecom POS & Mobile Shop Management System
echo ========================================================
echo.
echo جارِ تشغيل خادم النظام وفتح المتصفح...
echo.
node server.js --open
pause
