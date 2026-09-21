package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"ichibango-backend/internal/response"
)

func AuthRequired(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("access_token")
		if err != nil || tokenStr == "" {
			response.AbortError(c, http.StatusUnauthorized, "not logged in")
			return
		}

		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		if err != nil || !token.Valid {
			response.AbortError(c, http.StatusUnauthorized, "invalid session")
			return
		}

		c.Set("userID", claims.Subject)
		c.Next()
	}
}
