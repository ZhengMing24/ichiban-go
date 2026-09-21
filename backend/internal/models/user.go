package models

import "time"

type User struct {
	ID           string    `gorm:"type:text;primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Nickname     string    `gorm:"not null" json:"nickname"`
	Phone        string    `gorm:"not null" json:"phone"`
	RealName     string    `gorm:"not null" json:"real_name"`
	Address      string    `gorm:"not null" json:"address"`
	Points       int       `gorm:"not null;default:0" json:"points"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
