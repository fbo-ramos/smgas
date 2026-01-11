package models

import "time"

type User struct {
	ID int64 `json:"id"`
	Email string `json:"email"`
	PasswordHash string `json:"-"`
	Role string `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Directorate struct {
	ID int64 `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type KPI struct {
	ID int64 `json:"id"`
	DirectorateID int64 `json:"directorate_id"`
	Key string `json:"key"`
	Label string `json:"label"`
	Unit string `json:"unit"`
	Polarity string `json:"polarity"`
	Suggested bool `json:"suggested"`
}

type Target struct {
	ID int64 `json:"id"`
	KpiID int64 `json:"kpi_id"`
	Year int `json:"year"`
	AnnualTarget float64 `json:"annual_target"`
	MonthlyTargets []float64 `json:"monthly_targets"`
}

type Entry struct {
	ID int64 `json:"id"`
	KpiID int64 `json:"kpi_id"`
	Year int `json:"year"`
	Month int `json:"month"`
	Value float64 `json:"value"`
	Notes string `json:"notes"`
	CreatedBy int64 `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}
