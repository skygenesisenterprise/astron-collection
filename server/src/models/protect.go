package models

import "gorm.io/datatypes"

type ProtectRule struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Name        string         `gorm:"column:name;type:text;not null" json:"name"`
	Description string         `gorm:"column:description;type:text" json:"description,omitempty"`
	Module      string         `gorm:"column:module;type:text;index;not null" json:"module"`
	Action      string         `gorm:"column:action;type:text;not null" json:"action"`
	Config      datatypes.JSON `gorm:"column:config;type:jsonb" json:"config,omitempty"`
	Enabled     bool           `gorm:"column:enabled;not null;default:true" json:"enabled"`
	Priority    int            `gorm:"column:priority;not null;default:0" json:"priority"`
}

func (ProtectRule) TableName() string { return "protect_rules" }

type ProtectEvent struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	BotID       string         `gorm:"column:bot_id;type:text;index" json:"botId,omitempty"`
	RuleID      string         `gorm:"column:rule_id;type:text;index" json:"ruleId,omitempty"`
	EventType   string         `gorm:"column:event_type;type:text;index;not null" json:"eventType"`
	Target      string         `gorm:"column:target;type:text;index" json:"target,omitempty"`
	Severity    string         `gorm:"column:severity;type:text;not null;default:'info'" json:"severity"`
	Metadata    datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (ProtectEvent) TableName() string { return "protect_events" }
