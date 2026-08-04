package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Bot struct {
	Common
	Archivable
	WorkspaceID       string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Name              string         `gorm:"column:name;type:text;not null" json:"name"`
	Description       string         `gorm:"column:description;type:text" json:"description,omitempty"`
	AvatarURL         *string        `gorm:"column:avatar_url;type:text" json:"avatarUrl,omitempty"`
	Prefix            string         `gorm:"column:prefix;type:text;not null;default:'!'" json:"prefix"`
	Status            string         `gorm:"column:status;type:text;index;not null;default:'active'" json:"status"`
	Version           string         `gorm:"column:version;type:text" json:"version,omitempty"`
	SecretHash        string         `gorm:"column:secret_hash;type:text;not null" json:"-"`
	LastHeartbeatAt   *time.Time     `gorm:"column:last_heartbeat_at" json:"lastHeartbeatAt,omitempty"`
	HeartbeatInterval int            `gorm:"column:heartbeat_interval;not null;default:60" json:"heartbeatInterval"`
	InstallCount      int            `gorm:"column:install_count;not null;default:0" json:"installCount"`
	GuildCount        int            `gorm:"column:guild_count;not null;default:0" json:"guildCount"`
	Config            datatypes.JSON `gorm:"column:config;type:jsonb" json:"config,omitempty"`
	DeletedAt         gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Bot) TableName() string { return "bots" }

type BotHeartbeat struct {
	Common
	BotID         string         `gorm:"column:bot_id;type:text;index;not null" json:"botId"`
	Status        string         `gorm:"column:status;type:text;not null" json:"status"`
	Version       string         `gorm:"column:version;type:text" json:"version,omitempty"`
	MemoryBytes   int64          `gorm:"column:memory_bytes;not null;default:0" json:"memoryBytes"`
	CPUPercent    float64        `gorm:"column:cpu_percent;not null;default:0" json:"cpuPercent"`
	UptimeSeconds int64          `gorm:"column:uptime_seconds;not null;default:0" json:"uptimeSeconds"`
	GuildCount    int            `gorm:"column:guild_count;not null;default:0" json:"guildCount"`
	Metadata      datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (BotHeartbeat) TableName() string { return "bot_heartbeats" }
