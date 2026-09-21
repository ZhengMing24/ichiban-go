package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

type PrizeHandler struct {
	DB *gorm.DB
}

func NewPrizeHandler(db *gorm.DB) *PrizeHandler {
	return &PrizeHandler{DB: db}
}

func (h *PrizeHandler) ListForProduct(c *gin.Context) {
	productID := c.Param("id")

	var prizes []models.Prize
	if err := h.DB.Where("product_id = ?", productID).Order("sort_order asc").Find(&prizes).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load prizes")
		return
	}

	resp := make([]gin.H, len(prizes))
	for i, p := range prizes {
		resp[i] = gin.H{
			"id":              p.ID,
			"tier":            p.Tier,
			"name":            p.Name,
			"total_count":     p.TotalStock,
			"remaining_count": p.Stock,
			"is_last_prize":   p.Tier == "最後賞",
		}
	}

	response.OK(c, "查詢成功", resp)
}
