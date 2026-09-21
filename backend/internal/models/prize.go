package models

import "time"

type Prize struct {
	ID         string    `gorm:"type:text;primaryKey" json:"id"`
	ProductID  string    `gorm:"index;not null" json:"product_id"`
	Tier       string    `gorm:"not null" json:"tier"`
	Name       string    `gorm:"not null" json:"name"`
	Stock      int       `gorm:"not null;default:0" json:"stock"`
	TotalStock int       `gorm:"not null;default:0" json:"total_stock"`
	Weight     int       `gorm:"not null;default:1" json:"weight"`
	SortOrder  int       `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
