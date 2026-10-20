$logPath = "$PSScriptRoot\cloudflared_remote.log"
if (Test-Path $logPath) { Remove-Item $logPath -Force }

# 1. Detener instancias colgadas previas de cloudflared
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Asegurar que haya un servidor web sirviendo los archivos HTML (puerto 5500)
$puertoActivo = Test-NetConnection -ComputerName 127.0.0.1 -Port 5500 -InformationLevel Quiet
if (-not $puertoActivo) {
    # Si VS Code no está abierto, se levanta el servidor ligero de Python en segundo plano
    Start-Process -FilePath "python" -ArgumentList "-m http.server 5500" -WorkingDirectory $PSScriptRoot -NoNewWindow
    Start-Sleep -Seconds 1
}

# 3. Lanzar cloudflared capturando logs en segundo plano
Start-Process -FilePath "cloudflared" `
              -ArgumentList "tunnel --url http://localhost:5500" `
              -RedirectStandardError $logPath `
              -NoNewWindow

# 4. Espera activa hasta por 15 segundos para capturar la URL
$url = $null
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logPath) {
        $match = Select-String -Path $logPath -Pattern "https://[a-zA-Z0-9-]+\.trycloudflare\.com"
        if ($match) {
            $url = $match | ForEach-Object { $_.Matches.Value } | Select-Object -First 1
            break
        }
    }
}

# 5. Salida del enlace público
if ($url) {
    Write-Output "URL_PUBLICA: $url"
} else {
    Write-Output "ERROR: No se pudo obtener la URL a tiempo."
}