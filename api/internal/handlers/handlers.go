package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/golang-jwt/jwt/v5"
	"github.com/smgas/api/internal/models"
	"github.com/smgas/api/internal/rbac"
	"github.com/smgas/api/internal/config"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	pool *pgxpool.Pool
	// minimal config
	accessSecret string
	refreshSecret string
	accessExp time.Duration
	refreshExp time.Duration
}

func NewHandler(pool *pgxpool.Pool, /*authSvc*/ _ interface{}, cfg *config.Config) *Handler {
	as := cfg.JWTAccessSecret
	rs := cfg.JWTRefreshSecret
	return &Handler{pool: pool, accessSecret: as, refreshSecret: rs, accessExp: time.Duration(cfg.AccessTokenExpireMin) * time.Minute, refreshExp: time.Duration(cfg.RefreshTokenExpireDays) * 24 * time.Hour}
}

func (h *Handler) RequireAuth(fn func(*fiber.Ctx, int64) error) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "token ausente")
		}
		var tokenStr string
		fmt.Sscanf(auth, "Bearer %s", &tokenStr)
		if tokenStr == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "token inválido")
		}
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(h.accessSecret), nil
		})
		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "token inválido")
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return fiber.NewError(fiber.StatusUnauthorized, "token inválido")
		}
		uidf := claims["user_id"]
		uid := int64(uidf.(float64))
		return fn(c, uid)
	}
}

// ---- Handlers ----
func (h *Handler) Login(c *fiber.Ctx) error {
	var body struct{ Email string `json:"email"`; Password string `json:"password"` }
	if err := c.BodyParser(&body); err != nil { return fiber.NewError(fiber.StatusBadRequest, "request inválido") }
	ctx := context.Background()
	var id int64; var hash string; var role string
	row := h.pool.QueryRow(ctx, `SELECT id, password_hash, role FROM users WHERE email=$1`, body.Email)
	if err := row.Scan(&id, &hash, &role); err != nil { return fiber.NewError(fiber.StatusUnauthorized, "credenciais inválidas") }
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)); err != nil { return fiber.NewError(fiber.StatusUnauthorized, "credenciais inválidas") }
	// create tokens
	access := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": id, "role": role, "exp": time.Now().Add(h.accessExp).Unix()})
	accessStr, _ := access.SignedString([]byte(h.accessSecret))
	refresh := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": id, "type": "refresh", "exp": time.Now().Add(h.refreshExp).Unix()})
	refreshStr, _ := refresh.SignedString([]byte(h.refreshSecret))
	// store refresh
	_, _ = h.pool.Exec(ctx, `INSERT INTO user_refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)`, id, refreshStr, time.Now().Add(h.refreshExp))
	return c.JSON(fiber.Map{"access_token": accessStr, "refresh_token": refreshStr})
}

func (h *Handler) Refresh(c *fiber.Ctx) error {
	var body struct{ RefreshToken string `json:"refresh_token"` }
	if err := c.BodyParser(&body); err != nil { return fiber.NewError(fiber.StatusBadRequest, "request inválido") }
	// verify token
	tkn, err := jwt.Parse(body.RefreshToken, func(t *jwt.Token) (interface{}, error) { return []byte(h.refreshSecret), nil })
	if err != nil || !tkn.Valid { return fiber.NewError(fiber.StatusUnauthorized, "refresh token inválido") }
	claims := tkn.Claims.(jwt.MapClaims)
	uid := int64(claims["user_id"].(float64))
	// check in db
	var exists bool
	err = h.pool.QueryRow(context.Background(), `SELECT EXISTS(SELECT 1 FROM user_refresh_tokens WHERE token=$1 AND user_id=$2 AND revoked=false AND expires_at>now())`, body.RefreshToken, uid).Scan(&exists)
	if err != nil || !exists { return fiber.NewError(fiber.StatusUnauthorized, "refresh token inválido") }
	// issue new access
	access := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": uid, "exp": time.Now().Add(h.accessExp).Unix()})
	accessStr, _ := access.SignedString([]byte(h.accessSecret))
	return c.JSON(fiber.Map{"access_token": accessStr})
}

func (h *Handler) Me(c *fiber.Ctx, userID int64) error {
	var u models.User
	row := h.pool.QueryRow(context.Background(), `SELECT id, email, role, created_at FROM users WHERE id=$1`, userID)
	if err := row.Scan(&u.ID, &u.Email, &u.Role, &u.CreatedAt); err != nil { return fiber.NewError(fiber.StatusNotFound, "usuário não encontrado") }
	return c.JSON(u)
}

func (h *Handler) GetDirectorates(c *fiber.Ctx) error {
	rows, err := h.pool.Query(context.Background(), `SELECT id, code, name FROM directorates ORDER BY code`)
	if err != nil { return fiber.NewError(fiber.StatusInternalServerError, "erro lendo diretorias") }
	defer rows.Close()
	var out []models.Directorate
	for rows.Next() {
		var d models.Directorate
		rows.Scan(&d.ID, &d.Code, &d.Name)
		out = append(out, d)
	}
	return c.JSON(out)
}

func (h *Handler) GetKPIs(c *fiber.Ctx) error {
	code := c.Query("directorate_code")
	if code == "" { return fiber.NewError(400, "directorate_code obrigatório") }
	var dirID int64
	if err := h.pool.QueryRow(context.Background(), `SELECT id FROM directorates WHERE code=$1`, code).Scan(&dirID); err != nil { return fiber.NewError(404, "diretoria não encontrada") }
	rows, err := h.pool.Query(context.Background(), `SELECT id, directorate_id, key, label, unit, polarity, suggested FROM kpis WHERE directorate_id=$1 ORDER BY id`, dirID)
	if err != nil { return fiber.NewError(500, "erro lendo KPIs") }
	defer rows.Close()
	var out []models.KPI
	for rows.Next() {
		var k models.KPI
		rows.Scan(&k.ID,&k.DirectorateID,&k.Key,&k.Label,&k.Unit,&k.Polarity,&k.Suggested)
		out = append(out,k)
	}
	return c.JSON(out)
}

func (h *Handler) GetTargets(c *fiber.Ctx) error {
	yearStr := c.Query("year")
	code := c.Query("directorate_code")
	if yearStr=="" || code=="" { return fiber.NewError(400, "year e directorate_code obrigatórios") }
	year, err := strconv.Atoi(yearStr); if err!=nil{ return fiber.NewError(400, "year inválido") }
	var dirID int64
	if err := h.pool.QueryRow(context.Background(), `SELECT id FROM directorates WHERE code=$1`, code).Scan(&dirID); err != nil { return fiber.NewError(404, "diretoria não encontrada") }
	rows, err := h.pool.Query(context.Background(), `SELECT t.id, t.kpi_id, t.year, t.annual_target, t.monthly_targets FROM targets t JOIN kpis k ON k.id=t.kpi_id WHERE t.year=$1 AND k.directorate_id=$2`, year, dirID)
	if err != nil { return fiber.NewError(500, "erro lendo metas") }
	defer rows.Close()
	var out []models.Target
	for rows.Next() {
		var t models.Target; var mtx []float64
		rows.Scan(&t.ID,&t.KpiID,&t.Year,&t.AnnualTarget,&mtx)
		t.MonthlyTargets = mtx
		out = append(out,t)
	}
	return c.JSON(out)
}

func (h *Handler) GetEntries(c *fiber.Ctx) error {
	yearStr := c.Query("year"); monthStr := c.Query("month"); code := c.Query("directorate_code")
	if yearStr=="" || monthStr=="" || code=="" { return fiber.NewError(400, "year, month e directorate_code obrigatórios") }
	year, _ := strconv.Atoi(yearStr); month, _ := strconv.Atoi(monthStr)
	if month<1 || month>12 { return fiber.NewError(400, "month deve ser 1..12") }
	var dirID int64
	if err := h.pool.QueryRow(context.Background(), `SELECT id FROM directorates WHERE code=$1`, code).Scan(&dirID); err != nil { return fiber.NewError(404, "diretoria não encontrada") }
	rows, err := h.pool.Query(context.Background(), `SELECT e.id, e.kpi_id, e.year, e.month, e.value, e.notes, e.created_by, e.created_at FROM period_entries e JOIN kpis k ON k.id=e.kpi_id WHERE e.year=$1 AND e.month=$2 AND k.directorate_id=$3`, year, month, dirID)
	if err != nil { return fiber.NewError(500, "erro lendo entradas") }
	defer rows.Close()
	var out []models.Entry
	for rows.Next() {
		var ee models.Entry
		rows.Scan(&ee.ID,&ee.KpiID,&ee.Year,&ee.Month,&ee.Value,&ee.Notes,&ee.CreatedBy,&ee.CreatedAt)
		out = append(out, ee)
	}
	return c.JSON(out)
}

func (h *Handler) UpsertEntry(c *fiber.Ctx, userID int64) error {
	var body struct{ KpiID int64 `json:"kpi_id"`; Year int `json:"year"`; Month int `json:"month"`; Value float64 `json:"value"`; Notes string `json:"notes"` }
	if err := c.BodyParser(&body); err!=nil { return fiber.NewError(400, "request inválido") }
	if body.Month<1 || body.Month>12 { return fiber.NewError(400, "month deve ser 1..12") }
	ctx := context.Background()
	// find kpi directorate
	var dirID int64
	if err := h.pool.QueryRow(ctx, `SELECT directorate_id FROM kpis WHERE id=$1`, body.KpiID).Scan(&dirID); err!=nil { return fiber.NewError(404, "kpi não encontrado") }
	// check role or permissions
	var role string
	h.pool.QueryRow(ctx, `SELECT role FROM users WHERE id=$1`, userID).Scan(&role)
	if role!="ADMIN" && role!="MANAGER" {
		can, err := rbac.CanEditDirectorate(ctx, h.pool, userID, dirID)
		if err!=nil || !can { return fiber.NewError(403, "permissão negada") }
	}
	// upsert
	_, err := h.pool.Exec(ctx, `INSERT INTO period_entries (kpi_id, year, month, value, notes, created_by, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,now(),now()) ON CONFLICT (kpi_id, year, month) DO UPDATE SET value=EXCLUDED.value, notes=EXCLUDED.notes, updated_at=now()`, body.KpiID, body.Year, body.Month, body.Value, body.Notes, userID)
	if err!=nil { return fiber.NewError(500, "erro ao gravar entrada") }
	return c.JSON(fiber.Map{"ok": true})
}

func (h *Handler) GetDashboardSummary(c *fiber.Ctx) error {
	yearStr := c.Query("year"); monthStr := c.Query("month")
	if yearStr=="" || monthStr=="" { return fiber.NewError(400, "year e month obrigatórios") }
	year, _ := strconv.Atoi(yearStr); month, _ := strconv.Atoi(monthStr)
	if month<1 || month>12 { return fiber.NewError(400, "month deve ser 1..12") }
	ctx := context.Background()
	// For each directorate: count kpis, compute % green/yellow/red, top3 positive/negative changes and observations
	rows, err := h.pool.Query(ctx, `SELECT d.id, d.code, d.name FROM directorates d ORDER BY d.code`)
	if err!=nil { return fiber.NewError(500, "erro lendo diretorias") }
	defer rows.Close()
	out := []interface{}{}
	for rows.Next() {
		var id int64; var code, name string
		rows.Scan(&id,&code,&name)
		// aggregate kpis count
		var total int
		h.pool.QueryRow(ctx, `SELECT count(*) FROM kpis WHERE directorate_id=$1`, id).Scan(&total)
		// compute colors: join entries with targets
		r2, _ := h.pool.Query(ctx, `SELECT k.id, t.monthly_targets, e.value, k.polarity FROM kpis k LEFT JOIN targets t ON t.kpi_id=k.id AND t.year=$1 LEFT JOIN period_entries e ON e.kpi_id=k.id AND e.year=$1 AND e.month=$2 WHERE k.directorate_id=$3`, year, month, id)
		defer r2.Close()
		tot := 0; green:=0; yellow:=0; red:=0
		for r2.Next() {
			var kpiID int64; var mtargets []float64; var val *float64; var polarity string
			r2.Scan(&kpiID, &mtargets, &val, &polarity)
			if val==nil { continue }
			var monthlyTarget float64
			if len(mtargets)>=month { monthlyTarget = mtargets[month-1] }
			status := determineTraffic(val, monthlyTarget, polarity)
			tot++
			switch status {
			case "green": green++
			case "yellow": yellow++
			case "red": red++
			}
		}
		out = append(out, fiber.Map{"directorate_code": code, "directorate_name": name, "total_kpis": total, "evaluated": tot, "green": green, "yellow": yellow, "red": red})
	}
	return c.JSON(out)
}

func determineTraffic(val *float64, monthlyTarget float64, polarity string) string {
	if val==nil { return "yellow" }
	actual := *val
	if monthlyTarget==0 {
		if actual>0 {
			if polarity=="HIGHER_IS_BETTER" { return "green" }
			return "red"
		}
		return "yellow"
	}
	pct := (actual - monthlyTarget) / monthlyTarget * 100.0
	if pct >= 5.0 { if polarity=="LOWER_IS_BETTER" { return "red" }; return "green" }
	if pct < -5.0 { if polarity=="LOWER_IS_BETTER" { return "green" }; return "red" }
	return "yellow"
}
