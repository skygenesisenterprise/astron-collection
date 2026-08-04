package models

import (
	"time"

	"gorm.io/datatypes"
)

type LogEntry struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	BotID       string         `gorm:"column:bot_id;type:text;index;not null" json:"botId"`
	Level       string         `gorm:"column:level;type:text;index;not null" json:"level"`
	Source      string         `gorm:"column:source;type:text;index" json:"source,omitempty"`
	Message     string         `gorm:"column:message;type:text;not null" json:"message"`
	Metadata    datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
	Timestamp   time.Time      `gorm:"column:timestamp;index;not null" json:"timestamp"`
}

func (LogEntry) TableName() string { return "log_entries" }
