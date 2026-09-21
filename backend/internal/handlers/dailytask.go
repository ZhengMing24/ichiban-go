package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

type DailyTaskHandler struct {
	DB *gorm.DB
}

func NewDailyTaskHandler(db *gorm.DB) *DailyTaskHandler {
	return &DailyTaskHandler{DB: db}
}

const dailyCheckinReward = 2

var spendTiers = []struct {
	Threshold int
	Reward    int
}{
	{1000, 5},
	{3000, 20},
	{5000, 50},
	{10000, 130},
	{30000, 450},
}

var errTaskAlreadyClaimed = errors.New("daily task already claimed")

func todayString(now time.Time) string {
	return now.Format("2006-01-02")
}

func startOfDay(now time.Time) time.Time {
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
}

func (h *DailyTaskHandler) getOrCreateProgress(tx *gorm.DB, userID, date string) (*models.DailyTaskProgress, error) {
	var progress models.DailyTaskProgress
	err := tx.Where("user_id = ? AND date = ?", userID, date).First(&progress).Error
	if err == nil {
		return &progress, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	newProgress := models.DailyTaskProgress{ID: uuid.NewString(), UserID: userID, Date: date}
	if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newProgress).Error; err != nil {
		return nil, err
	}
	if err := tx.Where("user_id = ? AND date = ?", userID, date).First(&progress).Error; err != nil {
		return nil, err
	}
	return &progress, nil
}

func (h *DailyTaskHandler) todaySpend(userID string, dayStart time.Time) (int, error) {
	var total int64
	err := h.DB.Model(&models.DrawRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, dayStart).
		Select("COALESCE(SUM(cost), 0)").
		Scan(&total).Error
	return int(total), err
}

func buildStatus(progress *models.DailyTaskProgress, spend int) gin.H {
	tiers := make([]gin.H, len(spendTiers))
	for i, t := range spendTiers {
		tiers[i] = gin.H{
			"tier":      i + 1,
			"threshold": t.Threshold,
			"reward":    t.Reward,
			"reached":   spend >= t.Threshold,
			"claimed":   progress.ClaimedSpendTier >= i+1,
		}
	}
	return gin.H{
		"checkin": gin.H{
			"claimed": progress.CheckedIn,
			"reward":  dailyCheckinReward,
		},
		"spend_today": spend,
		"spend_tiers": tiers,
	}
}

func (h *DailyTaskHandler) Status(c *gin.Context) {
	userID := c.GetString("userID")
	now := time.Now()

	progress, err := h.getOrCreateProgress(h.DB, userID, todayString(now))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load daily tasks")
		return
	}

	spend, err := h.todaySpend(userID, startOfDay(now))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load daily tasks")
		return
	}

	response.OK(c, "查詢成功", buildStatus(progress, spend))
}

func (h *DailyTaskHandler) Checkin(c *gin.Context) {
	userID := c.GetString("userID")
	date := todayString(time.Now())

	var newPoints int
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		progress, err := h.getOrCreateProgress(tx, userID, date)
		if err != nil {
			return err
		}

		result := tx.Model(&models.DailyTaskProgress{}).
			Where("id = ? AND checked_in = ?", progress.ID, false).
			Update("checked_in", true)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return errTaskAlreadyClaimed
		}

		if err := tx.Model(&models.User{}).
			Where("id = ?", userID).
			Update("points", gorm.Expr("points + ?", dailyCheckinReward)).Error; err != nil {
			return err
		}

		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			return err
		}
		newPoints = user.Points
		return nil
	})

	if err != nil {
		if errors.Is(err, errTaskAlreadyClaimed) {
			response.Error(c, http.StatusConflict, "今天已經簽到過了")
			return
		}
		response.Error(c, http.StatusInternalServerError, "簽到失敗")
		return
	}

	response.OK(c, "簽到成功", gin.H{"points": newPoints, "reward": dailyCheckinReward})
}

type ClaimSpendTierRequest struct {
	Tier int `json:"tier" binding:"required,min=1,max=5"`
}

func (h *DailyTaskHandler) ClaimSpendTier(c *gin.Context) {
	userID := c.GetString("userID")
	now := time.Now()
	date := todayString(now)

	var req ClaimSpendTierRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Tier < 1 || req.Tier > len(spendTiers) {
		response.Error(c, http.StatusBadRequest, "任務階段不正確")
		return
	}
	tierDef := spendTiers[req.Tier-1]

	spend, err := h.todaySpend(userID, startOfDay(now))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "查詢失敗")
		return
	}
	if spend < tierDef.Threshold {
		response.Error(c, http.StatusBadRequest, "尚未達成這個任務的花費門檻")
		return
	}

	var newPoints int
	err = h.DB.Transaction(func(tx *gorm.DB) error {
		progress, err := h.getOrCreateProgress(tx, userID, date)
		if err != nil {
			return err
		}

		result := tx.Model(&models.DailyTaskProgress{}).
			Where("id = ? AND claimed_spend_tier = ?", progress.ID, req.Tier-1).
			Update("claimed_spend_tier", req.Tier)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return errTaskAlreadyClaimed
		}

		if err := tx.Model(&models.User{}).
			Where("id = ?", userID).
			Update("points", gorm.Expr("points + ?", tierDef.Reward)).Error; err != nil {
			return err
		}

		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			return err
		}
		newPoints = user.Points
		return nil
	})

	if err != nil {
		if errors.Is(err, errTaskAlreadyClaimed) {
			response.Error(c, http.StatusConflict, "這個任務已經領取過了")
			return
		}
		response.Error(c, http.StatusInternalServerError, "領取失敗")
		return
	}

	response.OK(c, "領取成功", gin.H{"points": newPoints, "reward": tierDef.Reward})
}
