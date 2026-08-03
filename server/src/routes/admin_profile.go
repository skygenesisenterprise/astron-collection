package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type AdminProfileHandler struct {
	deps Dependencies
}

func NewAdminProfileHandler(deps Dependencies) *AdminProfileHandler {
	return &AdminProfileHandler{deps: deps}
}

func (h *AdminProfileHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	items, total, err := h.deps.AdminProfileService.List(c.Request.Context(), page, limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items, "total": total})
}

func (h *AdminProfileHandler) GetByUserID(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AdminProfileService.GetByUserID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AdminProfileHandler) Update(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req services.UpdateAdminProfileInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AdminProfileService.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AdminProfileHandler) Delete(c *gin.Context) {
	id := c.Param("userId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AdminProfileService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}
