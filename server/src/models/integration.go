package models

import "gorm.io/datatypes"

type Integration struct {
	Common
	WorkspaceID string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Type        string         `gorm:"column:type;type:text;index;not null" json:"type"`
	Name        string         `gorm:"column:name;type:text;not null" json:"name"`
	Status      string         `gorm:"column:status;type:text;not null;default:'connected'" json:"status"`
	Metadata    datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
}

func (Integration) TableName() string { return "integrations" }
