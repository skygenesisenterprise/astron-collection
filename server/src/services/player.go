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

type PlayerService struct {
	repos *Repositories
}

type StartSessionInput struct {
	BotID    string         `json:"botId,omitempty"`
	UserKey  string         `json:"userKey,omitempty"`
	Source   string         `json:"source"`
	Metadata datatypes.JSON `json:"metadata,omitempty"`
}

type ReportPlaybackInput struct {
	SessionID string         `json:"sessionId"`
	TrackID   string         `json:"trackId,omitempty"`
	Title     string         `json:"title"`
	Artist    string         `json:"artist,omitempty"`
	Duration  int            `json:"duration,omitempty"`
	Position  int            `json:"position,omitempty"`
	State     string         `json:"state,omitempty"`
	Metadata  datatypes.JSON `json:"metadata,omitempty"`
}

func NewPlayerService(repos *Repositories) *PlayerService {
	return &PlayerService{repos: repos}
}

func (s *PlayerService) StartSession(ctx context.Context, principal interfaces.Principal, workspaceID string, input StartSessionInput) (*models.PlayerSession, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	source := strings.TrimSpace(input.Source)
	if source == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Session source is required.", map[string]any{"field": "source"})
	}
	now := time.Now().UTC()
	session := &models.PlayerSession{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		BotID:       input.BotID,
		UserKey:     strings.TrimSpace(input.UserKey),
		Source:      source,
		StartedAt:   now,
		Metadata:    input.Metadata,
	}
	if err := s.repos.PlayerSessions().Create(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *PlayerService) ListSessions(ctx context.Context, principal interfaces.Principal, workspaceID, botID string, limit, offset int) ([]models.PlayerSession, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	return s.repos.PlayerSessions().List(ctx, workspaceID, botID, limit, offset)
}

func (s *PlayerService) GetSession(ctx context.Context, principal interfaces.Principal, workspaceID, sessionID string) (*models.PlayerSession, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	session, err := s.repos.PlayerSessions().GetByID(ctx, workspaceID, sessionID)
	if err != nil {
		return nil, normalizeNotFound(err, "PLAYER_SESSION_NOT_FOUND")
	}
	return session, nil
}

func (s *PlayerService) EndSession(ctx context.Context, principal interfaces.Principal, workspaceID, sessionID string) (*models.PlayerSession, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	session, err := s.repos.PlayerSessions().GetByID(ctx, workspaceID, sessionID)
	if err != nil {
		return nil, normalizeNotFound(err, "PLAYER_SESSION_NOT_FOUND")
	}
	now := time.Now().UTC()
	if err := s.repos.PlayerSessions().End(ctx, sessionID, now); err != nil {
		return nil, err
	}
	session.EndedAt = &now
	return session, nil
}

func (s *PlayerService) ReportPlayback(ctx context.Context, principal interfaces.Principal, workspaceID string, input ReportPlaybackInput) (*models.PlayerPlayback, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	sessionID := strings.TrimSpace(input.SessionID)
	if sessionID == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Session ID is required.", map[string]any{"field": "sessionId"})
	}
	if _, err := s.repos.PlayerSessions().GetByID(ctx, workspaceID, sessionID); err != nil {
		return nil, normalizeNotFound(err, "PLAYER_SESSION_NOT_FOUND")
	}
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Playback title is required.", map[string]any{"field": "title"})
	}
	state := strings.TrimSpace(input.State)
	if state == "" {
		state = "playing"
	}
	now := time.Now().UTC()
	playback := &models.PlayerPlayback{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		SessionID:   sessionID,
		TrackID:     strings.TrimSpace(input.TrackID),
		Title:       title,
		Artist:      strings.TrimSpace(input.Artist),
		Duration:    input.Duration,
		Position:    input.Position,
		State:       state,
		Metadata:    input.Metadata,
	}
	if err := s.repos.PlayerPlaybacks().Create(ctx, playback); err != nil {
		return nil, err
	}
	return playback, nil
}

func (s *PlayerService) UpdateState(ctx context.Context, principal interfaces.Principal, workspaceID, sessionID, state string, position int) error {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return err
	}
	state = strings.TrimSpace(state)
	if state == "" {
		return utils.NewError(400, "VALIDATION_FAILED", "Playback state is required.", map[string]any{"field": "state"})
	}
	return s.repos.PlayerPlaybacks().UpsertState(ctx, workspaceID, sessionID, state, position)
}

func (s *PlayerService) LatestBySession(ctx context.Context, principal interfaces.Principal, workspaceID, sessionID string) (*models.PlayerPlayback, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	playback, err := s.repos.PlayerPlaybacks().GetLatestBySession(ctx, sessionID)
	if err != nil {
		return nil, normalizeNotFound(err, "PLAYBACK_NOT_FOUND")
	}
	return playback, nil
}

func (s *PlayerService) ListPlaybacks(ctx context.Context, principal interfaces.Principal, workspaceID string, limit, offset int) ([]models.PlayerPlayback, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	return s.repos.PlayerPlaybacks().ListByWorkspace(ctx, workspaceID, limit, offset)
}
