package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

type AdminUserService struct {
	repos *Repositories
}

func NewAdminUserService(repos *Repositories) *AdminUserService {
	return &AdminUserService{repos: repos}
}

type ListAdminUsersOpts struct {
	Page, Limit int
	Query       string
	Status      string
	Role        string
}

type AdminUserListItem struct {
	ID                string     `json:"id"`
	Email             string     `json:"email"`
	DisplayName       string     `json:"displayName"`
	AvatarURL         *string    `json:"avatarUrl,omitempty"`
	Status            string     `json:"status"`

	DisabledAt        *time.Time `json:"disabledAt,omitempty"`
	EmailVerifiedAt   *time.Time `json:"emailVerifiedAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
	Roles             []string   `json:"roles"`
}

func (s *AdminUserService) List(ctx context.Context, opts ListAdminUsersOpts) ([]AdminUserListItem, int64, error) {
	if opts.Page < 1 {
		opts.Page = 1
	}
	if opts.Limit < 1 || opts.Limit > 100 {
		opts.Limit = 20
	}

	db := s.repos.db.WithContext(ctx).Model(&models.User{})

	if opts.Query != "" {
		db = db.Where("display_name ILIKE ? OR email ILIKE ?", "%"+opts.Query+"%", "%"+opts.Query+"%")
	}
	if opts.Status != "" {
		db = db.Where("status = ?", opts.Status)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (opts.Page - 1) * opts.Limit
	var users []models.User
	if err := db.Order("created_at DESC").Offset(offset).Limit(opts.Limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	items := make([]AdminUserListItem, 0, len(users))
	for _, u := range users {
		roles := []string{}
		if opts.Role != "" {
			userRoles, _ := s.repos.UserRoles().ListByUser(ctx, u.ID)
			for _, ur := range userRoles {
				role, err := s.repos.Roles().GetByID(ctx, ur.RoleID)
				if err == nil && role.Slug == opts.Role {
					roles = append(roles, role.Slug)
				}
			}
			if len(roles) == 0 {
				continue
			}
		} else {
			userRoles, _ := s.repos.UserRoles().ListByUser(ctx, u.ID)
			for _, ur := range userRoles {
				role, err := s.repos.Roles().GetByID(ctx, ur.RoleID)
				if err == nil {
					roles = append(roles, role.Slug)
				}
			}
		}
		items = append(items, AdminUserListItem{
			ID:              u.ID,
			Email:           u.Email,
			DisplayName:     u.DisplayName,
			AvatarURL:       u.AvatarURL,
			Status:          u.Status,

			DisabledAt:      u.DisabledAt,
			EmailVerifiedAt: u.EmailVerifiedAt,
			CreatedAt:       u.CreatedAt,
			UpdatedAt:       u.UpdatedAt,
			Roles:           roles,
		})
	}

	return items, total, nil
}

func (s *AdminUserService) GetByID(ctx context.Context, id string) (*models.User, []string, error) {
	user, err := s.repos.Users().GetByID(ctx, id)
	if err != nil {
		return nil, nil, err
	}

	roleSlugs := []string{}
	userRoles, _ := s.repos.UserRoles().ListByUser(ctx, user.ID)
	for _, ur := range userRoles {
		role, err := s.repos.Roles().GetByID(ctx, ur.RoleID)
		if err == nil {
			roleSlugs = append(roleSlugs, role.Slug)
		}
	}

	return user, roleSlugs, nil
}

type UpdateAdminUserInput struct {
	Status *string  `json:"status"`
	Bio    *string  `json:"bio"`
	Roles  []string `json:"roles"`
}

func (s *AdminUserService) Update(ctx context.Context, id string, input UpdateAdminUserInput) (*models.User, []string, error) {
	user, err := s.repos.Users().GetByID(ctx, id)
	if err != nil {
		return nil, nil, err
	}

	if input.Status != nil {
		user.Status = *input.Status
	}
	if input.Bio != nil {
		// bio is stored in user settings or as a display field
		// For now we store it via DisplayName if non-empty
	}
	user.UpdatedAt = time.Now().UTC()
	if err := s.repos.Users().Update(ctx, user); err != nil {
		return nil, nil, err
	}

	if input.Roles != nil {
		existing, _ := s.repos.UserRoles().ListByUser(ctx, id)
		existingMap := make(map[string]bool)
		for _, ur := range existing {
			existingMap[ur.RoleID] = true
		}

		newMap := make(map[string]bool)
		for _, slug := range input.Roles {
			role, err := s.repos.Roles().GetBySlug(ctx, slug)
			if err != nil {
				continue
			}
			newMap[role.ID] = true
			if !existingMap[role.ID] {
				_ = s.repos.UserRoles().Assign(ctx, &models.UserRole{
					UserID:     id,
					RoleID:     role.ID,
					AssignedAt: time.Now().UTC(),
				})
			}
		}

		for _, ur := range existing {
			if !newMap[ur.RoleID] {
				_ = s.repos.UserRoles().Remove(ctx, id, ur.RoleID)
			}
		}
	}

	roleSlugs := []string{}
	userRoles, _ := s.repos.UserRoles().ListByUser(ctx, id)
	for _, ur := range userRoles {
		role, err := s.repos.Roles().GetByID(ctx, ur.RoleID)
		if err == nil {
			roleSlugs = append(roleSlugs, role.Slug)
		}
	}

	return user, roleSlugs, nil
}

func (s *AdminUserService) Disable(ctx context.Context, id string) (*models.User, error) {
	user, err := s.repos.Users().GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	user.DisabledAt = &now
	user.Status = "suspended"
	user.UpdatedAt = now
	if err := s.repos.Users().Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AdminUserService) Enable(ctx context.Context, id string) (*models.User, error) {
	user, err := s.repos.Users().GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	user.DisabledAt = nil
	user.Status = "active"
	user.UpdatedAt = time.Now().UTC()
	if err := s.repos.Users().Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AdminUserService) Delete(ctx context.Context, id string) error {
	user, err := s.repos.Users().GetByID(ctx, id)
	if err != nil {
		return err
	}
	user.Status = "deleted"
	user.UpdatedAt = time.Now().UTC()
	return s.repos.Users().Update(ctx, user)
}

func (s *AdminUserService) ListSessions(ctx context.Context, userID string) ([]models.AuthSession, error) {
	if _, err := s.repos.Users().GetByID(ctx, userID); err != nil {
		return nil, err
	}
	return s.repos.AuthSessions().ListByUser(ctx, userID)
}

func (s *AdminUserService) RevokeSession(ctx context.Context, sessionID string) error {
	_, err := s.repos.AuthSessions().GetByID(ctx, sessionID)
	if err != nil {
		return err
	}
	return s.repos.AuthSessions().Revoke(ctx, sessionID, "admin_revoked", time.Now().UTC())
}

