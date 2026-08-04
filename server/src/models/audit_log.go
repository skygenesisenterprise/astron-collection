package models

import "gorm.io/datatypes"

type AuditLog struct {
	Common
	WorkspaceID  string         `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	ActorID      string         `gorm:"column:actor_id;type:text;index" json:"actorId,omitempty"`
	Action       string         `gorm:"column:action;type:text;not null" json:"action"`
	ResourceType string         `gorm:"column:resource_type;type:text;not null" json:"resourceType"`
	ResourceID   string         `gorm:"column:resource_id;type:text" json:"resourceId,omitempty"`
	Metadata     datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
	IPAddress    string         `gorm:"column:ip_address;type:text" json:"ipAddress,omitempty"`
}

func (AuditLog) TableName() string { return "audit_logs" }
