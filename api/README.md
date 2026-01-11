# API SMGAS

## Subir (Docker Compose)

1. Build e subir:

```bash
docker compose up -d --build
```

2. Ver logs

```bash
docker compose logs -f api
```

3. Variáveis de ambiente principais (definidas no `docker-compose.yml`):
- DATABASE_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- ACCESS_TOKEN_EXPIRE_MIN
- REFRESH_TOKEN_EXPIRE_DAYS

## Endpoints principais

- GET /healthz
- GET /readyz
- POST /auth/login {email,password} -> {access_token, refresh_token}
- POST /auth/refresh {refresh_token} -> {access_token}
- GET /me (Bearer)
- GET /directorates
- GET /kpis?directorate_code=DPA
- GET /targets?year=2026&directorate_code=DPA
- GET /entries?year=2026&month=1&directorate_code=DPA
- POST /entries (Bearer) {kpi_id,year,month,value,notes}
- GET /dashboard/summary?year=2026&month=1

## Seed

Ao subir pela primeira vez, a migration `999_seed.sql` cria diretorias, 70 KPIs e o usuário admin:

- email: `admin@smgas.local`
- senha: `Admin@123`

## Exemplos de curl

1) Login:

```bash
curl -s -X POST http://localhost:8080/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@smgas.local","password":"Admin@123"}'
```

2) Listar diretorias:

```bash
curl http://localhost:8080/directorates
```

3) Listar KPIs da DPA:

```bash
curl "http://localhost:8080/kpis?directorate_code=DPA"
```

4) Upsert entry (substitua ACCESS_TOKEN):

```bash
curl -X POST http://localhost:8080/entries -H "Authorization: Bearer ACCESS_TOKEN" -H 'Content-Type: application/json' -d '{"kpi_id":1,"year":2026,"month":1,"value":123.45,"notes":"Teste"}'
```

5) Dashboard summary:

```bash
curl "http://localhost:8080/dashboard/summary?year=2026&month=1"
```

## Observações
- CORS liberado para `http://localhost:5173` (frontend Vite).
- Senhas protegidas com bcrypt (via pgcrypto em seed). JWT secrets via env.
- Erros em PT-BR.
