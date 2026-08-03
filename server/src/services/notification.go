package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type NotificationService struct {
	repos *Repositories
}

func NewNotificationService(repos *Repositories) *NotificationService {
	return &NotificationService{repos: repos}
}

type UpdateNotificationPreferencesReq struct {
	EmailEnabled *bool `json:"emailEnabled"`
	PushEnabled  *bool `json:"pushEnabled"`
	SoundEnabled *bool `json:"soundEnabled"`
	NewEpisodes  *bool `json:"newEpisodes"`
	News         *bool `json:"news"`
	Reminders    *bool `json:"reminders"`
}

func (s *NotificationService) Create(ctx context.Context, userID, nType, title, body, link string) (*models.Notification, error) {
	now := time.Now().UTC()
	notification := &models.Notification{
		Common:  models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		UserID:  userID,
		Type:    nType,
		Title:   title,
		Body:    body,
		Link:    link,
		Read:    false,
	}
	if err := s.repos.Notifications().Create(ctx, notification); err != nil {
		return nil, err
	}
	return notification, nil
}

func (s *NotificationService) List(ctx context.Context, userID string, unreadOnly bool, limit, offset int) ([]models.Notification, int64, error) {
	return s.repos.Notifications().ListByUser(ctx, userID, unreadOnly, limit, offset)
}

func (s *NotificationService) GetByID(ctx context.Context, id string) (*models.Notification, error) {
	return s.repos.Notifications().GetByID(ctx, id)
}

func (s *NotificationService) UnreadCount(ctx context.Context, userID string) (int64, error) {
	return s.repos.Notifications().UnreadCount(ctx, userID)
}

func (s *NotificationService) MarkRead(ctx context.Context, id string) error {
	return s.repos.Notifications().MarkRead(ctx, id)
}

func (s *NotificationService) MarkAllRead(ctx context.Context, userID string) error {
	return s.repos.Notifications().MarkAllRead(ctx, userID)
}

func (s *NotificationService) Delete(ctx context.Context, id string) error {
	return s.repos.Notifications().Delete(ctx, id)
}

func (s *NotificationService) GetPreferences(ctx context.Context, userID string) (*models.NotificationPreference, error) {
	return s.repos.NotificationPreferences().GetByUserID(ctx, userID)
}

func (s *NotificationService) UpdatePreferences(ctx context.Context, userID string, req UpdateNotificationPreferencesReq) (*models.NotificationPreference, error) {
	prefs, err := s.repos.NotificationPreferences().GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if req.EmailEnabled != nil {
		prefs.EmailNotifications = *req.EmailEnabled
	}
	if req.PushEnabled != nil {
		prefs.DesktopNotifications = *req.PushEnabled
	}
	if req.SoundEnabled != nil {
		prefs.SoundEnabled = *req.SoundEnabled
	}
	if req.NewEpisodes != nil {
		prefs.MeetingReminders = *req.NewEpisodes
	}
	if req.News != nil {
		prefs.ChannelMessageNotifications = *req.News
	}
	if req.Reminders != nil {
		prefs.MentionNotifications = *req.Reminders
	}
	if err := s.repos.NotificationPreferences().Upsert(ctx, prefs); err != nil {
		return nil, err
	}
	return prefs, nil
}
