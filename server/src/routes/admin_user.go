package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type AdminUserHandler struct {
	deps Dependencies
}

func NewAdminUserHandler(deps Dependencies) *AdminUserHandler {
	return &AdminUserHandler{deps: deps}
}

func (h *AdminUserHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	items, total, err := h.deps.AdminUserService.List(c.Request.Context(), services.ListAdminUsersOpts{
		Page:   page,
		Limit:  limit,
		Query:  c.DefaultQuery("q", ""),
		Status: c.DefaultQuery("status", ""),
		Role:   c.DefaultQuery("role", ""),
	})
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items, "total": total})
}

func (h *AdminUserHandler) GetByID(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	user, roles, err := h.deps.AdminUserService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":              user.ID,
		"email":           user.Email,
		"displayName":     user.DisplayName,
		"avatarUrl":       user.AvatarURL,
		"status":          user.Status,
		"presenceStatus":  "offline",
		"disabledAt":      user.DisabledAt,
		"emailVerifiedAt": user.EmailVerifiedAt,
		"createdAt":       user.CreatedAt,
		"updatedAt":       user.UpdatedAt,
		"roles":           roles,
	})
}

func (h *AdminUserHandler) Update(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req services.UpdateAdminUserInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	user, roles, err := h.deps.AdminUserService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":              user.ID,
		"email":           user.Email,
		"displayName":     user.DisplayName,
		"status":          user.Status,
		"roles":           roles,
	})
}

func (h *AdminUserHandler) Delete(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminUserService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *AdminUserHandler) Disable(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	user, err := h.deps.AdminUserService.Disable(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":         user.ID,
		"status":     user.Status,
		"disabledAt": user.DisabledAt,
	})
}

func (h *AdminUserHandler) Enable(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	user, err := h.deps.AdminUserService.Enable(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":         user.ID,
		"status":     user.Status,
		"disabledAt": user.DisabledAt,
	})
}

func (h *AdminUserHandler) ListSessions(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	items, err := h.deps.AdminUserService.ListSessions(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	type sessionResponse struct {
		ID            string  `json:"id"`
		UserAgent     *string `json:"userAgent,omitempty"`
		IPAddress     *string `json:"ipAddress,omitempty"`
		ExpiresAt     string  `json:"expiresAt"`
		LastUsedAt    string  `json:"lastUsedAt"`
		RevokedAt     *string `json:"revokedAt,omitempty"`
		CreatedAt     string  `json:"createdAt"`
	}
	resp := make([]sessionResponse, 0, len(items))
	for _, s := range items {
		resp = append(resp, sessionResponse{
			ID:         s.ID,
			UserAgent:  s.UserAgent,
			IPAddress:  s.IPAddress,
			ExpiresAt:  s.ExpiresAt.Format(http.TimeFormat),
			LastUsedAt: s.LastUsedAt.Format(http.TimeFormat),
			CreatedAt:  s.CreatedAt.Format(http.TimeFormat),
		})
	}
	utils.Success(c, http.StatusOK, gin.H{"items": resp})
}

func (h *AdminUserHandler) RevokeSession(c *gin.Context) {
	sessionId := c.Param("sessionId")
	if sessionId == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminUserService.RevokeSession(c.Request.Context(), sessionId); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"revoked": true})
}
