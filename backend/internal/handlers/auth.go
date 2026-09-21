package handlers

import (
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"ichibango-backend/internal/models"
	"ichibango-backend/internal/response"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret []byte
}

func NewAuthHandler(db *gorm.DB, secret []byte) *AuthHandler {
	return &AuthHandler{DB: db, JWTSecret: secret}
}

var phoneRegex = regexp.MustCompile(`^09\d{8}$`)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Nickname string `json:"nickname" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	RealName string `json:"real_name" binding:"required"`
	Address  string `json:"address" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "請確認所有欄位名稱都已正確填寫")
		return
	}

	phone := strings.TrimSpace(req.Phone)
	if !phoneRegex.MatchString(phone) {
		response.Error(c, http.StatusBadRequest, "電話號碼必須是有效的台灣手機號碼, e.g. 0912345678")
		return
	}

	email := normalizeEmail(req.Email)

	var existing models.User
	if err := h.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		response.Error(c, http.StatusConflict, "信箱已被註冊")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to hash password")
		return
	}

	user := models.User{
		ID:           uuid.NewString(),
		Email:        email,
		PasswordHash: string(hash),
		Nickname:     req.Nickname,
		Phone:        phone,
		RealName:     strings.TrimSpace(req.RealName),
		Address:      strings.TrimSpace(req.Address),
	}
	if err := h.DB.Create(&user).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to create user")
		return
	}

	response.Created(c, "註冊成功", userResponse(user))
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "請確認所有欄位名稱都已正確填寫")
		return
	}

	var user models.User
	email := normalizeEmail(req.Email)
	if err := h.DB.Where("email = ?", email).First(&user).Error; err != nil {
		response.Error(c, http.StatusUnauthorized, "帳號或密碼錯誤")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		response.Error(c, http.StatusUnauthorized, "帳號或密碼錯誤")
		return
	}

	token, err := h.generateAccessToken(user.ID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to issue token")
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", token, 60*60*24*7, "/", "", false, true)

	response.OK(c, "登入成功", userResponse(user))
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	response.OK(c, "登出成功", nil)
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetString("userID")

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	response.OK(c, "查詢成功", userResponse(user))
}

type UpdateProfileRequest struct {
	Nickname string `json:"nickname" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	RealName string `json:"real_name" binding:"required"`
	Address  string `json:"address" binding:"required"`
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("userID")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "請確認所有欄位名稱都已正確填寫")
		return
	}

	phone := strings.TrimSpace(req.Phone)
	if !phoneRegex.MatchString(phone) {
		response.Error(c, http.StatusBadRequest, "電話號碼必須是有效的台灣手機號碼, e.g. 0912345678")
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	updates := map[string]any{
		"nickname":  strings.TrimSpace(req.Nickname),
		"phone":     phone,
		"real_name": strings.TrimSpace(req.RealName),
		"address":   strings.TrimSpace(req.Address),
	}
	if err := h.DB.Model(&user).Updates(updates).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to update profile")
		return
	}

	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to reload profile")
		return
	}
	response.OK(c, "會員資料已更新", userResponse(user))
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID := c.GetString("userID")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "請確認所有欄位名稱都已正確填寫，新密碼至少 8 碼")
		return
	}
	if req.NewPassword != req.ConfirmPassword {
		response.Error(c, http.StatusBadRequest, "兩次輸入的新密碼不一致")
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		response.Error(c, http.StatusNotFound, "user not found")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		response.Error(c, http.StatusBadRequest, "目前密碼錯誤")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to hash password")
		return
	}

	if err := h.DB.Model(&user).Update("password_hash", string(hash)).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to update password")
		return
	}

	response.OK(c, "密碼修改成功", nil)
}

func (h *AuthHandler) generateAccessToken(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(h.JWTSecret)
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func userResponse(user models.User) gin.H {
	return gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"nickname":  user.Nickname,
		"phone":     user.Phone,
		"real_name": user.RealName,
		"address":   user.Address,
		"points":    user.Points,
	}
}
