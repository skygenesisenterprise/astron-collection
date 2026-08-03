package interfaces

import (
	"context"
	"time"

	"gorm.io/datatypes"
)

type MediaSourceProvider interface {
	Name() string

	ListLibraries(ctx context.Context) ([]MediaSourceLibrary, error)
	GetLibrary(ctx context.Context, id string) (*MediaSourceLibrary, error)

	ListItems(ctx context.Context, libraryID string, opts ListMediaSourceItemsOpts) ([]MediaSourceItem, int, error)
	GetItem(ctx context.Context, id string) (*MediaSourceItem, error)
	SearchItems(ctx context.Context, query string, limit int) ([]MediaSourceItem, error)

	GetStreamURL(ctx context.Context, itemID string, profile string) (string, error)
	GetPlaybackInfo(ctx context.Context, itemID string) (*MediaSourcePlaybackInfo, error)

	ReportPlaybackProgress(ctx context.Context, itemID string, positionTicks int64, stopped bool) error

	SyncLibrary(ctx context.Context, libraryID string) (*MediaSourceSyncResult, error)
	GetSyncStatus(ctx context.Context, libraryID string) (*MediaSourceSyncStatus, error)
}

type ListMediaSourceItemsOpts struct {
	ParentID string
	Limit    int
	Offset   int
	Sort     string
	Filters  map[string]string
}

type MediaSourceLibrary struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Type       string     `json:"type"`
	ItemCount  int        `json:"itemCount"`
	LastSyncAt *time.Time `json:"lastSyncAt,omitempty"`
}

type MediaSourceItem struct {
	ID            string         `json:"id"`
	SourceID      string         `json:"sourceId"`
	ParentID      string         `json:"parentId"`
	Name          string         `json:"name"`
	OriginalTitle string         `json:"originalTitle"`
	Type          string         `json:"type"`
	Year          int            `json:"year"`
	Rating        float64        `json:"rating"`
	Overview      string         `json:"overview"`
	Genres        []string       `json:"genres"`
	ImageURL      string         `json:"imageUrl"`
	SeasonNumber  *int           `json:"seasonNumber,omitempty"`
	EpisodeNumber *int           `json:"episodeNumber,omitempty"`
	Duration      float64        `json:"duration"`
	Container     string         `json:"container"`
	VideoCodec    string         `json:"videoCodec"`
	AudioCodec    string         `json:"audioCodec"`
	Width         int            `json:"width"`
	Height        int            `json:"height"`
	Bitrate       int64          `json:"bitrate"`
	RawMetadata   datatypes.JSON `json:"rawMetadata,omitempty"`
}

type MediaSourcePlaybackInfo struct {
	Container  string               `json:"container"`
	VideoCodec string               `json:"videoCodec"`
	AudioCodec string               `json:"audioCodec"`
	Width      int                  `json:"width"`
	Height     int                  `json:"height"`
	Duration   float64              `json:"duration"`
	Bitrate    int64                `json:"bitrate"`
	StreamURL  string               `json:"streamUrl"`
	Subtitles  []MediaSourceSubtitle `json:"subtitles"`
}

type MediaSourceSubtitle struct {
	Language string `json:"language"`
	URL      string `json:"url"`
	Format   string `json:"format"`
}

type MediaSourceSyncResult struct {
	LibraryID    string    `json:"libraryId"`
	ItemsCreated int       `json:"itemsCreated"`
	ItemsUpdated int       `json:"itemsUpdated"`
	ItemsRemoved int       `json:"itemsRemoved"`
	StartedAt    time.Time `json:"startedAt"`
	CompletedAt  time.Time `json:"completedAt"`
}

type MediaSourceSyncStatus struct {
	LibraryID    string     `json:"libraryId"`
	LastSyncAt   *time.Time `json:"lastSyncAt,omitempty"`
	Status       string     `json:"status"`
	ItemCount    int        `json:"itemCount"`
	ErrorMessage string     `json:"errorMessage,omitempty"`
}
