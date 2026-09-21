package models

import "time"

type DailyTaskProgress struct {
	ID               string    `gorm:"type:text;primaryKey" json:"id"`
	UserID           string    `gorm:"uniqueIndex:idx_user_date;not null" json:"user_id"`
	Date             string    `gorm:"uniqueIndex:idx_user_date;not null" json:"date"`
	CheckedIn        bool      `gorm:"not null;default:false" json:"checked_in"`
	ClaimedSpendTier int       `gorm:"not null;default:0" json:"claimed_spend_tier"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
