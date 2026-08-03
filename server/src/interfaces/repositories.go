package interfaces

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	ListStale(ctx context.Context, before time.Time, limit int) ([]models.User, error)
	Update(ctx context.Context, user *models.User) error
}

type UserSettingsRepository interface {
	GetByUserID(ctx context.Context, userID string) (*models.UserSettings, error)
	Upsert(ctx context.Context, settings *models.UserSettings) error
}

type NotificationPreferenceRepository interface {
	GetByUserID(ctx context.Context, userID string) (*models.NotificationPreference, error)
	Upsert(ctx context.Context, preference *models.NotificationPreference) error
}

type LocalCredentialRepository interface {
	Create(ctx context.Context, credential *models.LocalCredential) error
	GetByUserID(ctx context.Context, userID string) (*models.LocalCredential, error)
	Update(ctx context.Context, credential *models.LocalCredential) error
}

type AuthSessionRepository interface {
	Create(ctx context.Context, session *models.AuthSession) error
	GetByID(ctx context.Context, id string) (*models.AuthSession, error)
	ListActiveByUser(ctx context.Context, userID string, now time.Time) ([]models.AuthSession, error)
	ListByUser(ctx context.Context, userID string) ([]models.AuthSession, error)
	Update(ctx context.Context, session *models.AuthSession) error
	Revoke(ctx context.Context, id string, reason string, revokedAt time.Time) error
	RevokeAllByUser(ctx context.Context, userID string, reason string, revokedAt time.Time, exceptSessionID string) error
	RevokeFamily(ctx context.Context, familyID string, reason string, revokedAt time.Time) error
	DeleteExpired(ctx context.Context, before time.Time) error
}

type AuthRefreshTokenRepository interface {
	Create(ctx context.Context, token *models.AuthRefreshToken) error
	GetByHash(ctx context.Context, tokenHash string) (*models.AuthRefreshToken, error)
	GetByID(ctx context.Context, id string) (*models.AuthRefreshToken, error)
	Update(ctx context.Context, token *models.AuthRefreshToken) error
	RevokeFamily(ctx context.Context, familyID string, revokedAt time.Time) error
	DeleteExpired(ctx context.Context, before time.Time) error
}

type EmailVerificationTokenRepository interface {
	Create(ctx context.Context, token *models.EmailVerificationToken) error
	GetByHash(ctx context.Context, tokenHash string) (*models.EmailVerificationToken, error)
	Update(ctx context.Context, token *models.EmailVerificationToken) error
	DeleteExpired(ctx context.Context, before time.Time) error
}

type PasswordResetTokenRepository interface {
	Create(ctx context.Context, token *models.PasswordResetToken) error
	GetByHash(ctx context.Context, tokenHash string) (*models.PasswordResetToken, error)
	Update(ctx context.Context, token *models.PasswordResetToken) error
	DeleteExpired(ctx context.Context, before time.Time) error
}

type AuthAuditEventRepository interface {
	Create(ctx context.Context, event *models.AuthAuditEvent) error
}

type WorkspaceRepository interface {
	Create(ctx context.Context, workspace *models.Workspace) error
	ListByUser(ctx context.Context, userID string) ([]models.Workspace, error)
	GetByID(ctx context.Context, id string) (*models.Workspace, error)
	Update(ctx context.Context, workspace *models.Workspace) error
	Archive(ctx context.Context, id string, archivedAt time.Time) error
}

type WorkspaceMemberRepository interface {
	Create(ctx context.Context, member *models.WorkspaceMember) error
	Get(ctx context.Context, workspaceID, userID string) (*models.WorkspaceMember, error)
	ListByWorkspace(ctx context.Context, workspaceID string) ([]models.WorkspaceMember, error)
	Update(ctx context.Context, member *models.WorkspaceMember) error
	Delete(ctx context.Context, workspaceID, userID string) error
}

type AuthAccountRepository interface {
	Create(ctx context.Context, account *models.AuthAccount) error
	GetByProvider(ctx context.Context, provider string, providerAccountID string) (*models.AuthAccount, error)
	GetByUserIDAndProvider(ctx context.Context, userID string, provider string) (*models.AuthAccount, error)
	ListByUserID(ctx context.Context, userID string) ([]models.AuthAccount, error)
	Update(ctx context.Context, account *models.AuthAccount) error
	Delete(ctx context.Context, id string) error
}

type MfaRecoveryCodeRepository interface {
	Create(ctx context.Context, code *models.MfaRecoveryCode) error
	CreateBatch(ctx context.Context, codes []*models.MfaRecoveryCode) error
	GetByUserID(ctx context.Context, userID string) ([]models.MfaRecoveryCode, error)
	GetByID(ctx context.Context, id string) (*models.MfaRecoveryCode, error)
	MarkUsed(ctx context.Context, id string) error
	DeleteByUserID(ctx context.Context, userID string) error
}

// Anime repository
type AnimeRepository interface {
	Create(ctx context.Context, anime *models.Anime) error
	GetByID(ctx context.Context, id string) (*models.Anime, error)
	GetBySlug(ctx context.Context, slug string) (*models.Anime, error)
	List(ctx context.Context, opts ListAnimeOpts) ([]models.Anime, int64, error)
	Update(ctx context.Context, anime *models.Anime) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string, limit int) ([]models.Anime, error)
}

type ListAnimeOpts struct {
	Page, Limit      int
	Status           string
	Genres           []string
	Studio           string
	Year             int
	Season           string
	Sort             string
	Query            string
	Featured, Trending *bool
}

// Genre repository
type GenreRepository interface {
	Create(ctx context.Context, genre *models.Genre) error
	GetByID(ctx context.Context, id string) (*models.Genre, error)
	GetBySlug(ctx context.Context, slug string) (*models.Genre, error)
	List(ctx context.Context) ([]models.Genre, error)
	Update(ctx context.Context, genre *models.Genre) error
	Delete(ctx context.Context, id string) error
}

// Studio repository
type StudioRepository interface {
	Create(ctx context.Context, studio *models.Studio) error
	GetByID(ctx context.Context, id string) (*models.Studio, error)
	GetBySlug(ctx context.Context, slug string) (*models.Studio, error)
	List(ctx context.Context) ([]models.Studio, error)
	Update(ctx context.Context, studio *models.Studio) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string, limit int) ([]models.Studio, error)
}

// Character repository
type CharacterRepository interface {
	Create(ctx context.Context, character *models.Character) error
	GetByID(ctx context.Context, id string) (*models.Character, error)
	GetBySlug(ctx context.Context, slug string) (*models.Character, error)
	List(ctx context.Context) ([]models.Character, error)
	Update(ctx context.Context, character *models.Character) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string, limit int) ([]models.Character, error)
}

// Episode repository
type EpisodeRepository interface {
	Create(ctx context.Context, episode *models.Episode) error
	GetByID(ctx context.Context, id string) (*models.Episode, error)
	ListByAnime(ctx context.Context, animeID string, seasonID *string) ([]models.Episode, error)
	Update(ctx context.Context, episode *models.Episode) error
	Delete(ctx context.Context, id string) error
}

// MediaAsset repository
type MediaAssetRepository interface {
	Create(ctx context.Context, asset *models.MediaAsset) error
	GetByID(ctx context.Context, id string) (*models.MediaAsset, error)
	List(ctx context.Context, mediaType string, limit, offset int) ([]models.MediaAsset, int64, error)
	Update(ctx context.Context, asset *models.MediaAsset) error
	Delete(ctx context.Context, id string) error
}

// EncodingJob repository
type EncodingJobRepository interface {
	Create(ctx context.Context, job *models.EncodingJob) error
	GetByID(ctx context.Context, id string) (*models.EncodingJob, error)
	GetByMediaAssetID(ctx context.Context, mediaAssetID string) (*models.EncodingJob, error)
	List(ctx context.Context, status string, limit, offset int) ([]models.EncodingJob, int64, error)
	Update(ctx context.Context, job *models.EncodingJob) error
}

// FAQ repository
type FAQRepository interface {
	Create(ctx context.Context, faq *models.FAQ) error
	GetByID(ctx context.Context, id string) (*models.FAQ, error)
	List(ctx context.Context, category string, activeOnly bool) ([]models.FAQ, error)
	Update(ctx context.Context, faq *models.FAQ) error
	Delete(ctx context.Context, id string) error
	UpdateSortOrders(ctx context.Context, orders map[string]int) error
}

// Ticket repository
type TicketRepository interface {
	Create(ctx context.Context, ticket *models.Ticket) error
	GetByID(ctx context.Context, id string) (*models.Ticket, error)
	List(ctx context.Context, status, priority, category string, limit, offset int) ([]models.Ticket, int64, error)
	Update(ctx context.Context, ticket *models.Ticket) error
}

// TicketReply repository
type TicketReplyRepository interface {
	Create(ctx context.Context, reply *models.TicketReply) error
	ListByTicket(ctx context.Context, ticketID string, limit, offset int) ([]models.TicketReply, int64, error)
}

// ContactMessage repository
type ContactMessageRepository interface {
	Create(ctx context.Context, msg *models.ContactMessage) error
	GetByID(ctx context.Context, id string) (*models.ContactMessage, error)
	List(ctx context.Context, status string, limit, offset int) ([]models.ContactMessage, int64, error)
	Update(ctx context.Context, msg *models.ContactMessage) error
	Delete(ctx context.Context, id string) error
}

// NotificationTemplate repository
type NotificationTemplateRepository interface {
	Create(ctx context.Context, tmpl *models.NotificationTemplate) error
	GetByID(ctx context.Context, id string) (*models.NotificationTemplate, error)
	List(ctx context.Context) ([]models.NotificationTemplate, error)
	Update(ctx context.Context, tmpl *models.NotificationTemplate) error
	Delete(ctx context.Context, id string) error
}

// Review repository
type ReviewRepository interface {
	Create(ctx context.Context, review *models.Review) error
	GetByID(ctx context.Context, id string) (*models.Review, error)
	ListByAnime(ctx context.Context, animeID string, limit, offset int) ([]models.Review, int64, error)
	GetByUserAndAnime(ctx context.Context, userID, animeID string) (*models.Review, error)
	Update(ctx context.Context, review *models.Review) error
	Delete(ctx context.Context, id string) error
	ListAll(ctx context.Context, rating int, authorID, animeID string, limit, offset int) ([]models.Review, int64, error)
	ListFlagged(ctx context.Context) ([]models.Review, error)
}

// Comment repository
type CommentRepository interface {
	Create(ctx context.Context, comment *models.Comment) error
	GetByID(ctx context.Context, id string) (*models.Comment, error)
	ListByAnime(ctx context.Context, animeID string, limit, offset int) ([]models.Comment, int64, error)
	ListByReview(ctx context.Context, reviewID string, limit, offset int) ([]models.Comment, int64, error)
	Update(ctx context.Context, comment *models.Comment) error
	Delete(ctx context.Context, id string) error
	ListAll(ctx context.Context, status, authorID, animeID string, limit, offset int) ([]models.Comment, int64, error)
	ListPending(ctx context.Context) ([]models.Comment, error)
}

// Report repository
type ReportRepository interface {
	Create(ctx context.Context, report *models.Report) error
	GetByID(ctx context.Context, id string) (*models.Report, error)
	List(ctx context.Context, status string, limit, offset int) ([]models.Report, int64, error)
	Update(ctx context.Context, report *models.Report) error
	ListAll(ctx context.Context, status, targetType string, limit, offset int) ([]models.Report, int64, error)
	ListPending(ctx context.Context) ([]models.Report, error)
}

// Watchlist repository
type WatchlistRepository interface {
	Create(ctx context.Context, watchlist *models.Watchlist) error
	GetByID(ctx context.Context, id string) (*models.Watchlist, error)
	ListByUser(ctx context.Context, userID string) ([]models.Watchlist, error)
	ListAll(ctx context.Context) ([]models.Watchlist, error)
	Update(ctx context.Context, watchlist *models.Watchlist) error
	Delete(ctx context.Context, id string) error
	AddAnime(ctx context.Context, item *models.WatchlistItem) error
	RemoveAnime(ctx context.Context, watchlistID, animeID string) error
	ListAnime(ctx context.Context, watchlistID string) ([]models.WatchlistItem, error)
}

// WatchProgress repository
type WatchProgressRepository interface {
	Upsert(ctx context.Context, progress *models.WatchProgress) error
	GetByUserAndEpisode(ctx context.Context, userID, episodeID string) (*models.WatchProgress, error)
	ListByUser(ctx context.Context, userID string) ([]models.WatchProgress, error)
	GetContinueWatching(ctx context.Context, userID string, limit int) ([]models.WatchProgress, error)
}

// WatchHistory repository
type WatchHistoryRepository interface {
	Create(ctx context.Context, history *models.WatchHistory) error
	ListByUser(ctx context.Context, userID string, limit, offset int) ([]models.WatchHistory, int64, error)
}

// Simulcast repository
type SimulcastRepository interface {
	Create(ctx context.Context, simulcast *models.Simulcast) error
	GetByID(ctx context.Context, id string) (*models.Simulcast, error)
	ListActive(ctx context.Context) ([]models.Simulcast, error)
	ListByWeek(ctx context.Context) (map[string][]models.Simulcast, error)
	Update(ctx context.Context, simulcast *models.Simulcast) error
	Delete(ctx context.Context, id string) error
}

// ReleaseSchedule repository
type ReleaseScheduleRepository interface {
	Create(ctx context.Context, schedule *models.ReleaseSchedule) error
	GetByID(ctx context.Context, id string) (*models.ReleaseSchedule, error)
	ListUpcoming(ctx context.Context, limit int) ([]models.ReleaseSchedule, error)
	Update(ctx context.Context, schedule *models.ReleaseSchedule) error
}

// Notification repository
type NotificationRepository interface {
	Create(ctx context.Context, notification *models.Notification) error
	GetByID(ctx context.Context, id string) (*models.Notification, error)
	ListByUser(ctx context.Context, userID string, unreadOnly bool, limit, offset int) ([]models.Notification, int64, error)
	UnreadCount(ctx context.Context, userID string) (int64, error)
	MarkRead(ctx context.Context, id string) error
	MarkAllRead(ctx context.Context, userID string) error
	Delete(ctx context.Context, id string) error
}

// SystemSetting repository
type SystemSettingRepository interface {
	GetByKey(ctx context.Context, key string) (*models.SystemSetting, error)
	List(ctx context.Context, category string) ([]models.SystemSetting, error)
	Upsert(ctx context.Context, setting *models.SystemSetting) error
	Delete(ctx context.Context, key string) error
}

// AuditLog repository
type AuditLogRepository interface {
	Create(ctx context.Context, log *models.AuditLog) error
	List(ctx context.Context, workspaceID string, limit, offset int) ([]models.AuditLog, int64, error)
}

// Contact repository
type ContactRepository interface {
	Create(ctx context.Context, contact *models.Contact) error
	GetByID(ctx context.Context, id string) (*models.Contact, error)
	ListByOwner(ctx context.Context, ownerID string) ([]models.Contact, error)
	Update(ctx context.Context, contact *models.Contact) error
	Delete(ctx context.Context, id string) error
}

// ContactGroup repository
type ContactGroupRepository interface {
	Create(ctx context.Context, group *models.ContactGroup) error
	GetByID(ctx context.Context, id string) (*models.ContactGroup, error)
	ListByOwner(ctx context.Context, ownerID string) ([]models.ContactGroup, error)
	Update(ctx context.Context, group *models.ContactGroup) error
	Delete(ctx context.Context, id string) error
}

// WorkspaceSSOConfig repository
type WorkspaceSSOConfigRepository interface {
	GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.WorkspaceSSOConfig, error)
	Upsert(ctx context.Context, config *models.WorkspaceSSOConfig) error
}

// Tag repository
type TagRepository interface {
	Create(ctx context.Context, tag *models.Tag) error
	GetByID(ctx context.Context, id string) (*models.Tag, error)
	GetBySlug(ctx context.Context, slug string) (*models.Tag, error)
	List(ctx context.Context) ([]models.Tag, error)
	Update(ctx context.Context, tag *models.Tag) error
	Delete(ctx context.Context, id string) error
}

// Category repository
type CategoryRepository interface {
	Create(ctx context.Context, category *models.Category) error
	GetByID(ctx context.Context, id string) (*models.Category, error)
	GetBySlug(ctx context.Context, slug string) (*models.Category, error)
	List(ctx context.Context) ([]models.Category, error)
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id string) error
}

// Role repository
type RoleRepository interface {
	Create(ctx context.Context, role *models.Role) error
	GetByID(ctx context.Context, id string) (*models.Role, error)
	GetBySlug(ctx context.Context, slug string) (*models.Role, error)
	List(ctx context.Context) ([]models.Role, error)
	Update(ctx context.Context, role *models.Role) error
	Delete(ctx context.Context, id string) error
}

// UserRole repository
type UserRoleRepository interface {
	Assign(ctx context.Context, userRole *models.UserRole) error
	Remove(ctx context.Context, userID, roleID string) error
	GetByUserAndRole(ctx context.Context, userID, roleID string) (*models.UserRole, error)
	ListByUser(ctx context.Context, userID string) ([]models.UserRole, error)
	ListByRole(ctx context.Context, roleID string) ([]models.UserRole, error)
	CountByRole(ctx context.Context, roleID string) (int64, error)
}

// MfaSecret repository
type MfaSecretRepository interface {
	GetByUserID(ctx context.Context, userID string) (*models.MfaSecret, error)
	Create(ctx context.Context, secret *models.MfaSecret) error
	Update(ctx context.Context, secret *models.MfaSecret) error
	DeleteByUserID(ctx context.Context, userID string) error
}

// Library (SourceConfig) repository
type LibraryRepository interface {
	Create(ctx context.Context, library *models.SourceConfig) error
	GetByID(ctx context.Context, id string) (*models.SourceConfig, error)
	GetBySourceType(ctx context.Context, sourceType string) (*models.SourceConfig, error)
	List(ctx context.Context) ([]models.SourceConfig, error)
	Update(ctx context.Context, library *models.SourceConfig) error
	Delete(ctx context.Context, id string) error
}

// DomainConfig repository
type DomainConfigRepository interface {
	Create(ctx context.Context, config *models.DomainConfig) error
	GetByID(ctx context.Context, id string) (*models.DomainConfig, error)
	List(ctx context.Context) ([]models.DomainConfig, error)
	Update(ctx context.Context, config *models.DomainConfig) error
	Delete(ctx context.Context, id string) error
}

// ApiKey repository
type ApiKeyRepository interface {
	Create(ctx context.Context, key *models.ApiKey) error
	GetByID(ctx context.Context, id string) (*models.ApiKey, error)
	List(ctx context.Context) ([]models.ApiKey, error)
	Update(ctx context.Context, key *models.ApiKey) error
	Delete(ctx context.Context, id string) error
}

// Integration repository
type IntegrationRepository interface {
	Create(ctx context.Context, integration *models.Integration) error
	GetByID(ctx context.Context, id string) (*models.Integration, error)
	List(ctx context.Context) ([]models.Integration, error)
	Update(ctx context.Context, integration *models.Integration) error
	Delete(ctx context.Context, id string) error
}

// CalendarEvent repository
type CalendarEventRepository interface {
	Create(ctx context.Context, event *models.CalendarEvent) error
	GetByID(ctx context.Context, id string) (*models.CalendarEvent, error)
	List(ctx context.Context) ([]models.CalendarEvent, error)
	ListByDateRange(ctx context.Context, startDate, endDate string) ([]models.CalendarEvent, error)
	Update(ctx context.Context, event *models.CalendarEvent) error
	Delete(ctx context.Context, id string) error
}

// Profile repository
type ProfileRepository interface {
	Create(ctx context.Context, profile *models.Profile) error
	GetByID(ctx context.Context, id string) (*models.Profile, error)
	GetByUserID(ctx context.Context, userID string) ([]models.Profile, error)
	GetDefaultByUserID(ctx context.Context, userID string) (*models.Profile, error)
	Update(ctx context.Context, profile *models.Profile) error
	Delete(ctx context.Context, id string) error
	SetDefault(ctx context.Context, userID, profileID string) error
	ClearOtherDefaults(ctx context.Context, userID, excludeProfileID string) error
	SetLastUsed(ctx context.Context, id string, lastUsedAt time.Time) error
}

// Premiere repository
type PremiereRepository interface {
	Create(ctx context.Context, premiere *models.Premiere) error
	GetByID(ctx context.Context, id string) (*models.Premiere, error)
	List(ctx context.Context) ([]models.Premiere, error)
	Update(ctx context.Context, premiere *models.Premiere) error
	Delete(ctx context.Context, id string) error
}

type RepositorySet interface {
	Users() UserRepository
	UserSettings() UserSettingsRepository
	NotificationPreferences() NotificationPreferenceRepository
	LocalCredentials() LocalCredentialRepository
	AuthSessions() AuthSessionRepository
	AuthRefreshTokens() AuthRefreshTokenRepository
	EmailVerificationTokens() EmailVerificationTokenRepository
	PasswordResetTokens() PasswordResetTokenRepository
	AuthAuditEvents() AuthAuditEventRepository
	AuthAccounts() AuthAccountRepository
	Workspaces() WorkspaceRepository
	WorkspaceMembers() WorkspaceMemberRepository
	Anime() AnimeRepository
	Genres() GenreRepository
	Studios() StudioRepository
	Characters() CharacterRepository
	Episodes() EpisodeRepository
	MediaAssets() MediaAssetRepository
	EncodingJobs() EncodingJobRepository
	Reviews() ReviewRepository
	Comments() CommentRepository
	Reports() ReportRepository
	Watchlists() WatchlistRepository
	WatchProgresses() WatchProgressRepository
	WatchHistories() WatchHistoryRepository
	Simulcasts() SimulcastRepository
	ReleaseSchedules() ReleaseScheduleRepository
	Notifications() NotificationRepository
	SystemSettings() SystemSettingRepository
	AuditLogs() AuditLogRepository
	Contacts() ContactRepository
	ContactGroups() ContactGroupRepository
	WorkspaceSSOConfigs() WorkspaceSSOConfigRepository
	Tags() TagRepository
	Categories() CategoryRepository
	Libraries() LibraryRepository
	Roles() RoleRepository
	UserRoles() UserRoleRepository
	DomainConfigs() DomainConfigRepository
	ApiKeys() ApiKeyRepository
	Integrations() IntegrationRepository
	CalendarEvents() CalendarEventRepository
	Premieres() PremiereRepository
	Profiles() ProfileRepository
}
