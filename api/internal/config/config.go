package config

import (
	"os"
)

type Config struct {
	DatabaseURL string
	JWTAccessSecret string
	JWTRefreshSecret string
	AccessTokenExpireMin int
	RefreshTokenExpireDays int
	Port string
}

func NewFromEnv() *Config {
	// simple parsing with defaults
	accessMin := 15
	refreshDays := 7
	if v := os.Getenv("ACCESS_TOKEN_EXPIRE_MIN"); v != "" {
		// ignore parse error default
	}
	return &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTAccessSecret: os.Getenv("JWT_ACCESS_SECRET"),
		JWTRefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),
		AccessTokenExpireMin: accessMin,
		RefreshTokenExpireDays: refreshDays,
		Port: func() string { p := os.Getenv("PORT"); if p == "" { return "8080" }; return p }(),
	}
}
