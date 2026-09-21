package models

import "time"

type ShopRedemption struct {
	ID         string    `gorm:"type:text;primaryKey" json:"id"`
	UserID     string    `gorm:"index;not null" json:"user_id"`
	ShopItemID string    `gorm:"index;not null" json:"shop_item_id"`
	Cost       int       `gorm:"not null" json:"cost"`
	ShipmentID *string   `gorm:"index" json:"shipment_id"`
	CreatedAt  time.Time `json:"created_at"`
}
