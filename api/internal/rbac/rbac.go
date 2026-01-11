package rbac

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CanEditDirectorate(ctx context.Context, pool *pgxpool.Pool, userID int64, directorateID int64) (bool, error) {
	var can bool
	row := pool.QueryRow(ctx, `SELECT can_edit FROM user_directorates WHERE user_id=$1 AND directorate_id=$2`, userID, directorateID)
	if err := row.Scan(&can); err != nil {
		return false, fmt.Errorf("verificação RBAC: %w", err)
	}
	return can, nil
}
