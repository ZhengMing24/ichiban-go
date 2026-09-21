package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"ichibango-backend/internal/config"
	"ichibango-backend/internal/db"
	"ichibango-backend/internal/handlers"
	"ichibango-backend/internal/middleware"
	"ichibango-backend/internal/response"
)

func main() {
	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	if err := db.Seed(database); err != nil {
		log.Fatalf("failed to seed database: %v", err)
	}

	r := gin.Default()

	authHandler := handlers.NewAuthHandler(database, cfg.JWTSecret)
	drawHandler := handlers.NewDrawHandler(database, cfg.JWTSecret)
	prizeHandler := handlers.NewPrizeHandler(database)
	productHandler := handlers.NewProductHandler(database)
	prizeBoxHandler := handlers.NewPrizeBoxHandler(database)
	shopHandler := handlers.NewShopHandler(database)
	leaderboardHandler := handlers.NewLeaderboardHandler(database)
	dailyTaskHandler := handlers.NewDailyTaskHandler(database)

	api := r.Group("/api")
	api.Use(middleware.RequireJSON())
	{
		api.GET("/health", func(c *gin.Context) {
			response.OK(c, "服務正常", gin.H{"status": "ok"})
		})

		api.POST("/register", authHandler.Register)
		api.POST("/login", authHandler.Login)
		api.POST("/logout", authHandler.Logout)
		api.GET("/products", productHandler.ListStocks)
		api.GET("/products/:id/prizes", prizeHandler.ListForProduct)
		api.GET("/products/:id/slots", productHandler.ListTakenSlots)
		api.GET("/shop/items", shopHandler.List)
		api.GET("/shop/items/:id", shopHandler.GetItem)
		api.GET("/leaderboard/weekly", leaderboardHandler.WeeklyTop)
		api.GET("/draws/recent", leaderboardHandler.RecentDraws)

		authorized := api.Group("/")
		authorized.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			authorized.GET("/me", authHandler.Me)
			authorized.PUT("/me", authHandler.UpdateProfile)
			authorized.PUT("/me/password", authHandler.ChangePassword)
			authorized.GET("/me/prizes", prizeBoxHandler.List)
			authorized.GET("/me/prizes/shipped", prizeBoxHandler.ListShipped)
			authorized.POST("/me/shipments", prizeBoxHandler.CreateShipment)
			authorized.GET("/me/shop-redemptions", shopHandler.MyRedemptions)
			authorized.GET("/me/daily-tasks", dailyTaskHandler.Status)
			authorized.POST("/me/daily-tasks/checkin", dailyTaskHandler.Checkin)
			authorized.POST("/me/daily-tasks/claim-spend-tier", dailyTaskHandler.ClaimSpendTier)
			authorized.POST("/products/:id/draw", drawHandler.Draw)
			authorized.POST("/products/:id/draw-batch", drawHandler.DrawBatch)
			authorized.POST("/shop/items/:id/redeem", shopHandler.Redeem)
		}
	}

	if cfg.WebDir != "" {
		r.NoRoute(func(c *gin.Context) {
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				response.Error(c, http.StatusNotFound, "not found")
				return
			}

			cleanPath := filepath.Clean("/" + c.Request.URL.Path)
			fullPath := filepath.Join(cfg.WebDir, cleanPath)

			if info, err := os.Stat(fullPath); err == nil && !info.IsDir() {
				c.File(fullPath)
				return
			}
			c.File(filepath.Join(cfg.WebDir, "index.html"))
		})
	}

	log.Printf("server listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
