package models

import "time"

type Subscription struct {
	Common
	WorkspaceID        string    `gorm:"column:workspace_id;type:text;uniqueIndex;not null" json:"workspaceId"`
	Plan               string    `gorm:"column:plan;type:text;not null;default:'free'" json:"plan"`
	Status             string    `gorm:"column:status;type:text;not null;default:'active'" json:"status"`
	CurrentPeriodStart time.Time `gorm:"column:current_period_start" json:"currentPeriodStart"`
	CurrentPeriodEnd   time.Time `gorm:"column:current_period_end" json:"currentPeriodEnd"`
	CancelAtPeriodEnd  bool      `gorm:"column:cancel_at_period_end;not null;default:false" json:"cancelAtPeriodEnd"`
}

func (Subscription) TableName() string { return "subscriptions" }

type BillingInfo struct {
	Common
	WorkspaceID   string `gorm:"column:workspace_id;type:text;uniqueIndex;not null" json:"workspaceId"`
	CustomerID    string `gorm:"column:customer_id;type:text" json:"customerId,omitempty"`
	Email         string `gorm:"column:email;type:text" json:"email,omitempty"`
	Currency      string `gorm:"column:currency;type:text;not null;default:'EUR'" json:"currency"`
	PaymentMethod string `gorm:"column:payment_method;type:text" json:"paymentMethod,omitempty"`
}

func (BillingInfo) TableName() string { return "billing_infos" }
