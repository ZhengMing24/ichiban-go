package models

import "time"

type Shipment struct {
	ID            string    `gorm:"type:text;primaryKey" json:"id"`
	UserID        string    `gorm:"index;not null" json:"user_id"`
	RecipientName string    `gorm:"not null" json:"recipient_name"`
	Phone         string    `gorm:"not null" json:"phone"`
	Address       string    `gorm:"not null" json:"address"`
	Note          string    `json:"note"`
	CreatedAt     time.Time `json:"created_at"`
}
