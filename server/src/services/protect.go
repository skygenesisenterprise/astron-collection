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

type ProtectService struct {
	repos *Repositories
}

type CreateProtectRuleInput struct {
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	Module      string         `json:"module"`
	Action      string         `json:"action"`
	Config      datatypes.JSON `json:"config,omitempty"`
	Enabled     bool           `json:"enabled"`
	Priority    int            `json:"priority,omitempty"`
}

type UpdateProtectRuleInput struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	Module      *string         `json:"module,omitempty"`
	Action      *string         `json:"action,omitempty"`
	Config      *datatypes.JSON `json:"config,omitempty"`
	Enabled     *bool           `json:"enabled,omitempty"`
	Priority    *int            `json:"priority,omitempty"`
}

type CreateProtectEventInput struct {
	BotID     string         `json:"botId,omitempty"`
	RuleID    string         `json:"ruleId,omitempty"`
	EventType string         `json:"eventType"`
	Target    string         `json:"target,omitempty"`
	Severity  string         `json:"severity,omitempty"`
	Metadata  datatypes.JSON `json:"metadata,omitempty"`
}

func NewProtectService(repos *Repositories) *ProtectService {
	return &ProtectService{repos: repos}
}

func (s *ProtectService) CreateRule(ctx context.Context, principal interfaces.Principal, workspaceID string, input CreateProtectRuleInput) (*models.ProtectRule, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Rule name is required.", map[string]any{"field": "name"})
	}
	module := strings.TrimSpace(input.Module)
	if module == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Rule module is required.", map[string]any{"field": "module"})
	}
	action := strings.TrimSpace(input.Action)
	if action == "" {
		action = "block"
	}
	now := time.Now().UTC()
	rule := &models.ProtectRule{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		Name:        name,
		Description: strings.TrimSpace(input.Description),
		Module:      module,
		Action:      action,
		Config:      input.Config,
		Enabled:     input.Enabled,
		Priority:    input.Priority,
	}
	if err := s.repos.ProtectRules().Create(ctx, rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (s *ProtectService) ListRules(ctx context.Context, principal interfaces.Principal, workspaceID, module string) ([]models.ProtectRule, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.ProtectRules().List(ctx, workspaceID, module)
}

func (s *ProtectService) GetRule(ctx context.Context, principal interfaces.Principal, workspaceID, ruleID string) (*models.ProtectRule, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	rule, err := s.repos.ProtectRules().GetByID(ctx, workspaceID, ruleID)
	if err != nil {
		return nil, normalizeNotFound(err, "PROTECT_RULE_NOT_FOUND")
	}
	return rule, nil
}

func (s *ProtectService) UpdateRule(ctx context.Context, principal interfaces.Principal, workspaceID, ruleID string, input UpdateProtectRuleInput) (*models.ProtectRule, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	rule, err := s.repos.ProtectRules().GetByID(ctx, workspaceID, ruleID)
	if err != nil {
		return nil, normalizeNotFound(err, "PROTECT_RULE_NOT_FOUND")
	}
	if input.Name != nil {
		rule.Name = strings.TrimSpace(*input.Name)
	}
	if input.Description != nil {
		rule.Description = *input.Description
	}
	if input.Module != nil {
		rule.Module = strings.TrimSpace(*input.Module)
	}
	if input.Action != nil {
		rule.Action = strings.TrimSpace(*input.Action)
	}
	if input.Config != nil {
		rule.Config = *input.Config
	}
	if input.Enabled != nil {
		rule.Enabled = *input.Enabled
	}
	if input.Priority != nil {
		rule.Priority = *input.Priority
	}
	rule.UpdatedAt = time.Now().UTC()
	if err := s.repos.ProtectRules().Update(ctx, rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (s *ProtectService) SetRuleEnabled(ctx context.Context, principal interfaces.Principal, workspaceID, ruleID string, enabled bool) (*models.ProtectRule, error) {
	return s.UpdateRule(ctx, principal, workspaceID, ruleID, UpdateProtectRuleInput{Enabled: &enabled})
}

func (s *ProtectService) DeleteRule(ctx context.Context, principal interfaces.Principal, workspaceID, ruleID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	return s.repos.ProtectRules().Delete(ctx, workspaceID, ruleID)
}

func (s *ProtectService) IngestEvents(ctx context.Context, principal interfaces.Principal, workspaceID string, events []CreateProtectEventInput) (int, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return 0, err
	}
	if len(events) == 0 {
		return 0, nil
	}
	if len(events) > 500 {
		return 0, utils.NewError(400, "PAYLOAD_TOO_LARGE", "A maximum of 500 protect events can be ingested at once.", nil)
	}
	now := time.Now().UTC()
	rows := make([]*models.ProtectEvent, 0, len(events))
	for _, input := range events {
		eventType := strings.TrimSpace(input.EventType)
		if eventType == "" {
			continue
		}
		severity := strings.ToLower(strings.TrimSpace(input.Severity))
		if severity == "" {
			severity = "info"
		}
		rows = append(rows, &models.ProtectEvent{
			Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			WorkspaceID: workspaceID,
			BotID:       input.BotID,
			RuleID:      input.RuleID,
			EventType:   eventType,
			Target:      strings.TrimSpace(input.Target),
			Severity:    severity,
			Metadata:    input.Metadata,
		})
	}
	if len(rows) == 0 {
		return 0, nil
	}
	if err := s.repos.ProtectEvents().CreateBatch(ctx, rows); err != nil {
		return 0, err
	}
	return len(rows), nil
}

func (s *ProtectService) ListEvents(ctx context.Context, principal interfaces.Principal, workspaceID string, filter interfaces.ProtectEventFilter, limit, offset int) ([]models.ProtectEvent, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	return s.repos.ProtectEvents().List(ctx, workspaceID, filter, limit, offset)
}

func (s *ProtectService) GetEvent(ctx context.Context, principal interfaces.Principal, workspaceID, eventID string) (*models.ProtectEvent, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	event, err := s.repos.ProtectEvents().GetByID(ctx, workspaceID, eventID)
	if err != nil {
		return nil, normalizeNotFound(err, "PROTECT_EVENT_NOT_FOUND")
	}
	return event, nil
}
