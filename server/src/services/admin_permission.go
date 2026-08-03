package services

import (
	"context"
	"encoding/json"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/datatypes"
)

type AdminPermissionService struct {
	repos *Repositories
}

func NewAdminPermissionService(repos *Repositories) *AdminPermissionService {
	return &AdminPermissionService{repos: repos}
}

type PermissionMatrixEntry struct {
	Resource string            `json:"resource"`
	Roles    map[string][]string `json:"roles"`
}

type RolePermission struct {
	Slug        string   `json:"slug"`
	Permissions []string `json:"permissions"`
}

type PermissionMatrixItem struct {
	Resource string           `json:"resource"`
	Roles    []RolePermission `json:"roles"`
}

func parsePermissions(data datatypes.JSON) map[string][]string {
	if data == nil {
		return nil
	}
	var perms map[string][]string
	if err := json.Unmarshal(data, &perms); err != nil {
		return nil
	}
	return perms
}

func (s *AdminPermissionService) GetMatrix(ctx context.Context) ([]PermissionMatrixItem, error) {
	roles, err := s.repos.Roles().List(ctx)
	if err != nil {
		return nil, err
	}

	resourceMap := make(map[string]map[string][]string)
	for _, role := range roles {
		perms := parsePermissions(role.Permissions)
		for resource, actions := range perms {
			if resourceMap[resource] == nil {
				resourceMap[resource] = make(map[string][]string)
			}
			resourceMap[resource][role.Slug] = actions
		}
	}

	var items []PermissionMatrixItem
	for resource, rolePerms := range resourceMap {
		var roleList []RolePermission
		for slug, actions := range rolePerms {
			roleList = append(roleList, RolePermission{Slug: slug, Permissions: actions})
		}
		items = append(items, PermissionMatrixItem{
			Resource: resource,
			Roles:    roleList,
		})
	}

	return items, nil
}

type UpdateRolePermissionsInput struct {
	Permissions map[string][]string `json:"permissions"`
}

func (s *AdminPermissionService) UpdateRolePermissions(ctx context.Context, roleID string, input UpdateRolePermissionsInput) error {
	role, err := s.repos.Roles().GetByID(ctx, roleID)
	if err != nil {
		return err
	}
	data, err := json.Marshal(input.Permissions)
	if err != nil {
		return err
	}
	role.Permissions = datatypes.JSON(data)
	role.UpdatedAt = time.Now().UTC()
	return s.repos.Roles().Update(ctx, role)
}

type EffectivePermission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

func (s *AdminPermissionService) GetEffectivePermissions(ctx context.Context, userID string) ([]EffectivePermission, error) {
	if _, err := s.repos.Users().GetByID(ctx, userID); err != nil {
		return nil, err
	}

	merged := make(map[string]map[string]bool)

	userRoles, err := s.repos.UserRoles().ListByUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	for _, ur := range userRoles {
		role, err := s.repos.Roles().GetByID(ctx, ur.RoleID)
		if err != nil {
			continue
		}
		perms := parsePermissions(role.Permissions)
		for resource, actions := range perms {
			if merged[resource] == nil {
				merged[resource] = make(map[string]bool)
			}
			for _, action := range actions {
				merged[resource][action] = true
			}
		}
	}

	var result []EffectivePermission
	for resource, actionSet := range merged {
		var actions []string
		for action := range actionSet {
			actions = append(actions, action)
		}
		result = append(result, EffectivePermission{
			Resource: resource,
			Actions:  actions,
		})
	}

	return result, nil
}

func (s *AdminPermissionService) ListByUser(ctx context.Context, userID string) ([]models.UserRole, error) {
	return s.repos.UserRoles().ListByUser(ctx, userID)
}
