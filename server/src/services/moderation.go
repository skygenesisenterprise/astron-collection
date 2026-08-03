package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type ModerationService struct {
	repos *Repositories
}

func NewModerationService(repos *Repositories) *ModerationService {
	return &ModerationService{repos: repos}
}

type ModerationItem struct {
	Type      string    `json:"type"`
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	UserID    string    `json:"userId"`
	Content   string    `json:"content,omitempty"`
	Reason    string    `json:"reason,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

func (s *ModerationService) GetQueue(ctx context.Context) ([]ModerationItem, error) {
	var items []ModerationItem

	flaggedReviews, err := s.repos.Reviews().ListFlagged(ctx)
	if err != nil {
		return nil, err
	}
	for _, r := range flaggedReviews {
		items = append(items, ModerationItem{
			Type:      "review",
			ID:        r.ID,
			Status:    "flagged",
			UserID:    r.UserID,
			Content:   r.Content,
			CreatedAt: r.CreatedAt,
		})
	}

	pendingReports, err := s.repos.Reports().ListPending(ctx)
	if err != nil {
		return nil, err
	}
	for _, r := range pendingReports {
		items = append(items, ModerationItem{
			Type:      "report",
			ID:        r.ID,
			Status:    "pending",
			UserID:    r.UserID,
			Reason:    r.Reason,
			CreatedAt: r.CreatedAt,
		})
	}

	return items, nil
}

func (s *ModerationService) GetItem(ctx context.Context, itemType, id string) (*ModerationItem, error) {
	switch itemType {
	case "review":
		r, err := s.repos.Reviews().GetByID(ctx, id)
		if err != nil {
			return nil, err
		}
		return &ModerationItem{Type: "review", ID: r.ID, Status: "flagged", UserID: r.UserID, Content: r.Content, CreatedAt: r.CreatedAt}, nil
	case "report":
		r, err := s.repos.Reports().GetByID(ctx, id)
		if err != nil {
			return nil, err
		}
		return &ModerationItem{Type: "report", ID: r.ID, Status: "pending", UserID: r.UserID, Reason: r.Reason, CreatedAt: r.CreatedAt}, nil
	default:
		return nil, utils.NewError(400, "INVALID_TYPE", "Invalid moderation item type.", nil)
	}
}

func (s *ModerationService) Approve(ctx context.Context, itemType, id string) error {
	switch itemType {
	case "review":
		_, err := s.repos.Reviews().GetByID(ctx, id)
		if err != nil {
			return err
		}
		return nil
	default:
		return utils.NewError(400, "INVALID_TYPE", "Cannot approve this type of item.", nil)
	}
}

func (s *ModerationService) Reject(ctx context.Context, itemType, id string) error {
	switch itemType {
	case "review":
		return s.repos.Reviews().Delete(ctx, id)
	default:
		return utils.NewError(400, "INVALID_TYPE", "Cannot reject this type of item.", nil)
	}
}

func (s *ModerationService) Escalate(ctx context.Context, itemType, id string) error {
	switch itemType {
	case "report":
		report, err := s.repos.Reports().GetByID(ctx, id)
		if err != nil {
			return err
		}
		report.Status = "escalated"
		report.UpdatedAt = time.Now()
		return s.repos.Reports().Update(ctx, report)
	default:
		return utils.NewError(400, "INVALID_TYPE", "Cannot escalate this type of item.", nil)
	}
}
