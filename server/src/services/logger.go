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

type LogService struct {
	repos *Repositories
}

type CreateLogEntryInput struct {
	Level     string         `json:"level"`
	Source    string         `json:"source,omitempty"`
	Message   string         `json:"message"`
	Metadata  datatypes.JSON `json:"metadata,omitempty"`
	Timestamp *time.Time     `json:"timestamp,omitempty"`
}

type LogQuery struct {
	BotID  string
	Level  string
	Source string
	From   *time.Time
	To     *time.Time
	Limit  int
	Offset int
}

func NewLogService(repos *Repositories) *LogService {
	return &LogService{repos: repos}
}

func (s *LogService) Ingest(ctx context.Context, principal interfaces.Principal, workspaceID, botID string, entries []CreateLogEntryInput) (int, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return 0, err
	}
	if len(entries) == 0 {
		return 0, nil
	}
	if len(entries) > 500 {
		return 0, utils.NewError(400, "PAYLOAD_TOO_LARGE", "A maximum of 500 log entries can be ingested at once.", nil)
	}
	now := time.Now().UTC()
	rows := make([]*models.LogEntry, 0, len(entries))
	for _, input := range entries {
		level := strings.ToLower(strings.TrimSpace(input.Level))
		if level == "" {
			level = "info"
		}
		message := strings.TrimSpace(input.Message)
		if message == "" {
			continue
		}
		ts := now
		if input.Timestamp != nil {
			ts = input.Timestamp.UTC()
		}
		rows = append(rows, &models.LogEntry{
			Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			WorkspaceID: workspaceID,
			BotID:       botID,
			Level:       level,
			Source:      strings.TrimSpace(input.Source),
			Message:     message,
			Metadata:    input.Metadata,
			Timestamp:   ts,
		})
	}
	if len(rows) == 0 {
		return 0, nil
	}
	if err := s.repos.LogEntries().CreateBatch(ctx, rows); err != nil {
		return 0, err
	}
	return len(rows), nil
}

func (s *LogService) List(ctx context.Context, principal interfaces.Principal, workspaceID string, query LogQuery) ([]models.LogEntry, int64, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, 0, err
	}
	filter := interfaces.LogEntryFilter{
		BotID:  query.BotID,
		Level:  strings.ToLower(query.Level),
		Source: query.Source,
		From:   query.From,
		To:     query.To,
	}
	return s.repos.LogEntries().List(ctx, workspaceID, filter, query.Limit, query.Offset)
}

func (s *LogService) Get(ctx context.Context, principal interfaces.Principal, workspaceID, entryID string) (*models.LogEntry, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	entry, err := s.repos.LogEntries().GetByID(ctx, workspaceID, entryID)
	if err != nil {
		return nil, normalizeNotFound(err, "LOG_ENTRY_NOT_FOUND")
	}
	return entry, nil
}

func (s *LogService) Stats(ctx context.Context, principal interfaces.Principal, workspaceID string) (interfaces.LogStats, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return interfaces.LogStats{}, err
	}
	return s.repos.LogEntries().Stats(ctx, workspaceID)
}
