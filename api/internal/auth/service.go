package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smgas/api/internal/config"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	pool *pgxpool.Pool
	accessSecret string
	refreshSecret string
	accessExp time.Duration
	refreshExp time.Duration
}

func NewService(pool *pgxpool.Pool, cfg *config.Config) *Service {
	return &Service{pool: pool, accessSecret: cfg.JWTAccessSecret, refreshSecret: cfg.JWTRefreshSecret, accessExp: time.Duration(cfg.AccessTokenExpireMin) * time.Minute, refreshExp: time.Duration(cfg.RefreshTokenExpireDays) * 24 * time.Hour}
}

func HashPassword(pw string) (string, error) {
	h, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(h), err
}

func CheckPassword(hash, pw string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
}

func GenTokenString(b int) (string, error) {
	bb := make([]byte, b)
	if _, err := rand.Read(bb); err != nil {
		return "", err
	}
	return hex.EncodeToString(bb), nil
}

// Minimal JWT helpers used in handlers directly to avoid complex service for this MVP

var ErrInvalidCreds = errors.New("credenciais inválidas")
