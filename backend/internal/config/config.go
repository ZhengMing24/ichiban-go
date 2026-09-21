package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	JWTSecret      []byte
	DatabaseURL    string
	FrontendOrigin string
	WebDir         string
}

func Load() Config {
	_ = godotenv.Load()

	return Config{
		Port:           getEnv("PORT", "8080"),
		JWTSecret:      []byte(getEnv("JWT_SECRET", "dev-secret-change-me")),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://ichiban:ichiban@localhost:5432/ichibango?sslmode=disable"),
		FrontendOrigin: getEnv("FRONTEND_ORIGIN", "http://localhost:5174"),
		WebDir: getEnv("WEB_DIR", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
