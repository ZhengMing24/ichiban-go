package handlers

import (
	"errors"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

type PrizeBoxHandler struct {
	DB *gorm.DB
}

func NewPrizeBoxHandler(db *gorm.DB) *PrizeBoxHandler {
	return &PrizeBoxHandler{DB: db}
}

type prizeBoxRow struct {
	ID        string
	Source    string
	ProductID string
	Tier      string
	Category  string
	Name      string
	Cost      int
	CreatedAt time.Time
}

func (h *PrizeBoxHandler) loadUnshipped(userID string) ([]prizeBoxRow, error) {
	var drawRows []prizeBoxRow
	if err := h.DB.Table("draw_records").
		Select("draw_records.id, 'draw' AS source, draw_records.product_id, prizes.tier, '' AS category, prizes.name, draw_records.cost, draw_records.created_at").
		Joins("JOIN prizes ON prizes.id = draw_records.prize_id").
		Where("draw_records.user_id = ? AND draw_records.shipment_id IS NULL", userID).
		Scan(&drawRows).Error; err != nil {
		return nil, err
	}

	var shopRows []prizeBoxRow
	if err := h.DB.Table("shop_redemptions").
		Select("shop_redemptions.id, 'shop' AS source, '' AS product_id, '' AS tier, shop_items.category, shop_items.name, shop_redemptions.cost, shop_redemptions.created_at").
		Joins("JOIN shop_items ON shop_items.id = shop_redemptions.shop_item_id").
		Where("shop_redemptions.user_id = ? AND shop_redemptions.shipment_id IS NULL", userID).
		Scan(&shopRows).Error; err != nil {
		return nil, err
	}

	rows := append(drawRows, shopRows...)
	sort.Slice(rows, func(i, j int) bool { return rows[i].CreatedAt.After(rows[j].CreatedAt) })
	return rows, nil
}

func (h *PrizeBoxHandler) List(c *gin.Context) {
	userID := c.GetString("userID")

	rows, err := h.loadUnshipped(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load prize box")
		return
	}

	resp := make([]gin.H, len(rows))
	for i, r := range rows {
		resp[i] = gin.H{
			"id":         r.ID,
			"source":     r.Source,
			"product_id": r.ProductID,
			"tier":       r.Tier,
			"category":   r.Category,
			"name":       r.Name,
			"cost":       r.Cost,
			"is_bonus":   r.Source == "draw" && r.Cost == 0,
			"created_at": r.CreatedAt,
		}
	}
	response.OK(c, "查詢成功", resp)
}

type shippedPrizeRow struct {
	ID        string
	Source    string
	ProductID string
	Tier      string
	Category  string
	Name      string
	Cost      int
	CreatedAt time.Time
	ShippedAt time.Time
}

func (h *PrizeBoxHandler) ListShipped(c *gin.Context) {
	userID := c.GetString("userID")

	var drawRows []shippedPrizeRow
	if err := h.DB.Table("draw_records").
		Select("draw_records.id, 'draw' AS source, draw_records.product_id, prizes.tier, '' AS category, prizes.name, draw_records.cost, draw_records.created_at, shipments.created_at AS shipped_at").
		Joins("JOIN prizes ON prizes.id = draw_records.prize_id").
		Joins("JOIN shipments ON shipments.id = draw_records.shipment_id").
		Where("draw_records.user_id = ? AND draw_records.shipment_id IS NOT NULL", userID).
		Scan(&drawRows).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load shipped prizes")
		return
	}

	var shopRows []shippedPrizeRow
	if err := h.DB.Table("shop_redemptions").
		Select("shop_redemptions.id, 'shop' AS source, '' AS product_id, '' AS tier, shop_items.category, shop_items.name, shop_redemptions.cost, shop_redemptions.created_at, shipments.created_at AS shipped_at").
		Joins("JOIN shop_items ON shop_items.id = shop_redemptions.shop_item_id").
		Joins("JOIN shipments ON shipments.id = shop_redemptions.shipment_id").
		Where("shop_redemptions.user_id = ? AND shop_redemptions.shipment_id IS NOT NULL", userID).
		Scan(&shopRows).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load shipped prizes")
		return
	}

	rows := append(drawRows, shopRows...)
	sort.Slice(rows, func(i, j int) bool { return rows[i].ShippedAt.After(rows[j].ShippedAt) })

	resp := make([]gin.H, len(rows))
	for i, r := range rows {
		resp[i] = gin.H{
			"id":         r.ID,
			"source":     r.Source,
			"product_id": r.ProductID,
			"tier":       r.Tier,
			"category":   r.Category,
			"name":       r.Name,
			"cost":       r.Cost,
			"is_bonus":   r.Source == "draw" && r.Cost == 0,
			"created_at": r.CreatedAt,
			"shipped_at": r.ShippedAt,
		}
	}
	response.OK(c, "查詢成功", resp)
}

var errShipmentInvalidItems = errors.New("one or more prizes are invalid or already shipped")

type ShipmentItemRef struct {
	ID     string `json:"id" binding:"required"`
	Source string `json:"source" binding:"required,oneof=draw shop"`
}

type CreateShipmentRequest struct {
	Items         []ShipmentItemRef `json:"items" binding:"required"`
	RecipientName string            `json:"recipient_name" binding:"required"`
	Phone         string            `json:"phone" binding:"required"`
	Address       string            `json:"address" binding:"required"`
	Note          string            `json:"note"`
}

func (h *PrizeBoxHandler) CreateShipment(c *gin.Context) {
	userID := c.GetString("userID")

	var req CreateShipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.Items) == 0 {
		response.Error(c, http.StatusBadRequest, "請確認所有欄位名稱都已正確填寫，且至少選擇一項商品")
		return
	}

	phone := strings.TrimSpace(req.Phone)
	if !phoneRegex.MatchString(phone) {
		response.Error(c, http.StatusBadRequest, "電話號碼必須是有效的台灣手機號碼, e.g. 0912345678")
		return
	}

	var drawIDs, shopIDs []string
	for _, item := range req.Items {
		if item.Source == "draw" {
			drawIDs = append(drawIDs, item.ID)
		} else {
			shopIDs = append(shopIDs, item.ID)
		}
	}

	shipment := models.Shipment{
		ID:            uuid.NewString(),
		UserID:        userID,
		RecipientName: strings.TrimSpace(req.RecipientName),
		Phone:         phone,
		Address:       strings.TrimSpace(req.Address),
		Note:          strings.TrimSpace(req.Note),
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&shipment).Error; err != nil {
			return err
		}

		var totalAffected int64

		if len(drawIDs) > 0 {
			result := tx.Model(&models.DrawRecord{}).
				Where("id IN ? AND user_id = ? AND shipment_id IS NULL", drawIDs, userID).
				Update("shipment_id", shipment.ID)
			if result.Error != nil {
				return result.Error
			}
			totalAffected += result.RowsAffected
		}

		if len(shopIDs) > 0 {
			result := tx.Model(&models.ShopRedemption{}).
				Where("id IN ? AND user_id = ? AND shipment_id IS NULL", shopIDs, userID).
				Update("shipment_id", shipment.ID)
			if result.Error != nil {
				return result.Error
			}
			totalAffected += result.RowsAffected
		}

		if int(totalAffected) != len(req.Items) {
			return errShipmentInvalidItems
		}
		return nil
	})

	if err != nil {
		switch {
		case errors.Is(err, errShipmentInvalidItems):
			response.Error(c, http.StatusConflict, "選取的商品中有已經寄送過或不存在的項目，請重新整理後再試")
		default:
			response.Error(c, http.StatusInternalServerError, "建立寄送申請失敗")
		}
		return
	}

	response.OK(c, "寄送申請已送出", gin.H{
		"shipment_id":   shipment.ID,
		"shipped_count": len(req.Items),
	})
}
