package models

import "time"

type DrawRecord struct {
	ID         string    `gorm:"type:text;primaryKey" json:"id"`
	UserID     string    `gorm:"index;not null" json:"user_id"`
	ProductID  string    `gorm:"index;uniqueIndex:idx_product_slot;not null" json:"product_id"`
	PrizeID    string    `gorm:"not null" json:"prize_id"`
	Cost       int       `gorm:"not null" json:"cost"`
	SlotNumber *int      `gorm:"uniqueIndex:idx_product_slot" json:"slot_number,omitempty"`
	ShipmentID *string   `gorm:"index" json:"shipment_id"`
	CreatedAt  time.Time `json:"created_at"`
}
