package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

type WebhookService struct {
	repos *Repositories
}

type CreateWebhookInput struct {
	Name   string   `json:"name"`
	URL    string   `json:"url"`
	Events []string `json:"events,omitempty"`
	Secret string   `json:"secret,omitempty"`
}

type UpdateWebhookInput struct {
	Name    *string   `json:"name,omitempty"`
	URL     *string   `json:"url,omitempty"`
	Events  *[]string `json:"events,omitempty"`
	Secret  *string   `json:"secret,omitempty"`
	Enabled *bool     `json:"enabled,omitempty"`
}

func NewWebhookService(repos *Repositories) *WebhookService {
	return &WebhookService{repos: repos}
}

func (s *WebhookService) Create(ctx context.Context, principal interfaces.Principal, workspaceID string, input CreateWebhookInput) (*models.Webhook, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Webhook name is required.", map[string]any{"field": "name"})
	}
	url := strings.TrimSpace(input.URL)
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Webhook URL must start with http:// or https://.", map[string]any{"field": "url"})
	}
	now := time.Now().UTC()
	webhook := &models.Webhook{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		Name:        name,
		URL:         url,
		Events:      models.StringArray(normalizeScopes(input.Events)),
		Secret:      strings.TrimSpace(input.Secret),
		Enabled:     true,
	}
	if err := s.repos.Webhooks().Create(ctx, webhook); err != nil {
		return nil, err
	}
	return webhook, nil
}

func (s *WebhookService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.Webhook, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.Webhooks().List(ctx, workspaceID)
}

func (s *WebhookService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, webhookID string) (*models.Webhook, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	webhook, err := s.repos.Webhooks().GetByID(ctx, workspaceID, webhookID)
	if err != nil {
		return nil, normalizeNotFound(err, "WEBHOOK_NOT_FOUND")
	}
	return webhook, nil
}

func (s *WebhookService) Update(ctx context.Context, principal interfaces.Principal, workspaceID, webhookID string, input UpdateWebhookInput) (*models.Webhook, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	webhook, err := s.repos.Webhooks().GetByID(ctx, workspaceID, webhookID)
	if err != nil {
		return nil, normalizeNotFound(err, "WEBHOOK_NOT_FOUND")
	}
	if input.Name != nil {
		webhook.Name = strings.TrimSpace(*input.Name)
	}
	if input.URL != nil {
		url := strings.TrimSpace(*input.URL)
		if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
			return nil, utils.NewError(400, "VALIDATION_FAILED", "Webhook URL must start with http:// or https://.", map[string]any{"field": "url"})
		}
		webhook.URL = url
	}
	if input.Events != nil {
		webhook.Events = models.StringArray(normalizeScopes(*input.Events))
	}
	if input.Secret != nil {
		webhook.Secret = strings.TrimSpace(*input.Secret)
	}
	if input.Enabled != nil {
		webhook.Enabled = *input.Enabled
	}
	webhook.UpdatedAt = time.Now().UTC()
	if err := s.repos.Webhooks().Update(ctx, webhook); err != nil {
		return nil, err
	}
	return webhook, nil
}

func (s *WebhookService) Delete(ctx context.Context, principal interfaces.Principal, workspaceID, webhookID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	return s.repos.Webhooks().Delete(ctx, workspaceID, webhookID)
}

func (s *WebhookService) ListDeliveries(ctx context.Context, principal interfaces.Principal, workspaceID, webhookID string, limit, offset int) ([]models.WebhookDelivery, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	if _, err := s.repos.Webhooks().GetByID(ctx, workspaceID, webhookID); err != nil {
		return nil, 0, normalizeNotFound(err, "WEBHOOK_NOT_FOUND")
	}
	return s.repos.WebhookDeliveries().ListByWebhook(ctx, webhookID, limit, offset)
}

func (s *WebhookService) GetDelivery(ctx context.Context, principal interfaces.Principal, workspaceID, webhookID, deliveryID string) (*models.WebhookDelivery, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	delivery, err := s.repos.WebhookDeliveries().GetByID(ctx, webhookID, deliveryID)
	if err != nil {
		return nil, normalizeNotFound(err, "WEBHOOK_DELIVERY_NOT_FOUND")
	}
	return delivery, nil
}
