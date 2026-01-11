package db

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	config.MaxConns = 10
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}
	return pool, nil
}

// RunMigrations finds SQL files in dir and runs them in alphabetical order
func RunMigrations(pool *pgxpool.Pool, dir string) error {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		return err
	}
	var names []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".sql") {
			names = append(names, f.Name())
		}
	}
	sort.Strings(names)
	ctx := context.Background()
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	for _, name := range names {
		full := filepath.Join(dir, name)
		log.Printf("applying migration %s", name)
		b, err := os.ReadFile(full)
		if err != nil {
			return err
		}
		sql := string(b)
		if _, err := conn.Exec(ctx, sql); err != nil {
			return fmt.Errorf("migration %s failed: %w", name, err)
		}
		// small delay
		time.Sleep(50 * time.Millisecond)
	}
	return nil
}

// WaitForReady pings the DB pool until it's ready or times out.
func WaitForReady(ctx context.Context, pool *pgxpool.Pool, attempts int, interval time.Duration) error {
	var lastErr error
	for i := 0; i < attempts; i++ {
		acqCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		conn, err := pool.Acquire(acqCtx)
		cancel()
		if err == nil {
			conn.Release()
			return nil
		}
		lastErr = err
		log.Printf("DB not ready yet (attempt %d/%d): %v", i+1, attempts, err)
		time.Sleep(interval)
	}
	return fmt.Errorf("db not ready after %d attempts: %w", attempts, lastErr)
}

// WaitForAddress ensures the DB host:port resolves and accepts TCP connections
func WaitForAddress(dsn string, attempts int, interval time.Duration) error {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return fmt.Errorf("parse dsn: %w", err)
	}
	host := cfg.ConnConfig.Host
	port := int(cfg.ConnConfig.Port)
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	var lastErr error
	for i := 0; i < attempts; i++ {
		conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
		if err == nil {
			conn.Close()
			return nil
		}
		lastErr = err
		log.Printf("address %s not reachable (attempt %d/%d): %v", addr, i+1, attempts, err)
		time.Sleep(interval)
	}
	return fmt.Errorf("address %s not reachable after %d attempts: %w", addr, attempts, lastErr)
}
