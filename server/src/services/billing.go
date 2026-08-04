package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

type BillingService struct {
	repos *Repositories
}

type SubscriptionInput struct {
	Plan  string `json:"plan"`
	Email string `json:"email,omitempty"`
}

func NewBillingService(repos *Repositories) *BillingService {
	return &BillingService{repos: repos}
}

func (s *BillingService) GetSubscription(ctx context.Context, principal interfaces.Principal, workspaceID string) (*models.Subscription, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	subscription, err := s.repos.Subscriptions().GetByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return nil, normalizeNotFound(err, "SUBSCRIPTION_NOT_FOUND")
	}
	return subscription, nil
}

func (s *BillingService) CreateSubscription(ctx context.Context, principal interfaces.Principal, workspaceID string, plan string) (*models.Subscription, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	plan = strings.ToLower(strings.TrimSpace(plan))
	if plan == "" {
		plan = "free"
	}
	switch plan {
	case "free", "starter", "pro", "enterprise":
	default:
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Unknown plan: "+plan, map[string]any{"field": "plan"})
	}
	now := time.Now().UTC()
	periodStart := now
	periodEnd := now.AddDate(0, 1, 0)
	subscription := &models.Subscription{
		Common:             models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID:        workspaceID,
		Plan:               plan,
		Status:             "active",
		CurrentPeriodStart: periodStart,
		CurrentPeriodEnd:   periodEnd,
	}
	if err := s.repos.Subscriptions().Upsert(ctx, subscription); err != nil {
		return nil, err
	}
	return subscription, nil
}

func (s *BillingService) CancelSubscription(ctx context.Context, principal interfaces.Principal, workspaceID string) (*models.Subscription, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	subscription, err := s.repos.Subscriptions().GetByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return nil, normalizeNotFound(err, "SUBSCRIPTION_NOT_FOUND")
	}
	subscription.CancelAtPeriodEnd = true
	subscription.UpdatedAt = time.Now().UTC()
	if err := s.repos.Subscriptions().Upsert(ctx, subscription); err != nil {
		return nil, err
	}
	return subscription, nil
}

func (s *BillingService) GetBillingInfo(ctx context.Context, principal interfaces.Principal, workspaceID string) (*models.BillingInfo, error) {
	if _, err := requireWorkspaceMember(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	info, err := s.repos.BillingInfos().GetByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return nil, normalizeNotFound(err, "BILLING_INFO_NOT_FOUND")
	}
	return info, nil
}

func (s *BillingService) UpdateBillingInfo(ctx context.Context, principal interfaces.Principal, workspaceID string, email, currency, paymentMethod, customerID string) (*models.BillingInfo, error) {
	if _, err := requireWorkspaceAdmin(ctx, s.repos, principal, workspaceID); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	info := &models.BillingInfo{
		Common:        models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID:   workspaceID,
		CustomerID:    strings.TrimSpace(customerID),
		Email:         strings.TrimSpace(email),
		Currency:      strings.ToUpper(strings.TrimSpace(currency)),
		PaymentMethod: strings.TrimSpace(paymentMethod),
	}
	if info.Currency == "" {
		info.Currency = "EUR"
	}
	if err := s.repos.BillingInfos().Upsert(ctx, info); err != nil {
		return nil, err
	}
	return info, nil
}
