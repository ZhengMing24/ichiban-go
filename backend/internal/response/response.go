package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func JSON(c *gin.Context, code int, message string, data any) {
	body := gin.H{"message": message}
	if data != nil {
		body["data"] = data
	}
	c.JSON(code, body)
}

func OK(c *gin.Context, message string, data any) {
	JSON(c, http.StatusOK, message, data)
}

func Created(c *gin.Context, message string, data any) {
	JSON(c, http.StatusCreated, message, data)
}

func Error(c *gin.Context, code int, message string) {
	JSON(c, code, message, nil)
}

func AbortError(c *gin.Context, code int, message string) {
	c.AbortWithStatusJSON(code, gin.H{"message": message})
}
