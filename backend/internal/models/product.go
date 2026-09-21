package models

import "time"

type Product struct {
	ID        string    `gorm:"type:text;primaryKey" json:"id"`
	Price     int       `gorm:"not null" json:"price"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
