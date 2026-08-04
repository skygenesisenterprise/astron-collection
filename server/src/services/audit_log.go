package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
	"gorm.io/datatypes"
)

type AuditLogService struct {
	repos *Repositories
}

type AuditLogInput struct {
	ActorID      string         `json:"actorId,omitempty"`
	Action       string         `json:"action"`
	ResourceType string         `json:"resourceType"`
	ResourceID   string         `json:"resourceId,omitempty"`
	Metadata     datatypes.JSON `json:"metadata,omitempty"`
	IPAddress    string         `json:"ipAddress,omitempty"`
}

func NewAuditLogService(repos *Repositories) *AuditLogService {
	return &AuditLogService{repos: repos}
}

func (s *AuditLogService) Record(ctx context.Context, workspaceID string, input AuditLogInput) (*models.AuditLog, error) {
	action := strings.TrimSpace(input.Action)
	if action == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Audit action is required.", map[string]any{"field": "action"})
	}
	resourceType := strings.TrimSpace(input.ResourceType)
	if resourceType == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Audit resource type is required.", map[string]any{"field": "resourceType"})
	}
	now := time.Now().UTC()
	entry := &models.AuditLog{
		Common:       models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID:  workspaceID,
		ActorID:      input.ActorID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   input.ResourceID,
		Metadata:     input.Metadata,
		IPAddress:    input.IPAddress,
	}
	if err := s.repos.AuditLogs().Create(ctx, entry); err != nil {
		return nil, err
	}
	return entry, nil
}

func (s *AuditLogService) List(ctx context.Context, principal interfaces.Principal, workspaceID, action string, limit, offset int) ([]models.AuditLog, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	return s.repos.AuditLogs().List(ctx, workspaceID, action, limit, offset)
}

func (s *AuditLogService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, entryID string) (*models.AuditLog, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	entry, err := s.repos.AuditLogs().GetByID(ctx, workspaceID, entryID)
	if err != nil {
		return nil, normalizeNotFound(err, "AUDIT_LOG_NOT_FOUND")
	}
	return entry, nil
}
