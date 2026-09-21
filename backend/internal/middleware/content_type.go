package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ichibango-backend/internal/response"
)

func RequireJSON() gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodPost, http.MethodPut:
			if c.ContentType() != "application/json" {
				response.Error(c, http.StatusUnsupportedMediaType, "Content-Type 必須是 application/json")
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
