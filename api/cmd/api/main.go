package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/smgas/api/internal/auth"
	"github.com/smgas/api/internal/config"
	"github.com/smgas/api/internal/db"
	"github.com/smgas/api/internal/handlers"
)

func main() {
	cfg := config.NewFromEnv()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// aguardar DB resolvível e escutando
	if err := db.WaitForAddress(cfg.DatabaseURL, 60, 1*time.Second); err != nil {
		log.Fatalf("DB address unreachable: %v", err)
	}

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("erro ao conectar com banco: %v", err)
	}
	defer pool.Close()

	// aguardar DB pronto antes de migrar (verifica conexão via pool)
	if err := db.WaitForReady(ctx, pool, 30, 1*time.Second); err != nil {
		log.Fatalf("DB não ficou pronto: %v", err)
	}

	// run migrations
	if err := db.RunMigrations(pool, "/app/migrations"); err != nil {
		log.Fatalf("erro ao aplicar migrations: %v", err)
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{AllowOrigins: "http://localhost:5173", AllowHeaders: "Origin, Content-Type, Accept, Authorization"}))

	app.Get("/healthz", func(c *fiber.Ctx) error { return c.SendStatus(200) })
	app.Get("/readyz", func(c *fiber.Ctx) error { return c.SendStatus(200) })

	authSvc := auth.NewService(pool, cfg)
	h := handlers.NewHandler(pool, authSvc, cfg)

	// auth
	app.Post("/auth/login", h.Login)
	app.Post("/auth/refresh", h.Refresh)
	app.Get("/me", h.RequireAuth(h.Me))

	// resources
	app.Get("/directorates", h.GetDirectorates)
	app.Get("/kpis", h.GetKPIs)
	app.Get("/targets", h.GetTargets)
	app.Get("/entries", h.GetEntries)
	app.Post("/entries", h.RequireAuth(h.UpsertEntry))
	app.Get("/dashboard/summary", h.GetDashboardSummary)

	port := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("listening on %s", cfg.Port)
	log.Fatal(app.Listen(port))
}
