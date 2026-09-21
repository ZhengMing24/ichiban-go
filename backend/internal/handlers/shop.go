package handlers

import (
	"errors"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

var (
	errShopItemNotFound = errors.New("shop item not found")
	errShopItemSoldOut  = errors.New("shop item sold out")
)

type ShopHandler struct {
	DB *gorm.DB

	locks sync.Map
}

func NewShopHandler(db *gorm.DB) *ShopHandler {
	return &ShopHandler{DB: db}
}

func (h *ShopHandler) lockFor(key string) *sync.Mutex {
	l, _ := h.locks.LoadOrStore(key, &sync.Mutex{})
	return l.(*sync.Mutex)
}

func (h *ShopHandler) List(c *gin.Context) {
	var items []models.ShopItem
	if err := h.DB.Order("sort_order asc").Find(&items).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load shop items")
		return
	}

	resp := make([]gin.H, len(items))
	for i, item := range items {
		resp[i] = gin.H{
			"id":              item.ID,
			"name":            item.Name,
			"description":     item.Description,
			"category":        item.Category,
			"cost":            item.Cost,
			"remaining_count": item.Stock,
		}
	}
	response.OK(c, "查詢成功", resp)
}

func (h *ShopHandler) GetItem(c *gin.Context) {
	itemID := c.Param("id")

	var item models.ShopItem
	if err := h.DB.First(&item, "id = ?", itemID).Error; err != nil {
		response.Error(c, http.StatusNotFound, "商品不存在")
		return
	}

	response.OK(c, "查詢成功", gin.H{
		"id":              item.ID,
		"name":            item.Name,
		"description":     item.Description,
		"category":        item.Category,
		"cost":            item.Cost,
		"remaining_count": item.Stock,
	})
}

type shopRedemptionRow struct {
	ID         string
	ShopItemID string
	Name       string
	Cost       int
	CreatedAt  time.Time
}

func (h *ShopHandler) MyRedemptions(c *gin.Context) {
	userID := c.GetString("userID")

	var rows []shopRedemptionRow
	err := h.DB.Table("shop_redemptions").
		Select("shop_redemptions.id, shop_redemptions.shop_item_id, shop_items.name, shop_redemptions.cost, shop_redemptions.created_at").
		Joins("JOIN shop_items ON shop_items.id = shop_redemptions.shop_item_id").
		Where("shop_redemptions.user_id = ?", userID).
		Order("shop_redemptions.created_at DESC").
		Scan(&rows).Error
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load redemption history")
		return
	}

	resp := make([]gin.H, len(rows))
	for i, r := range rows {
		resp[i] = gin.H{
			"id":           r.ID,
			"shop_item_id": r.ShopItemID,
			"name":         r.Name,
			"cost":         r.Cost,
			"created_at":   r.CreatedAt,
		}
	}
	response.OK(c, "查詢成功", resp)
}

func (h *ShopHandler) Redeem(c *gin.Context) {
	userID := c.GetString("userID")
	itemID := c.Param("id")

	lock := h.lockFor(userID + ":" + itemID)
	if !lock.TryLock() {
		response.Error(c, http.StatusTooManyRequests, "請勿重複點擊")
		return
	}
	defer lock.Unlock()

	var item models.ShopItem
	var newPoints int
	var newStock int

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&item, "id = ?", itemID).Error; err != nil {
			return errShopItemNotFound
		}

		result := tx.Model(&models.User{}).
			Where("id = ? AND points >= ?", userID, item.Cost).
			Update("points", gorm.Expr("points - ?", item.Cost))
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return errInsufficientPoints
		}

		stockResult := tx.Model(&models.ShopItem{}).
			Where("id = ? AND stock > 0", itemID).
			Update("stock", gorm.Expr("stock - 1"))
		if stockResult.Error != nil {
			return stockResult.Error
		}
		if stockResult.RowsAffected == 0 {
			return errShopItemSoldOut
		}

		redemption := models.ShopRedemption{
			ID:         uuid.NewString(),
			UserID:     userID,
			ShopItemID: itemID,
			Cost:       item.Cost,
		}
		if err := tx.Create(&redemption).Error; err != nil {
			return err
		}

		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			return err
		}
		newPoints = user.Points

		var freshItem models.ShopItem
		if err := tx.First(&freshItem, "id = ?", itemID).Error; err != nil {
			return err
		}
		newStock = freshItem.Stock
		return nil
	})

	if err != nil {
		switch {
		case errors.Is(err, errShopItemNotFound):
			response.Error(c, http.StatusNotFound, "商品不存在")
		case errors.Is(err, errInsufficientPoints):
			response.Error(c, http.StatusBadRequest, "點數不足")
		case errors.Is(err, errShopItemSoldOut):
			response.Error(c, http.StatusConflict, "商品已兌換完畢")
		default:
			response.Error(c, http.StatusInternalServerError, "兌換失敗")
		}
		return
	}

	response.OK(c, "兌換成功", gin.H{
		"points":          newPoints,
		"remaining_count": newStock,
		"item": gin.H{
			"id":   item.ID,
			"name": item.Name,
		},
	})
}
