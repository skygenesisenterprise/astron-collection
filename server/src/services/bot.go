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

type BotService struct {
	repos *Repositories
}

type CreateBotInput struct {
	Name              string         `json:"name"`
	Description       string         `json:"description,omitempty"`
	AvatarURL         *string        `json:"avatarUrl,omitempty"`
	Prefix            string         `json:"prefix,omitempty"`
	Status            string         `json:"status,omitempty"`
	Version           string         `json:"version,omitempty"`
	HeartbeatInterval int            `json:"heartbeatInterval,omitempty"`
	Config            datatypes.JSON `json:"config,omitempty"`
}

type UpdateBotInput struct {
	Name              *string         `json:"name,omitempty"`
	Description       *string         `json:"description,omitempty"`
	AvatarURL         *string         `json:"avatarUrl,omitempty"`
	Prefix            *string         `json:"prefix,omitempty"`
	Status            *string         `json:"status,omitempty"`
	Version           *string         `json:"version,omitempty"`
	HeartbeatInterval *int            `json:"heartbeatInterval,omitempty"`
	Config            *datatypes.JSON `json:"config,omitempty"`
}

type BotSecretDTO struct {
	Bot    *models.Bot `json:"bot"`
	Secret string      `json:"secret"`
}

type BotHeartbeatInput struct {
	Status        string         `json:"status"`
	Version       string         `json:"version,omitempty"`
	MemoryBytes   int64          `json:"memoryBytes,omitempty"`
	CPUPercent    float64        `json:"cpuPercent,omitempty"`
	UptimeSeconds int64          `json:"uptimeSeconds,omitempty"`
	GuildCount    int            `json:"guildCount,omitempty"`
	Metadata      datatypes.JSON `json:"metadata,omitempty"`
}

func NewBotService(repos *Repositories) *BotService {
	return &BotService{repos: repos}
}

func (s *BotService) Create(ctx context.Context, principal interfaces.Principal, workspaceID string, input CreateBotInput) (*BotSecretDTO, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Bot name is required.", map[string]any{"field": "name"})
	}
	prefix := strings.TrimSpace(input.Prefix)
	if prefix == "" {
		prefix = "!"
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	interval := input.HeartbeatInterval
	if interval < 0 {
		interval = 60
	}
	if interval == 0 {
		interval = 60
	}
	secret := generateSecret("bot", 40)
	now := time.Now().UTC()
	bot := &models.Bot{
		Common:            models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID:       workspaceID,
		Name:              name,
		Description:       strings.TrimSpace(input.Description),
		AvatarURL:         input.AvatarURL,
		Prefix:            prefix,
		Status:            status,
		Version:           strings.TrimSpace(input.Version),
		SecretHash:        hashSecret(secret),
		HeartbeatInterval: interval,
		Config:            input.Config,
	}
	if err := s.repos.Bots().Create(ctx, bot); err != nil {
		return nil, err
	}
	return &BotSecretDTO{Bot: bot, Secret: secret}, nil
}

func (s *BotService) List(ctx context.Context, principal interfaces.Principal, workspaceID string, status string, limit, offset int) ([]models.Bot, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	return s.repos.Bots().List(ctx, workspaceID, status, limit, offset)
}

func (s *BotService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, botID string) (*models.Bot, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	bot, err := s.repos.Bots().GetByWorkspaceID(ctx, workspaceID, botID)
	if err != nil {
		return nil, normalizeNotFound(err, "BOT_NOT_FOUND")
	}
	return bot, nil
}

func (s *BotService) Update(ctx context.Context, principal interfaces.Principal, workspaceID, botID string, input UpdateBotInput) (*models.Bot, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	bot, err := s.repos.Bots().GetByWorkspaceID(ctx, workspaceID, botID)
	if err != nil {
		return nil, normalizeNotFound(err, "BOT_NOT_FOUND")
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, utils.NewError(400, "VALIDATION_FAILED", "Bot name cannot be empty.", map[string]any{"field": "name"})
		}
		bot.Name = name
	}
	if input.Description != nil {
		bot.Description = *input.Description
	}
	if input.AvatarURL != nil {
		bot.AvatarURL = input.AvatarURL
	}
	if input.Prefix != nil {
		bot.Prefix = strings.TrimSpace(*input.Prefix)
	}
	if input.Status != nil {
		bot.Status = strings.TrimSpace(*input.Status)
	}
	if input.Version != nil {
		bot.Version = strings.TrimSpace(*input.Version)
	}
	if input.HeartbeatInterval != nil {
		bot.HeartbeatInterval = *input.HeartbeatInterval
	}
	if input.Config != nil {
		bot.Config = *input.Config
	}
	bot.UpdatedAt = time.Now().UTC()
	if err := s.repos.Bots().Update(ctx, bot); err != nil {
		return nil, err
	}
	return bot, nil
}

func (s *BotService) Delete(ctx context.Context, principal interfaces.Principal, workspaceID, botID string) error {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	return s.repos.Bots().Delete(ctx, workspaceID, botID)
}

func (s *BotService) RotateSecret(ctx context.Context, principal interfaces.Principal, workspaceID, botID string) (*BotSecretDTO, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	bot, err := s.repos.Bots().GetByWorkspaceID(ctx, workspaceID, botID)
	if err != nil {
		return nil, normalizeNotFound(err, "BOT_NOT_FOUND")
	}
	secret := generateSecret("bot", 40)
	bot.SecretHash = hashSecret(secret)
	bot.UpdatedAt = time.Now().UTC()
	if err := s.repos.Bots().Update(ctx, bot); err != nil {
		return nil, err
	}
	return &BotSecretDTO{Bot: bot, Secret: secret}, nil
}

func (s *BotService) Heartbeat(ctx context.Context, principal interfaces.Principal, workspaceID, botID string, input BotHeartbeatInput) (*models.Bot, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	bot, err := s.repos.Bots().GetByWorkspaceID(ctx, workspaceID, botID)
	if err != nil {
		return nil, normalizeNotFound(err, "BOT_NOT_FOUND")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	now := time.Now().UTC()
	heartbeat := &models.BotHeartbeat{
		Common:        models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		BotID:         botID,
		Status:        status,
		Version:       strings.TrimSpace(input.Version),
		MemoryBytes:   input.MemoryBytes,
		CPUPercent:    input.CPUPercent,
		UptimeSeconds: input.UptimeSeconds,
		GuildCount:    input.GuildCount,
		Metadata:      input.Metadata,
	}
	if err := s.repos.BotHeartbeats().Create(ctx, heartbeat); err != nil {
		return nil, err
	}
	if err := s.repos.Bots().SetLastHeartbeat(ctx, botID, now, status); err != nil {
		return nil, err
	}
	bot.Status = status
	bot.LastHeartbeatAt = &now
	return bot, nil
}

func (s *BotService) ListHeartbeats(ctx context.Context, principal interfaces.Principal, workspaceID, botID string, limit, offset int) ([]models.BotHeartbeat, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	if _, err := s.repos.Bots().GetByWorkspaceID(ctx, workspaceID, botID); err != nil {
		return nil, 0, normalizeNotFound(err, "BOT_NOT_FOUND")
	}
	return s.repos.BotHeartbeats().ListByBot(ctx, botID, limit, offset)
}
