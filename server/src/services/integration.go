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

type IntegrationService struct {
	repos *Repositories
}

type CreateIntegrationInput struct {
	Type     string         `json:"type"`
	Name     string         `json:"name"`
	Status   string         `json:"status,omitempty"`
	Metadata datatypes.JSON `json:"metadata,omitempty"`
}

type UpdateIntegrationInput struct {
	Name     *string         `json:"name,omitempty"`
	Status   *string         `json:"status,omitempty"`
	Metadata *datatypes.JSON `json:"metadata,omitempty"`
}

func NewIntegrationService(repos *Repositories) *IntegrationService {
	return &IntegrationService{repos: repos}
}

func (s *IntegrationService) Create(ctx context.Context, principal interfaces.Principal, workspaceID string, input CreateIntegrationInput) (*models.Integration, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	typ := strings.TrimSpace(input.Type)
	if typ == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Integration type is required.", map[string]any{"field": "type"})
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		name = typ
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "connected"
	}
	now := time.Now().UTC()
	integration := &models.Integration{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		Type:        typ,
		Name:        name,
		Status:      status,
		Metadata:    input.Metadata,
	}
	if err := s.repos.Integrations().Create(ctx, integration); err != nil {
		return nil, err
	}
	return integration, nil
}

func (s *IntegrationService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.Integration, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.Integrations().List(ctx, workspaceID)
}

func (s *IntegrationService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, integrationID string) (*models.Integration, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	integration, err := s.repos.Integrations().GetByID(ctx, workspaceID, integrationID)
	if err != nil {
		return nil, normalizeNotFound(err, "INTEGRATION_NOT_FOUND")
	}
	return integration, nil
}

func (s *IntegrationService) Update(ctx context.Context, principal interfaces.Principal, workspaceID, integrationID string, input UpdateIntegrationInput) (*models.Integration, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	integration, err := s.repos.Integrations().GetByID(ctx, workspaceID, integrationID)
	if err != nil {
		return nil, normalizeNotFound(err, "INTEGRATION_NOT_FOUND")
	}
	if input.Name != nil {
		integration.Name = strings.TrimSpace(*input.Name)
	}
	if input.Status != nil {
		integration.Status = strings.TrimSpace(*input.Status)
	}
	if input.Metadata != nil {
		integration.Metadata = *input.Metadata
	}
	integration.UpdatedAt = time.Now().UTC()
	if err := s.repos.Integrations().Update(ctx, integration); err != nil {
		return nil, err
	}
	return integration, nil
}

func (s *IntegrationService) Delete(ctx context.Context, principal interfaces.Principal, workspaceID, integrationID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	return s.repos.Integrations().Delete(ctx, workspaceID, integrationID)
}
