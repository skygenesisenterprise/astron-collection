package models

import "time"

type ApiKey struct {
	Common
	WorkspaceID string       `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Name        string       `gorm:"column:name;type:text;not null" json:"name"`
	Prefix      string       `gorm:"column:prefix;type:text;not null" json:"prefix"`
	Hash        string       `gorm:"column:hash;type:text;uniqueIndex;not null" json:"-"`
	Scopes      StringArray  `gorm:"column:scopes;type:text[]" json:"scopes"`
	CreatedByID string       `gorm:"column:created_by_id;type:text" json:"createdById,omitempty"`
	LastUsedAt  *time.Time   `gorm:"column:last_used_at" json:"lastUsedAt,omitempty"`
	ExpiresAt   *time.Time   `gorm:"column:expires_at;index" json:"expiresAt,omitempty"`
	RevokedAt   *time.Time   `gorm:"column:revoked_at;index" json:"revokedAt,omitempty"`
}

func (ApiKey) TableName() string { return "api_keys" }
