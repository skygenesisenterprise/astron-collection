package routes

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/middleware"
	"github.com/skygenesisenterprise/astron-collection/server/src/services"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

type astronHandler struct {
	deps Dependencies
}

func NewAstronHandler(deps Dependencies) *astronHandler {
	return &astronHandler{deps: deps}
}

func (h *astronHandler) principal(c *gin.Context) interfaces.Principal {
	p, _ := middleware.PrincipalFromGin(c)
	return p
}

func (h *astronHandler) workspaceID(c *gin.Context) string {
	return c.Param("workspaceId")
}

func (h *astronHandler) listBots(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.BotService.List(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Query("status"), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) createBot(c *gin.Context) {
	var req services.CreateBotInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	result, err := h.deps.BotService.Create(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, result)
}

func (h *astronHandler) getBot(c *gin.Context) {
	item, err := h.deps.BotService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) updateBot(c *gin.Context) {
	var req services.UpdateBotInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.BotService.Update(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId"), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) deleteBot(c *gin.Context) {
	if err := h.deps.BotService.Delete(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *astronHandler) rotateBotSecret(c *gin.Context) {
	result, err := h.deps.BotService.RotateSecret(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, result)
}

func (h *astronHandler) botHeartbeat(c *gin.Context) {
	var req services.BotHeartbeatInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	bot, err := h.deps.BotService.Heartbeat(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId"), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, bot)
}

func (h *astronHandler) listBotHeartbeats(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.BotService.ListHeartbeats(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("botId"), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) listApiKeys(c *gin.Context) {
	items, err := h.deps.ApiKeyService.List(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *astronHandler) createApiKey(c *gin.Context) {
	var req services.CreateApiKeyInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	result, err := h.deps.ApiKeyService.Create(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, result)
}

func (h *astronHandler) getApiKey(c *gin.Context) {
	item, err := h.deps.ApiKeyService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("keyId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) deleteApiKey(c *gin.Context) {
	if err := h.deps.ApiKeyService.Delete(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("keyId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *astronHandler) revokeApiKey(c *gin.Context) {
	if err := h.deps.ApiKeyService.Revoke(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("keyId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"revoked": true})
}

func (h *astronHandler) listLogs(c *gin.Context) {
	limit, offset := paginationParams(c)
	query := services.LogQuery{
		BotID:  c.Query("botId"),
		Level:  c.Query("level"),
		Source: c.Query("source"),
		Limit:  limit,
		Offset: offset,
	}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse(time.RFC3339, from); err == nil {
			query.From = &t
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse(time.RFC3339, to); err == nil {
			query.To = &t
		}
	}
	items, total, err := h.deps.LogService.List(c.Request.Context(), h.principal(c), h.workspaceID(c), query)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) ingestLogs(c *gin.Context) {
	var req struct {
		BotID   string                         `json:"botId"`
		Entries []services.CreateLogEntryInput `json:"entries"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	count, err := h.deps.LogService.Ingest(c.Request.Context(), h.principal(c), h.workspaceID(c), req.BotID, req.Entries)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, gin.H{"ingested": count})
}

func (h *astronHandler) logStats(c *gin.Context) {
	stats, err := h.deps.LogService.Stats(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, stats)
}

func (h *astronHandler) getLog(c *gin.Context) {
	item, err := h.deps.LogService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("logId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) listProtectRules(c *gin.Context) {
	items, err := h.deps.ProtectService.ListRules(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Query("module"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *astronHandler) createProtectRule(c *gin.Context) {
	var req services.CreateProtectRuleInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.ProtectService.CreateRule(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) getProtectRule(c *gin.Context) {
	item, err := h.deps.ProtectService.GetRule(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("ruleId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) updateProtectRule(c *gin.Context) {
	var req services.UpdateProtectRuleInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.ProtectService.UpdateRule(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("ruleId"), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) enableProtectRule(c *gin.Context) {
	item, err := h.deps.ProtectService.SetRuleEnabled(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("ruleId"), true)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) disableProtectRule(c *gin.Context) {
	item, err := h.deps.ProtectService.SetRuleEnabled(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("ruleId"), false)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) deleteProtectRule(c *gin.Context) {
	if err := h.deps.ProtectService.DeleteRule(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("ruleId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *astronHandler) listProtectEvents(c *gin.Context) {
	limit, offset := paginationParams(c)
	filter := interfaces.ProtectEventFilter{
		BotID:     c.Query("botId"),
		RuleID:    c.Query("ruleId"),
		EventType: c.Query("eventType"),
		Severity:  c.Query("severity"),
	}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse(time.RFC3339, from); err == nil {
			filter.From = &t
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse(time.RFC3339, to); err == nil {
			filter.To = &t
		}
	}
	items, total, err := h.deps.ProtectService.ListEvents(c.Request.Context(), h.principal(c), h.workspaceID(c), filter, limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) ingestProtectEvents(c *gin.Context) {
	var req struct {
		Events []services.CreateProtectEventInput `json:"events"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	count, err := h.deps.ProtectService.IngestEvents(c.Request.Context(), h.principal(c), h.workspaceID(c), req.Events)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, gin.H{"ingested": count})
}

func (h *astronHandler) getProtectEvent(c *gin.Context) {
	item, err := h.deps.ProtectService.GetEvent(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("eventId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) listPlayerSessions(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.PlayerService.ListSessions(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Query("botId"), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) startPlayerSession(c *gin.Context) {
	var req services.StartSessionInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.PlayerService.StartSession(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) getPlayerSession(c *gin.Context) {
	item, err := h.deps.PlayerService.GetSession(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("sessionId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) endPlayerSession(c *gin.Context) {
	item, err := h.deps.PlayerService.EndSession(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("sessionId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) reportPlayback(c *gin.Context) {
	var req services.ReportPlaybackInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.PlayerService.ReportPlayback(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) updatePlaybackState(c *gin.Context) {
	var req struct {
		State    string `json:"state"`
		Position int    `json:"position"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.PlayerService.UpdateState(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("sessionId"), req.State, req.Position); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}

func (h *astronHandler) latestPlayback(c *gin.Context) {
	item, err := h.deps.PlayerService.LatestBySession(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("sessionId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) listPlaybacks(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.PlayerService.ListPlaybacks(c.Request.Context(), h.principal(c), h.workspaceID(c), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) listWebhooks(c *gin.Context) {
	items, err := h.deps.WebhookService.List(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *astronHandler) createWebhook(c *gin.Context) {
	var req services.CreateWebhookInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.WebhookService.Create(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) getWebhook(c *gin.Context) {
	item, err := h.deps.WebhookService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("webhookId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) updateWebhook(c *gin.Context) {
	var req services.UpdateWebhookInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.WebhookService.Update(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("webhookId"), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) deleteWebhook(c *gin.Context) {
	if err := h.deps.WebhookService.Delete(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("webhookId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *astronHandler) listWebhookDeliveries(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.WebhookService.ListDeliveries(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("webhookId"), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) getWebhookDelivery(c *gin.Context) {
	item, err := h.deps.WebhookService.GetDelivery(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("webhookId"), c.Param("deliveryId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) getSubscription(c *gin.Context) {
	item, err := h.deps.BillingService.GetSubscription(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) createSubscription(c *gin.Context) {
	var req services.SubscriptionInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.BillingService.CreateSubscription(c.Request.Context(), h.principal(c), h.workspaceID(c), req.Plan)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) cancelSubscription(c *gin.Context) {
	item, err := h.deps.BillingService.CancelSubscription(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) getBillingInfo(c *gin.Context) {
	item, err := h.deps.BillingService.GetBillingInfo(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) updateBillingInfo(c *gin.Context) {
	var req struct {
		Email         string `json:"email"`
		Currency      string `json:"currency"`
		PaymentMethod string `json:"paymentMethod"`
		CustomerID    string `json:"customerId"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.BillingService.UpdateBillingInfo(c.Request.Context(), h.principal(c), h.workspaceID(c), req.Email, req.Currency, req.PaymentMethod, req.CustomerID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) listIntegrations(c *gin.Context) {
	items, err := h.deps.IntegrationService.List(c.Request.Context(), h.principal(c), h.workspaceID(c))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *astronHandler) createIntegration(c *gin.Context) {
	var req services.CreateIntegrationInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.IntegrationService.Create(c.Request.Context(), h.principal(c), h.workspaceID(c), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *astronHandler) getIntegration(c *gin.Context) {
	item, err := h.deps.IntegrationService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("integrationId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) updateIntegration(c *gin.Context) {
	var req services.UpdateIntegrationInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.IntegrationService.Update(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("integrationId"), req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *astronHandler) deleteIntegration(c *gin.Context) {
	if err := h.deps.IntegrationService.Delete(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("integrationId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *astronHandler) listAuditLogs(c *gin.Context) {
	limit, offset := paginationParams(c)
	items, total, err := h.deps.AuditLogService.List(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Query("action"), limit, offset)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", int64(offset+len(items)) < total)
}

func (h *astronHandler) getAuditLog(c *gin.Context) {
	item, err := h.deps.AuditLogService.Get(c.Request.Context(), h.principal(c), h.workspaceID(c), c.Param("entryId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}
