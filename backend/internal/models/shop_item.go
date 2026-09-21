package models

import "time"

type ShopItem struct {
	ID          string    `gorm:"type:text;primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"not null" json:"description"`
	Category    string    `gorm:"not null;default:''" json:"category"`
	Cost        int       `gorm:"not null" json:"cost"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	SortOrder   int       `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
