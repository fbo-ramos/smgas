<#
Smoke test script para o ambiente SMGAS
- Executar da raiz do repo: powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root 'docker-compose.yml'))) {
    Write-Error "Não encontrei docker-compose.yml no diretório pai ($root). Execute o script a partir de 'smgas' ou mova-o para o local correto."
    exit 2
}

Write-Host "1) Build e subir containers (docker compose up -d --build)" -ForegroundColor Cyan
docker compose up -d --build

# wait for health
$timeout = 60
$wait = 0
Write-Host "Aguardando /healthz (até $timeout s)..." -ForegroundColor Cyan
while ($wait -lt $timeout) {
    try {
        $r = Invoke-RestMethod -Uri 'http://localhost:8080/healthz' -Method Get -TimeoutSec 2
        Write-Host "API pronta." -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 1
        $wait++
    }
}
if ($wait -ge $timeout) {
    Write-Host "API não ficou pronta em $timeout segundos. Exibindo logs..." -ForegroundColor Red
    docker compose logs api --tail=200
    docker compose logs db --tail=200
    exit 1
}

# login
Write-Host "2) Fazendo login com admin@smgas.local" -ForegroundColor Cyan
try {
    $login = Invoke-RestMethod -Uri 'http://localhost:8080/auth/login' -Method Post -Body (ConvertTo-Json @{email='admin@smgas.local'; password='Admin@123'}) -ContentType 'application/json' -TimeoutSec 10
    Write-Host "Login bem-sucedido. Tokens recebidos." -ForegroundColor Green
} catch {
    Write-Host "Login falhou:" -ForegroundColor Red; Write-Host $_.Exception.Message
    docker compose logs api --tail=200
    exit 1
}
$token = $login.access_token

# directorates
Write-Host "3) Listando directorates" -ForegroundColor Cyan
try { Invoke-RestMethod -Uri 'http://localhost:8080/directorates' -Method Get | ConvertTo-Json -Depth 5 } catch { Write-Host 'falha ao listar directorates'; exit 1 }

# kpis
Write-Host "4) KPIs da DPA (primeiros 5)" -ForegroundColor Cyan
try { (Invoke-RestMethod -Uri 'http://localhost:8080/kpis?directorate_code=DPA' -Method Get | Select-Object -First 5) | ConvertTo-Json -Depth 5 } catch { Write-Host 'falha ao listar KPIs'; exit 1 }

# upsert entry
Write-Host "5) Upsert entry (kpi_id=1)" -ForegroundColor Cyan
$body = @{kpi_id=1; year=2026; month=1; value=123.45; notes='Teste via smoke-test'} | ConvertTo-Json
try {
    $up = Invoke-RestMethod -Uri 'http://localhost:8080/entries' -Method Post -Headers @{ Authorization = "Bearer $token" } -Body $body -ContentType 'application/json' -TimeoutSec 10
    Write-Host "Upsert OK:"; $up | ConvertTo-Json
} catch {
    Write-Host "Upsert falhou:" -ForegroundColor Red; Write-Host $_.Exception.Message
    docker compose logs api --tail=200
    exit 1
}

# dashboard
Write-Host "6) Dashboard summary (2026/1)" -ForegroundColor Cyan
try { Invoke-RestMethod -Uri 'http://localhost:8080/dashboard/summary?year=2026&month=1' -Method Get | ConvertTo-Json -Depth 6 } catch { Write-Host 'falha ao obter dashboard'; exit 1 }

# DB check
Write-Host "7) Contagem de KPIs no DB" -ForegroundColor Cyan
try { docker compose exec db psql -U smgas -d smgas_db -c "SELECT count(*) FROM kpis;" } catch { Write-Host 'falha ao consultar DB'; exit 1 }

Write-Host "Smoke tests completos com sucesso ✅" -ForegroundColor Green
exit 0
