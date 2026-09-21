package handlers

import (
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

const lastPrizeTier = "最後賞"

var (
	errInsufficientPoints = errors.New("insufficient points")
	errNoPrizeAvailable   = errors.New("no prize available")
	errProductNotFound    = errors.New("product not found")
	errSlotAlreadyTaken   = errors.New("slot already taken")
	errInvalidSlot        = errors.New("invalid slot number")
)

type slotsTakenError struct{ Slots []int }

func (e *slotsTakenError) Error() string { return "slots already taken" }

type notEnoughStockError struct{ Remaining int }

func (e *notEnoughStockError) Error() string { return "not enough stock" }

type DrawRequest struct {
	SlotNumber *int `json:"slot_number"`
}

type DrawBatchRequest struct {
	SlotNumbers []int `json:"slot_numbers" binding:"required,min=1"`
}

type DrawHandler struct {
	DB        *gorm.DB
	JWTSecret []byte

	locks sync.Map
}

func NewDrawHandler(db *gorm.DB, secret []byte) *DrawHandler {
	return &DrawHandler{DB: db, JWTSecret: secret}
}

func (h *DrawHandler) lockFor(key string) *sync.Mutex {
	l, _ := h.locks.LoadOrStore(key, &sync.Mutex{})
	return l.(*sync.Mutex)
}

func (h *DrawHandler) Draw(c *gin.Context) {
	userID := c.GetString("userID")
	productID := c.Param("id")

	var req DrawRequest
	_ = c.ShouldBindJSON(&req)

	lock := h.lockFor(userID + ":" + productID)
	if !lock.TryLock() {
		response.Error(c, http.StatusTooManyRequests, "請勿重複點擊")
		return
	}
	defer lock.Unlock()

	out, err := h.drawMany(userID, productID, []*int{req.SlotNumber})
	if err != nil {
		writeDrawError(c, err)
		return
	}

	data := gin.H{
		"points": out.points,
		"prize":  prizeJSON(out.prizes[0]),
	}
	if out.bonusPrize != nil {
		data["bonus_prize"] = prizeJSON(*out.bonusPrize)
	}
	response.OK(c, "抽獎成功", data)
}

func (h *DrawHandler) DrawBatch(c *gin.Context) {
	userID := c.GetString("userID")
	productID := c.Param("id")

	var req DrawBatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "請選擇至少一個籤號")
		return
	}

	seen := make(map[int]bool, len(req.SlotNumbers))
	slots := make([]*int, len(req.SlotNumbers))
	for i, n := range req.SlotNumbers {
		if seen[n] {
			response.Error(c, http.StatusBadRequest, fmt.Sprintf("%d 號籤號重複選取", n))
			return
		}
		seen[n] = true
		slot := n
		slots[i] = &slot
	}

	lock := h.lockFor(userID + ":" + productID)
	if !lock.TryLock() {
		response.Error(c, http.StatusTooManyRequests, "請勿重複點擊")
		return
	}
	defer lock.Unlock()

	out, err := h.drawMany(userID, productID, slots)
	if err != nil {
		writeDrawError(c, err)
		return
	}

	prizes := make([]gin.H, len(out.prizes))
	for i, p := range out.prizes {
		prizes[i] = prizeJSON(p)
	}
	data := gin.H{
		"points": out.points,
		"prizes": prizes,
	}
	if out.bonusPrize != nil {
		data["bonus_prize"] = prizeJSON(*out.bonusPrize)
	}
	response.OK(c, "抽獎成功", data)
}

type drawOutcome struct {
	prizes     []models.Prize
	bonusPrize *models.Prize
	points     int
}

func (h *DrawHandler) drawMany(userID, productID string, slots []*int) (drawOutcome, error) {
	n := len(slots)
	var out drawOutcome

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var product models.Product
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, "id = ?", productID).Error; err != nil {
			return errProductNotFound
		}

		var prizes []models.Prize
		if err := tx.Where("product_id = ? AND tier <> ?", productID, lastPrizeTier).
			Order("sort_order").Find(&prizes).Error; err != nil {
			return err
		}
		total, remaining := 0, 0
		for _, p := range prizes {
			total += p.TotalStock
			remaining += p.Stock
		}
		if remaining == 0 {
			return errNoPrizeAvailable
		}

		var claimed []int
		for _, s := range slots {
			if s == nil {
				continue
			}
			if *s < 1 || *s > total {
				return errInvalidSlot
			}
			claimed = append(claimed, *s)
		}
		if len(claimed) > 0 {
			var taken []int
			if err := tx.Model(&models.DrawRecord{}).
				Where("product_id = ? AND slot_number IN ?", productID, claimed).
				Pluck("slot_number", &taken).Error; err != nil {
				return err
			}
			if len(taken) > 0 {
				sort.Ints(taken)
				return &slotsTakenError{Slots: taken}
			}
		}

		if remaining < n {
			return &notEnoughStockError{Remaining: remaining}
		}

		result := tx.Model(&models.User{}).
			Where("id = ? AND points >= ?", userID, product.Price*n).
			Update("points", gorm.Expr("points - ?", product.Price*n))
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return errInsufficientPoints
		}

		used := make(map[string]int)
		out.prizes = make([]models.Prize, 0, n)
		for i := 0; i < n; i++ {
			var pool []models.Prize
			for _, p := range prizes {
				if p.Stock-used[p.ID] > 0 {
					pool = append(pool, p)
				}
			}
			picked := weightedPick(pool)
			used[picked.ID]++
			out.prizes = append(out.prizes, picked)
		}
		for prizeID, count := range used {
			stockResult := tx.Model(&models.Prize{}).
				Where("id = ? AND stock >= ?", prizeID, count).
				Update("stock", gorm.Expr("stock - ?", count))
			if stockResult.Error != nil {
				return stockResult.Error
			}
			if stockResult.RowsAffected == 0 {
				return errNoPrizeAvailable
			}
		}

		if remaining == n {
			var lastPrize models.Prize
			if err := tx.Where("product_id = ? AND tier = ? AND stock > 0", productID, lastPrizeTier).
				First(&lastPrize).Error; err == nil {
				lastResult := tx.Model(&models.Prize{}).
					Where("id = ? AND stock > 0", lastPrize.ID).
					Update("stock", gorm.Expr("stock - 1"))
				if lastResult.Error != nil {
					return lastResult.Error
				}
				if lastResult.RowsAffected == 1 {
					out.bonusPrize = &lastPrize
				}
			} else if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}

		records := make([]models.DrawRecord, 0, n+1)
		for i, p := range out.prizes {
			records = append(records, models.DrawRecord{
				ID:         uuid.NewString(),
				UserID:     userID,
				ProductID:  productID,
				PrizeID:    p.ID,
				Cost:       product.Price,
				SlotNumber: slots[i],
			})
		}
		if out.bonusPrize != nil {
			records = append(records, models.DrawRecord{
				ID:        uuid.NewString(),
				UserID:    userID,
				ProductID: productID,
				PrizeID:   out.bonusPrize.ID,
				Cost:      0,
			})
		}
		if err := tx.Create(&records).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				return errSlotAlreadyTaken
			}
			return err
		}

		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			return err
		}
		out.points = user.Points
		return nil
	})

	return out, err
}

func writeDrawError(c *gin.Context, err error) {
	var taken *slotsTakenError
	var notEnough *notEnoughStockError
	switch {
	case errors.Is(err, errProductNotFound):
		response.Error(c, http.StatusNotFound, "商品不存在")
	case errors.Is(err, errInsufficientPoints):
		response.Error(c, http.StatusBadRequest, "餘額不足")
	case errors.Is(err, errInvalidSlot):
		response.Error(c, http.StatusBadRequest, "籤號不正確")
	case errors.Is(err, errNoPrizeAvailable):
		response.Error(c, http.StatusConflict, "獎項已抽完,請稍後再試")
	case errors.As(err, &notEnough):
		response.Error(c, http.StatusConflict, fmt.Sprintf("剩餘只有 %d 抽，請減少選取的籤號", notEnough.Remaining))
	case errors.As(err, &taken):
		nums := make([]string, len(taken.Slots))
		for i, s := range taken.Slots {
			nums[i] = strconv.Itoa(s)
		}
		response.Error(c, http.StatusConflict, fmt.Sprintf("%s 號籤號已經搶先一步被抽走了", strings.Join(nums, "、")))
	case errors.Is(err, errSlotAlreadyTaken):
		response.Error(c, http.StatusConflict, "選取的籤號已經搶先一步被抽走了")
	default:
		response.Error(c, http.StatusInternalServerError, "抽獎失敗")
	}
}

func prizeJSON(p models.Prize) gin.H {
	return gin.H{"id": p.ID, "name": p.Name}
}

func weightedPick(prizes []models.Prize) models.Prize {
	total := 0
	for _, p := range prizes {
		total += p.Weight
	}
	r := rand.Intn(total)
	for _, p := range prizes {
		if r < p.Weight {
			return p
		}
		r -= p.Weight
	}
	return prizes[len(prizes)-1]
}
