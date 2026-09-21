package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

type ProductHandler struct {
	DB *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{DB: db}
}

type productStockRow struct {
	ProductID string `json:"id"`
	Remaining int    `json:"remaining_count"`
	Total     int    `json:"total_count"`
}

func (h *ProductHandler) ListStocks(c *gin.Context) {
	var rows []productStockRow
	err := h.DB.Table("prizes").
		Select("product_id, SUM(stock) as remaining, SUM(total_stock) as total").
		Where("tier <> ?", "最後賞").
		Group("product_id").
		Scan(&rows).Error
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load product stocks")
		return
	}

	response.OK(c, "查詢成功", rows)
}

func (h *ProductHandler) ListTakenSlots(c *gin.Context) {
	productID := c.Param("id")

	var slots []int
	err := h.DB.Model(&models.DrawRecord{}).
		Where("product_id = ? AND slot_number IS NOT NULL", productID).
		Pluck("slot_number", &slots).Error
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load taken slots")
		return
	}
	if slots == nil {
		slots = []int{}
	}

	response.OK(c, "查詢成功", gin.H{"taken": slots})
}
