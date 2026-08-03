package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type WatchService struct {
	repos *Repositories
}

func NewWatchService(repos *Repositories) *WatchService {
	return &WatchService{repos: repos}
}

func (s *WatchService) GetProgress(ctx context.Context, userID, episodeID string) (*models.WatchProgress, error) {
	return s.repos.WatchProgresses().GetByUserAndEpisode(ctx, userID, episodeID)
}

func (s *WatchService) ListProgress(ctx context.Context, userID string) ([]models.WatchProgress, error) {
	return s.repos.WatchProgresses().ListByUser(ctx, userID)
}

func (s *WatchService) UpsertProgress(ctx context.Context, userID, episodeID, animeID string, progress, duration, percentage float64, completed bool) (*models.WatchProgress, error) {
	now := time.Now().UTC()
	wp := &models.WatchProgress{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		UserID:      userID,
		EpisodeID:   episodeID,
		AnimeID:     animeID,
		Progress:    progress,
		Duration:    duration,
		Percentage:  percentage,
		Completed:   completed,
		LastWatched: now,
	}
	if err := s.repos.WatchProgresses().Upsert(ctx, wp); err != nil {
		return nil, err
	}
	return wp, nil
}

func (s *WatchService) GetContinueWatching(ctx context.Context, userID string, limit int) ([]models.WatchProgress, error) {
	return s.repos.WatchProgresses().GetContinueWatching(ctx, userID, limit)
}

func (s *WatchService) ListHistory(ctx context.Context, userID string, limit, offset int) ([]models.WatchHistory, int64, error) {
	return s.repos.WatchHistories().ListByUser(ctx, userID, limit, offset)
}

func (s *WatchService) AddHistory(ctx context.Context, userID, episodeID, animeID string, duration float64) (*models.WatchHistory, error) {
	now := time.Now().UTC()
	history := &models.WatchHistory{
		Common:    models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		UserID:    userID,
		EpisodeID: episodeID,
		AnimeID:   animeID,
		WatchedAt: now,
		Duration:  duration,
	}
	if err := s.repos.WatchHistories().Create(ctx, history); err != nil {
		return nil, err
	}
	return history, nil
}
