package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"ichibango-backend/internal/response"
)

type LeaderboardHandler struct {
	DB *gorm.DB
}

func NewLeaderboardHandler(db *gorm.DB) *LeaderboardHandler {
	return &LeaderboardHandler{DB: db}
}

func startOfWeek(now time.Time) time.Time {
	daysSinceMonday := (int(now.Weekday()) + 6) % 7
	monday := now.AddDate(0, 0, -daysSinceMonday)
	return time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, monday.Location())
}

type weeklyTopRow struct {
	Nickname string
	Total    int
}

func (h *LeaderboardHandler) WeeklyTop(c *gin.Context) {
	weekStart := startOfWeek(time.Now())

	var rows []weeklyTopRow
	err := h.DB.Raw(`
		SELECT users.nickname AS nickname, agg.total AS total
		FROM (
			SELECT user_id, SUM(cost) AS total FROM (
				SELECT user_id, cost FROM draw_records WHERE created_at >= ?
				UNION ALL
				SELECT user_id, cost FROM shop_redemptions WHERE created_at >= ?
			) spend
			GROUP BY user_id
		) agg
		JOIN users ON users.id = agg.user_id
		ORDER BY agg.total DESC
		LIMIT 3
	`, weekStart, weekStart).Scan(&rows).Error
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load leaderboard")
		return
	}

	resp := make([]gin.H, len(rows))
	for i, r := range rows {
		resp[i] = gin.H{
			"rank":         i + 1,
			"nickname":     r.Nickname,
			"total_points": r.Total,
		}
	}
	response.OK(c, "查詢成功", resp)
}

type recentDrawRow struct {
	ID        string
	Nickname  string
	ProductID string
	Tier      string
	PrizeName string
	CreatedAt time.Time
}

func (h *LeaderboardHandler) RecentDraws(c *gin.Context) {
	var rows []recentDrawRow
	err := h.DB.Table("draw_records").
		Select("draw_records.id, users.nickname, draw_records.product_id, prizes.tier, prizes.name AS prize_name, draw_records.created_at").
		Joins("JOIN users ON users.id = draw_records.user_id").
		Joins("JOIN prizes ON prizes.id = draw_records.prize_id").
		Order("draw_records.created_at DESC").
		Limit(20).
		Scan(&rows).Error
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to load recent draws")
		return
	}

	resp := make([]gin.H, len(rows))
	for i, r := range rows {
		resp[i] = gin.H{
			"id":         r.ID,
			"nickname":   r.Nickname,
			"product_id": r.ProductID,
			"tier":       r.Tier,
			"prize_name": r.PrizeName,
			"created_at": r.CreatedAt,
		}
	}
	response.OK(c, "查詢成功", resp)
}
