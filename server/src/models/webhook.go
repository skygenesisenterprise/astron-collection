package models

import (
	"time"

	"gorm.io/datatypes"
)

type Webhook struct {
	Common
	WorkspaceID string      `gorm:"column:workspace_id;type:text;index;not null" json:"workspaceId"`
	Name        string      `gorm:"column:name;type:text;not null" json:"name"`
	URL         string      `gorm:"column:url;type:text;not null" json:"url"`
	Events      StringArray `gorm:"column:events;type:text[]" json:"events"`
	Secret      string      `gorm:"column:secret;type:text" json:"-"`
	Enabled     bool        `gorm:"column:enabled;not null;default:true" json:"enabled"`
}

func (Webhook) TableName() string { return "webhooks" }

type WebhookDelivery struct {
	Common
	WebhookID    string         `gorm:"column:webhook_id;type:text;index;not null" json:"webhookId"`
	Event        string         `gorm:"column:event;type:text;not null" json:"event"`
	Payload      datatypes.JSON `gorm:"column:payload;type:jsonb" json:"payload,omitempty"`
	Status       string         `gorm:"column:status;type:text;index;not null;default:'pending'" json:"status"`
	Attempt      int            `gorm:"column:attempt;not null;default:0" json:"attempt"`
	StatusCode   int            `gorm:"column:status_code;not null;default:0" json:"statusCode,omitempty"`
	ResponseBody string         `gorm:"column:response_body;type:text" json:"responseBody,omitempty"`
	NextRetryAt  *time.Time     `gorm:"column:next_retry_at;index" json:"nextRetryAt,omitempty"`
}

func (WebhookDelivery) TableName() string { return "webhook_deliveries" }
