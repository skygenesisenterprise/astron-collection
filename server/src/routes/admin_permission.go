package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type AdminPermissionHandler struct {
	deps Dependencies
}

func NewAdminPermissionHandler(deps Dependencies) *AdminPermissionHandler {
	return &AdminPermissionHandler{deps: deps}
}

func (h *AdminPermissionHandler) GetMatrix(c *gin.Context) {
	items, err := h.deps.AdminPermissionService.GetMatrix(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

func (h *AdminPermissionHandler) UpdateRolePermissions(c *gin.Context) {
	roleID := c.Query("roleId")
	if roleID == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req services.UpdateRolePermissionsInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminPermissionService.UpdateRolePermissions(c.Request.Context(), roleID, req); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}

func (h *AdminPermissionHandler) GetEffectivePermissions(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	items, err := h.deps.AdminPermissionService.GetEffectivePermissions(c.Request.Context(), userID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}
