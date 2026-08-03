package services

import (
	"context"
	"net/http"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
)

type AdminRoleService struct {
	repos *Repositories
}

func NewAdminRoleService(repos *Repositories) *AdminRoleService {
	return &AdminRoleService{repos: repos}
}

type AdminRoleItem struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Slug        string      `json:"slug"`
	Description string      `json:"description"`
	IsSystem    bool        `json:"isSystem"`
	Permissions interface{} `json:"permissions,omitempty"`
	MemberCount int64       `json:"memberCount"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
}

func toAdminRoleItem(role *models.Role, memberCount int64) *AdminRoleItem {
	var perms interface{}
	if role.Permissions != nil {
		perms = role.Permissions
	}
	return &AdminRoleItem{
		ID:          role.ID,
		Name:        role.Name,
		Slug:        role.Slug,
		Description: role.Description,
		IsSystem:    role.IsSystem,
		Permissions: perms,
		MemberCount: memberCount,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
	}
}

func (s *AdminRoleService) List(ctx context.Context) ([]AdminRoleItem, error) {
	roles, err := s.repos.Roles().List(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]AdminRoleItem, 0, len(roles))
	for _, role := range roles {
		count, _ := s.repos.UserRoles().CountByRole(ctx, role.ID)
		items = append(items, *toAdminRoleItem(&role, count))
	}
	return items, nil
}

func (s *AdminRoleService) GetByID(ctx context.Context, id string) (*AdminRoleItem, error) {
	role, err := s.repos.Roles().GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	count, _ := s.repos.UserRoles().CountByRole(ctx, role.ID)
	return toAdminRoleItem(role, count), nil
}

type CreateRoleInput struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

func (s *AdminRoleService) Create(ctx context.Context, input CreateRoleInput) (*AdminRoleItem, error) {
	if input.Name == "" {
		return nil, utils.ErrValidationFailed
	}
	slug := input.Slug
	if slug == "" {
		slug = generateSlug(input.Name)
	}
	now := time.Now().UTC()
	role := &models.Role{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Name:        input.Name,
		Slug:        slug,
		Description: input.Description,
		Permissions: datatypes.JSON([]byte("{}")),
	}
	if err := s.repos.Roles().Create(ctx, role); err != nil {
		return nil, err
	}
	return toAdminRoleItem(role, 0), nil
}

type UpdateRoleInput struct {
	Name        *string            `json:"name"`
	Slug        *string            `json:"slug"`
	Description *string            `json:"description"`
	Permissions datatypes.JSON     `json:"permissions"`
}

func (s *AdminRoleService) Update(ctx context.Context, id string, input UpdateRoleInput) (*AdminRoleItem, error) {
	role, err := s.repos.Roles().GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if input.Name != nil {
		role.Name = *input.Name
	}
	if input.Slug != nil {
		role.Slug = *input.Slug
	}
	if input.Description != nil {
		role.Description = *input.Description
	}
	if input.Permissions != nil {
		role.Permissions = input.Permissions
	}
	role.UpdatedAt = time.Now().UTC()
	if err := s.repos.Roles().Update(ctx, role); err != nil {
		return nil, err
	}
	count, _ := s.repos.UserRoles().CountByRole(ctx, role.ID)
	return toAdminRoleItem(role, count), nil
}

func (s *AdminRoleService) Delete(ctx context.Context, id string) error {
	role, err := s.repos.Roles().GetByID(ctx, id)
	if err != nil {
		return err
	}
	if role.IsSystem {
		return utils.NewError(http.StatusForbidden, "SYSTEM_ROLE", "System roles cannot be deleted.", nil)
	}
	count, _ := s.repos.UserRoles().CountByRole(ctx, id)
	if count > 0 {
		return utils.NewError(http.StatusConflict, "ROLE_IN_USE", "Cannot delete a role that is assigned to users.", nil)
	}
	return s.repos.Roles().Delete(ctx, id)
}

func (s *AdminRoleService) AssignToUser(ctx context.Context, roleID, userID string) error {
	if _, err := s.repos.Roles().GetByID(ctx, roleID); err != nil {
		return err
	}
	if _, err := s.repos.Users().GetByID(ctx, userID); err != nil {
		return err
	}
	existing, _ := s.repos.UserRoles().GetByUserAndRole(ctx, userID, roleID)
	if existing != nil {
		return nil
	}
	return s.repos.UserRoles().Assign(ctx, &models.UserRole{
		UserID:     userID,
		RoleID:     roleID,
		AssignedAt: time.Now().UTC(),
	})
}

func (s *AdminRoleService) RemoveFromUser(ctx context.Context, roleID, userID string) error {
	return s.repos.UserRoles().Remove(ctx, userID, roleID)
}
