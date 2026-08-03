package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type NotificationAdminService struct {
	repos *Repositories
}

func NewNotificationAdminService(repos *Repositories) *NotificationAdminService {
	return &NotificationAdminService{repos: repos}
}

func (s *NotificationAdminService) ListTemplates(ctx context.Context) ([]models.NotificationTemplate, error) {
	return s.repos.NotificationTemplates().List(ctx)
}

func (s *NotificationAdminService) CreateTemplate(ctx context.Context, typ, subject, body string, isHTML bool) (*models.NotificationTemplate, error) {
	tmpl := &models.NotificationTemplate{
		Common:  models.Common{ID: utils.NewID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Type:    typ,
		Subject: subject,
		Body:    body,
		IsHtml:  isHTML,
	}
	if err := s.repos.NotificationTemplates().Create(ctx, tmpl); err != nil {
		return nil, err
	}
	return tmpl, nil
}

func (s *NotificationAdminService) UpdateTemplate(ctx context.Context, id string, subject, body *string, isHTML *bool) (*models.NotificationTemplate, error) {
	tmpl, err := s.repos.NotificationTemplates().GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if subject != nil {
		tmpl.Subject = *subject
	}
	if body != nil {
		tmpl.Body = *body
	}
	if isHTML != nil {
		tmpl.IsHtml = *isHTML
	}
	tmpl.UpdatedAt = time.Now()
	if err := s.repos.NotificationTemplates().Update(ctx, tmpl); err != nil {
		return nil, err
	}
	return tmpl, nil
}

func (s *NotificationAdminService) DeleteTemplate(ctx context.Context, id string) error {
	return s.repos.NotificationTemplates().Delete(ctx, id)
}

func (s *NotificationAdminService) Send(ctx context.Context, typ, title, body string, targetUserIDs []string) (int, error) {
	if len(targetUserIDs) == 0 {
		return 0, nil
	}
	for _, userID := range targetUserIDs {
		notif := &models.Notification{
			Common: models.Common{ID: utils.NewID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			UserID: userID,
			Type:   typ,
			Title:  title,
			Body:   body,
		}
		if err := s.repos.Notifications().Create(ctx, notif); err != nil {
			return 0, err
		}
	}
	return len(targetUserIDs), nil
}

func (s *NotificationAdminService) GetHistory(ctx context.Context, page, limit int) ([]models.Notification, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	var items []models.Notification
	var total int64
	db := s.repos.db.WithContext(ctx).Model(&models.Notification{})
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}
