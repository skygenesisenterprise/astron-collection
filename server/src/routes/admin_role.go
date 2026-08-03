package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type AdminRoleHandler struct {
	deps Dependencies
}

func NewAdminRoleHandler(deps Dependencies) *AdminRoleHandler {
	return &AdminRoleHandler{deps: deps}
}

func (h *AdminRoleHandler) List(c *gin.Context) {
	items, err := h.deps.AdminRoleService.List(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

func (h *AdminRoleHandler) GetByID(c *gin.Context) {
	id := c.Param("roleId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AdminRoleService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AdminRoleHandler) Create(c *gin.Context) {
	var req services.CreateRoleInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AdminRoleService.Create(c.Request.Context(), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *AdminRoleHandler) Update(c *gin.Context) {
	id := c.Param("roleId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req services.UpdateRoleInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AdminRoleService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AdminRoleHandler) Delete(c *gin.Context) {
	id := c.Param("roleId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminRoleService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *AdminRoleHandler) Assign(c *gin.Context) {
	id := c.Param("roleId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req struct {
		UserID string `json:"userId"`
	}
	if c.ShouldBindJSON(&req) != nil || req.UserID == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminRoleService.AssignToUser(c.Request.Context(), id, req.UserID); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, gin.H{"assigned": true})
}

func (h *AdminRoleHandler) Unassign(c *gin.Context) {
	id := c.Param("roleId")
	userID := c.Param("userId")
	if id == "" || userID == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminRoleService.RemoveFromUser(c.Request.Context(), id, userID); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"removed": true})
}
