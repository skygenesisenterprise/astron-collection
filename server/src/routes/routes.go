package routes

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	redisclient "github.com/skygenesisenterprise/astron-collection/server/internal/redis"
	"github.com/skygenesisenterprise/astron-collection/server/src/config"
	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/middleware"
	"github.com/skygenesisenterprise/astron-collection/server/src/services"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

type Dependencies struct {
	Config                   config.Config
	Logger                   *slog.Logger
	RuntimeRole              string
	Database                 interfaces.Database
	Redis                    *redisclient.Client
	EventBus                 interfaces.EventBus
	IdentityProvider         interfaces.IdentityProvider
	AuthService              *services.AuthService
	UserService              *services.UserService
	WorkspaceService         *services.WorkspaceService
	NotificationService      *services.NotificationService
	NotificationAdminService *services.NotificationAdminService
	MfaService               *services.MfaService
	BotService               *services.BotService
	ApiKeyService            *services.ApiKeyService
	LogService               *services.LogService
	ProtectService           *services.ProtectService
	PlayerService            *services.PlayerService
	WebhookService           *services.WebhookService
	BillingService           *services.BillingService
	IntegrationService       *services.IntegrationService
	AuditLogService          *services.AuditLogService
	Repos                    *services.Repositories
}

func SetupRoutes(router *gin.Engine, deps Dependencies) {
	handler := &apiHandler{deps: deps}
	astron := NewAstronHandler(deps)

	router.GET("/health/live", handler.live)
	router.GET("/health/ready", handler.ready)
	router.GET("/metrics", handler.metrics)

	api := router.Group("/api/v1")
	api.GET("/health", handler.health)
	api.GET("/ready", handler.ready)
	api.POST("/webhooks/:provider/:integrationId", handler.webhook)

	auth := api.Group("/auth")
	{
		auth.POST("/register", handler.register)
		auth.POST("/login", handler.login)
		auth.POST("/refresh", handler.refresh)
		auth.POST("/logout", handler.logout)
		auth.POST("/forgot-password", handler.forgotPassword)
		auth.POST("/reset-password", handler.resetPassword)
		auth.POST("/verify-email", handler.verifyEmail)
		auth.POST("/resend-verification", handler.resendVerification)

		authProtected := auth.Group("")
		authProtected.Use(middleware.Auth(deps.IdentityProvider))
		{
			authProtected.POST("/logout-all", handler.logoutAll)
			authProtected.POST("/change-password", handler.changePassword)
			authProtected.GET("/me", handler.authMe)
			authProtected.GET("/sessions", handler.listAuthSessions)
			authProtected.DELETE("/sessions/:sessionId", handler.deleteAuthSession)
			authProtected.POST("/ensure-first-user-admin", handler.ensureFirstUserIsAdmin)
			authProtected.GET("/first-user", handler.getFirstUserInfo)
			authProtected.POST("/ensure-user-owner", handler.ensureUserIsOwner)
		}

		mfaProtected := auth.Group("/mfa")
		mfaProtected.Use(middleware.Auth(deps.IdentityProvider))
		{
			mfaProtected.POST("/setup", handler.mfaSetup)
			mfaProtected.POST("/verify", handler.mfaVerify)
			mfaProtected.POST("/disable", handler.mfaDisable)
			mfaProtected.POST("/validate-login", handler.mfaValidateLogin)
			mfaProtected.POST("/recovery-codes", handler.mfaRecoveryCodes)
			mfaProtected.POST("/regenerate-recovery-codes", handler.mfaRegenerateRecoveryCodes)
		}
	}

	protected := api.Group("")
	protected.Use(middleware.Auth(deps.IdentityProvider))
	protected.Use(middleware.WorkspaceContext())
	{
		protected.GET("/me", handler.me)
		protected.PATCH("/me", handler.updateMe)
		protected.GET("/me/preferences", handler.getMyPreferences)
		protected.PUT("/me/preferences", handler.updateMyPreferences)

		protected.GET("/notifications", handler.listNotifications)
		protected.GET("/notifications/:notificationId", handler.getNotification)
		protected.PATCH("/notifications/:notificationId/read", handler.markNotificationRead)
		protected.POST("/notifications/read-all", handler.markAllNotificationsRead)
		protected.DELETE("/notifications/:notificationId", handler.deleteNotification)
		protected.GET("/notifications/unread-count", handler.unreadNotificationCount)
		protected.GET("/notifications/preferences", handler.getNotificationPreferences)
		protected.PUT("/notifications/preferences", handler.updateNotificationPreferences)

		protected.GET("/workspaces", handler.listWorkspaces)
		protected.POST("/workspaces", handler.createWorkspace)
		protected.GET("/workspaces/:workspaceId", handler.getWorkspace)
		protected.PATCH("/workspaces/:workspaceId", handler.updateWorkspace)
		protected.DELETE("/workspaces/:workspaceId", handler.deleteWorkspace)
		protected.GET("/workspaces/:workspaceId/members", handler.listWorkspaceMembers)
		protected.POST("/workspaces/:workspaceId/members", handler.createWorkspaceMember)
		protected.POST("/workspaces/:workspaceId/members/provision", handler.provisionWorkspaceUser)
		protected.PATCH("/workspaces/:workspaceId/members/:userId", handler.updateWorkspaceMember)
		protected.DELETE("/workspaces/:workspaceId/members/:userId", handler.deleteWorkspaceMember)

		workspace := protected.Group("/workspaces/:workspaceId")
		{
			workspace.GET("/bots", astron.listBots)
			workspace.POST("/bots", astron.createBot)
			workspace.GET("/bots/:botId", astron.getBot)
			workspace.PATCH("/bots/:botId", astron.updateBot)
			workspace.DELETE("/bots/:botId", astron.deleteBot)
			workspace.POST("/bots/:botId/rotate-secret", astron.rotateBotSecret)
			workspace.POST("/bots/:botId/heartbeat", astron.botHeartbeat)
			workspace.GET("/bots/:botId/heartbeats", astron.listBotHeartbeats)

			workspace.GET("/api-keys", astron.listApiKeys)
			workspace.POST("/api-keys", astron.createApiKey)
			workspace.GET("/api-keys/:keyId", astron.getApiKey)
			workspace.DELETE("/api-keys/:keyId", astron.deleteApiKey)
			workspace.POST("/api-keys/:keyId/revoke", astron.revokeApiKey)

			workspace.GET("/logs", astron.listLogs)
			workspace.POST("/logs", astron.ingestLogs)
			workspace.GET("/logs/stats", astron.logStats)
			workspace.GET("/logs/:logId", astron.getLog)

			workspace.GET("/protect/rules", astron.listProtectRules)
			workspace.POST("/protect/rules", astron.createProtectRule)
			workspace.GET("/protect/rules/:ruleId", astron.getProtectRule)
			workspace.PATCH("/protect/rules/:ruleId", astron.updateProtectRule)
			workspace.POST("/protect/rules/:ruleId/enable", astron.enableProtectRule)
			workspace.POST("/protect/rules/:ruleId/disable", astron.disableProtectRule)
			workspace.DELETE("/protect/rules/:ruleId", astron.deleteProtectRule)
			workspace.GET("/protect/events", astron.listProtectEvents)
			workspace.POST("/protect/events", astron.ingestProtectEvents)
			workspace.GET("/protect/events/:eventId", astron.getProtectEvent)

			workspace.GET("/player/sessions", astron.listPlayerSessions)
			workspace.POST("/player/sessions", astron.startPlayerSession)
			workspace.GET("/player/sessions/:sessionId", astron.getPlayerSession)
			workspace.POST("/player/sessions/:sessionId/end", astron.endPlayerSession)
			workspace.POST("/player/sessions/:sessionId/playback", astron.reportPlayback)
			workspace.PUT("/player/sessions/:sessionId/state", astron.updatePlaybackState)
			workspace.GET("/player/sessions/:sessionId/playback", astron.latestPlayback)
			workspace.GET("/player/playbacks", astron.listPlaybacks)

			workspace.GET("/webhooks", astron.listWebhooks)
			workspace.POST("/webhooks", astron.createWebhook)
			workspace.GET("/webhooks/:webhookId", astron.getWebhook)
			workspace.PATCH("/webhooks/:webhookId", astron.updateWebhook)
			workspace.DELETE("/webhooks/:webhookId", astron.deleteWebhook)
			workspace.GET("/webhooks/:webhookId/deliveries", astron.listWebhookDeliveries)
			workspace.GET("/webhooks/:webhookId/deliveries/:deliveryId", astron.getWebhookDelivery)

			workspace.GET("/billing/subscription", astron.getSubscription)
			workspace.POST("/billing/subscription", astron.createSubscription)
			workspace.POST("/billing/subscription/cancel", astron.cancelSubscription)
			workspace.GET("/billing/info", astron.getBillingInfo)
			workspace.PUT("/billing/info", astron.updateBillingInfo)

			workspace.GET("/integrations", astron.listIntegrations)
			workspace.POST("/integrations", astron.createIntegration)
			workspace.GET("/integrations/:integrationId", astron.getIntegration)
			workspace.PATCH("/integrations/:integrationId", astron.updateIntegration)
			workspace.DELETE("/integrations/:integrationId", astron.deleteIntegration)

			workspace.GET("/audit-logs", astron.listAuditLogs)
			workspace.GET("/audit-logs/:entryId", astron.getAuditLog)
		}
	}
}

type apiHandler struct {
	deps Dependencies
}

func (h *apiHandler) principal(c *gin.Context) (interfaces.Principal, bool) {
	return middleware.PrincipalFromGin(c)
}

func (h *apiHandler) live(c *gin.Context) {
	utils.Success(c, http.StatusOK, gin.H{
		"status":  "alive",
		"role":    h.runtimeRole(),
		"version": h.deps.Config.App.Version,
	})
}

func (h *apiHandler) runtimeRole() string {
	if h.deps.RuntimeRole == "" {
		return "api"
	}
	return h.deps.RuntimeRole
}

func (h *apiHandler) health(c *gin.Context) {
	status := "healthy"
	redisStatus := "disabled"
	if err := h.deps.Database.Ping(c.Request.Context()); err != nil {
		status = "degraded"
	}
	if h.deps.Redis != nil {
		redisHealth := h.deps.Redis.Health(c.Request.Context())
		redisStatus = string(redisHealth.Status)
		if redisHealth.Status != redisclient.StatusHealthy {
			status = "degraded"
		}
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   status,
		"database": "healthy",
		"redis":    redisStatus,
		"role":     h.runtimeRole(),
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	result := gin.H{"database": "healthy", "redis": "disabled"}
	if err := h.deps.Database.Ping(ctx); err != nil {
		result["database"] = "unhealthy"
		utils.Error(c, utils.ErrDependencyUnavailable)
		return
	}
	if h.deps.Config.Redis.Enabled {
		if h.deps.Redis == nil || !h.deps.Redis.IsAvailable() {
			if h.deps.Config.Redis.Required {
				result["redis"] = "unhealthy"
				utils.Error(c, utils.ErrDependencyUnavailable)
				return
			}
			result["redis"] = "unavailable"
		} else {
			result["redis"] = "healthy"
		}
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   "ready",
		"database": result["database"],
		"redis":    result["redis"],
		"role":     h.runtimeRole(),
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) me(c *gin.Context) {
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.GetMe(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":                user.ID,
		"email":             user.Email,
		"displayName":       user.DisplayName,
		"avatarUrl":         user.AvatarURL,
		"status":            user.Status,
		"presenceStatus":    "offline",
		"roles":             principal.Roles,
		"permissions":       principal.Permissions,
		"workspaceId":       principal.WorkspaceID,
		"createdAt":         user.CreatedAt,
		"updatedAt":         user.UpdatedAt,
		"lastSeenAt":        nil,
		"disabledAt":        user.DisabledAt,
		"emailVerifiedAt":   user.EmailVerifiedAt,
		"passwordChangedAt": user.PasswordChangedAt,
	})
}

func (h *apiHandler) updateMe(c *gin.Context) {
	var req struct {
		DisplayName string `json:"displayName"`
		AvatarURL   string `json:"avatarUrl"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.UpdateMe(c.Request.Context(), principal, req.DisplayName, req.AvatarURL, req.Status)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":                user.ID,
		"email":             user.Email,
		"displayName":       user.DisplayName,
		"avatarUrl":         user.AvatarURL,
		"status":            user.Status,
		"presenceStatus":    "offline",
		"roles":             principal.Roles,
		"permissions":       principal.Permissions,
		"workspaceId":       principal.WorkspaceID,
		"createdAt":         user.CreatedAt,
		"updatedAt":         user.UpdatedAt,
		"lastSeenAt":        nil,
		"disabledAt":        user.DisabledAt,
		"emailVerifiedAt":   user.EmailVerifiedAt,
		"passwordChangedAt": user.PasswordChangedAt,
	})
}

func (h *apiHandler) getMyPreferences(c *gin.Context) {
	principal, _ := h.principal(c)
	preferences, err := h.deps.UserService.GetPreferences(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, preferences)
}

func (h *apiHandler) updateMyPreferences(c *gin.Context) {
	var req services.UserPreferencesDTO
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	preferences, err := h.deps.UserService.UpdatePreferences(c.Request.Context(), principal, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, preferences)
}

func (h *apiHandler) listNotifications(c *gin.Context) {
	principal, _ := h.principal(c)
	limit, offset := paginationParams(c)
	unreadOnly := c.Query("unread") == "true"
	items, total, err := h.deps.NotificationService.List(c.Request.Context(), principal.UserID, unreadOnly, limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	hasMore := int64(offset+len(items)) < total
	utils.List(c, items, "", hasMore)
}

func (h *apiHandler) getNotification(c *gin.Context) {
	item, err := h.deps.NotificationService.GetByID(c.Request.Context(), c.Param("notificationId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *apiHandler) markNotificationRead(c *gin.Context) {
	if err := h.deps.NotificationService.MarkRead(c.Request.Context(), c.Param("notificationId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}

func (h *apiHandler) markAllNotificationsRead(c *gin.Context) {
	principal, _ := h.principal(c)
	if err := h.deps.NotificationService.MarkAllRead(c.Request.Context(), principal.UserID); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}

func (h *apiHandler) deleteNotification(c *gin.Context) {
	if err := h.deps.NotificationService.Delete(c.Request.Context(), c.Param("notificationId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *apiHandler) unreadNotificationCount(c *gin.Context) {
	principal, _ := h.principal(c)
	count, err := h.deps.NotificationService.UnreadCount(c.Request.Context(), principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"count": count})
}

func (h *apiHandler) getNotificationPreferences(c *gin.Context) {
	principal, _ := h.principal(c)
	preferences, err := h.deps.UserService.GetNotificationPreferences(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, preferences)
}

func (h *apiHandler) updateNotificationPreferences(c *gin.Context) {
	var req services.NotificationPreferencesDTO
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	preferences, err := h.deps.UserService.UpdateNotificationPreferences(c.Request.Context(), principal, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, preferences)
}

func (h *apiHandler) listWorkspaces(c *gin.Context) {
	principal, _ := h.principal(c)
	items, err := h.deps.WorkspaceService.List(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *apiHandler) createWorkspace(c *gin.Context) {
	var req struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.WorkspaceService.Create(c.Request.Context(), principal, req.Name, req.Slug, req.Description)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) getWorkspace(c *gin.Context)    { h.workspaceResource(c, "get") }
func (h *apiHandler) updateWorkspace(c *gin.Context) { h.workspaceResource(c, "update") }
func (h *apiHandler) deleteWorkspace(c *gin.Context) { h.workspaceResource(c, "delete") }

func (h *apiHandler) workspaceResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("workspaceId")
	switch action {
	case "get":
		item, err := h.deps.WorkspaceService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name, Description string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.Update(c.Request.Context(), principal, id, req.Name, req.Description)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.Archive(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) listWorkspaceMembers(c *gin.Context)   { h.membersResource(c, "list") }
func (h *apiHandler) createWorkspaceMember(c *gin.Context)  { h.membersResource(c, "create") }
func (h *apiHandler) provisionWorkspaceUser(c *gin.Context) { h.membersResource(c, "provision") }
func (h *apiHandler) updateWorkspaceMember(c *gin.Context)  { h.membersResource(c, "update") }
func (h *apiHandler) deleteWorkspaceMember(c *gin.Context)  { h.membersResource(c, "delete") }

func (h *apiHandler) membersResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.WorkspaceService.ListMembers(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct {
			UserID string `json:"userId"`
			Email  string `json:"email"`
			Role   string `json:"role"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.AddMember(c.Request.Context(), principal, workspaceID, req.UserID, req.Email, req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	case "provision":
		var req struct {
			Email             string `json:"email"`
			DisplayName       string `json:"displayName"`
			Role              string `json:"role"`
			TemporaryPassword string `json:"temporaryPassword"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.ProvisionWorkspaceUser(
			c.Request.Context(),
			principal,
			workspaceID,
			services.ProvisionWorkspaceUserInput{
				Email:             req.Email,
				DisplayName:       req.DisplayName,
				Role:              req.Role,
				TemporaryPassword: req.TemporaryPassword,
			},
		)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	case "update":
		var req struct{ Role string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.UpdateMember(c.Request.Context(), principal, workspaceID, c.Param("userId"), req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.RemoveMember(c.Request.Context(), principal, workspaceID, c.Param("userId")); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) metrics(c *gin.Context) {
	c.String(http.StatusOK, "")
}

func (h *apiHandler) webhook(c *gin.Context) {
	payload, _ := io.ReadAll(io.LimitReader(c.Request.Body, 1<<20))
	_ = payload
	utils.Success(c, http.StatusAccepted, gin.H{"accepted": true})
}

func paginationParams(c *gin.Context) (int, int) {
	limit := intQuery(c, "limit", 20)
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := intQuery(c, "offset", 0)
	if offset < 0 {
		offset = 0
	}
	return limit, offset
}

func intQuery(c *gin.Context, key string, fallback int) int {
	value := c.Query(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
