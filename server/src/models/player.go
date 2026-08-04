package models

import (
	"time"

	"gorm.io/datatypes"
)

type PlayerSession struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	BotID       string         `gorm:"column:bot_id;type:text;index" json:"botId,omitempty"`
	UserKey     string         `gorm:"column:user_key;type:text;index" json:"userKey,omitempty"`
	Source      string         `gorm:"column:source;type:text;index;not null" json:"source"`
	StartedAt   time.Time      `gorm:"column:started_at;not null" json:"startedAt"`
	EndedAt     *time.Time     `gorm:"column:ended_at" json:"endedAt,omitempty"`
	Metadata    datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (PlayerSession) TableName() string { return "player_sessions" }

type PlayerPlayback struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	SessionID   string         `gorm:"column:session_id;type:text;index;not null" json:"sessionId"`
	TrackID     string         `gorm:"column:track_id;type:text" json:"trackId,omitempty"`
	Title       string         `gorm:"column:title;type:text;not null" json:"title"`
	Artist      string         `gorm:"column:artist;type:text" json:"artist,omitempty"`
	Duration    int            `gorm:"column:duration;not null;default:0" json:"duration"`
	Position    int            `gorm:"column:position;not null;default:0" json:"position"`
	State       string         `gorm:"column:state;type:text;not null;default:'playing'" json:"state"`
	Metadata    datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (PlayerPlayback) TableName() string { return "player_playbacks" }
