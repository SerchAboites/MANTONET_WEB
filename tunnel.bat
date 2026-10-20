@echo off
title Cloudflare Tunnel - Live Server
echo Iniciando tunel en http://localhost:5500...
echo.
cloudflared tunnel --url http://localhost:5500
pause