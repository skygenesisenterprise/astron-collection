package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

type ApiKeyService struct {
	repos *Repositories
}

type CreateApiKeyInput struct {
	Name      string     `json:"name"`
	Scopes    []string   `json:"scopes,omitempty"`
	ExpiresAt *time.Time `json:"expiresAt,omitempty"`
}

type ApiKeySecretDTO struct {
	Key    *models.ApiKey `json:"key"`
	Secret string         `json:"secret"`
}

func NewApiKeyService(repos *Repositories) *ApiKeyService {
	return &ApiKeyService{repos: repos}
}

func (s *ApiKeyService) Create(ctx context.Context, principal interfaces.Principal, workspaceID string, input CreateApiKeyInput) (*ApiKeySecretDTO, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "API key name is required.", map[string]any{"field": "name"})
	}
	scopes := normalizeScopes(input.Scopes)
	if err := validScopesSet(scopes); err != nil {
		return nil, err
	}
	if input.ExpiresAt != nil && input.ExpiresAt.Before(time.Now().UTC()) {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Expiry must be in the future.", map[string]any{"field": "expiresAt"})
	}
	secret := generateSecret("ast", 48)
	now := time.Now().UTC()
	key := &models.ApiKey{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		Name:        name,
		Prefix:      strings.SplitN(secret, "_", 2)[0],
		Hash:        hashSecret(secret),
		Scopes:      models.StringArray(scopes),
		CreatedByID: principal.UserID,
		ExpiresAt:   input.ExpiresAt,
	}
	if err := s.repos.ApiKeys().Create(ctx, key); err != nil {
		return nil, err
	}
	return &ApiKeySecretDTO{Key: key, Secret: secret}, nil
}

func (s *ApiKeyService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.ApiKey, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.ApiKeys().List(ctx, workspaceID)
}

func (s *ApiKeyService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, keyID string) (*models.ApiKey, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	key, err := s.repos.ApiKeys().GetByID(ctx, workspaceID, keyID)
	if err != nil {
		return nil, normalizeNotFound(err, "API_KEY_NOT_FOUND")
	}
	return key, nil
}

func (s *ApiKeyService) Delete(ctx context.Context, principal interfaces.Principal, workspaceID, keyID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	return s.repos.ApiKeys().Delete(ctx, workspaceID, keyID)
}

func (s *ApiKeyService) Revoke(ctx context.Context, principal interfaces.Principal, workspaceID, keyID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	key, err := s.repos.ApiKeys().GetByID(ctx, workspaceID, keyID)
	if err != nil {
		return normalizeNotFound(err, "API_KEY_NOT_FOUND")
	}
	now := time.Now().UTC()
	key.RevokedAt = &now
	key.UpdatedAt = now
	return s.repos.ApiKeys().Update(ctx, key)
}

func (s *ApiKeyService) Authenticate(ctx context.Context, secret string) (*models.ApiKey, error) {
	secret = strings.TrimSpace(secret)
	if secret == "" {
		return nil, utils.ErrUnauthorized
	}
	key, err := s.repos.ApiKeys().GetByHash(ctx, hashSecret(secret))
	if err != nil {
		return nil, utils.ErrUnauthorized
	}
	if key.RevokedAt != nil {
		return nil, utils.ErrUnauthorized
	}
	if key.ExpiresAt != nil && key.ExpiresAt.Before(time.Now().UTC()) {
		return nil, utils.ErrUnauthorized
	}
	if err := s.repos.ApiKeys().Touch(ctx, key.ID, time.Now().UTC()); err != nil {
		return nil, err
	}
	return key, nil
}

func (s *ApiKeyService) RequiresScope(key *models.ApiKey, scope string) bool {
	if key == nil {
		return false
	}
	for _, granted := range key.Scopes {
		if granted == scope || granted == "*" {
			return true
		}
	}
	return false
}
