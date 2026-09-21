package db

import (
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
)

func Connect(dsn string) (*gorm.DB, error) {
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{TranslateError: true})
	if err != nil {
		return nil, err
	}

	sqlDB, err := database.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	if err := database.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Prize{},
		&models.DrawRecord{},
		&models.ShopItem{},
		&models.ShopRedemption{},
		&models.Shipment{},
		&models.DailyTaskProgress{},
	); err != nil {
		return nil, err
	}

	return database, nil
}
