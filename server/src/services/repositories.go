package services

import (
	"context"
	"errors"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repositories struct {
	db *gorm.DB
}

func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{db: db}
}

func (r *Repositories) Users() interfaces.UserRepository { return &userRepository{db: r.db} }
func (r *Repositories) UserSettings() interfaces.UserSettingsRepository {
	return &userSettingsRepository{db: r.db}
}
func (r *Repositories) NotificationPreferences() interfaces.NotificationPreferenceRepository {
	return &notificationPreferenceRepository{db: r.db}
}
func (r *Repositories) LocalCredentials() interfaces.LocalCredentialRepository {
	return &localCredentialRepository{db: r.db}
}
func (r *Repositories) AuthSessions() interfaces.AuthSessionRepository {
	return &authSessionRepository{db: r.db}
}
func (r *Repositories) AuthRefreshTokens() interfaces.AuthRefreshTokenRepository {
	return &authRefreshTokenRepository{db: r.db}
}
func (r *Repositories) EmailVerificationTokens() interfaces.EmailVerificationTokenRepository {
	return &emailVerificationTokenRepository{db: r.db}
}
func (r *Repositories) PasswordResetTokens() interfaces.PasswordResetTokenRepository {
	return &passwordResetTokenRepository{db: r.db}
}
func (r *Repositories) AuthAuditEvents() interfaces.AuthAuditEventRepository {
	return &authAuditEventRepository{db: r.db}
}
func (r *Repositories) AuthAccounts() interfaces.AuthAccountRepository {
	return &authAccountRepository{db: r.db}
}
func (r *Repositories) Workspaces() interfaces.WorkspaceRepository {
	return &workspaceRepository{db: r.db}
}
func (r *Repositories) WorkspaceMembers() interfaces.WorkspaceMemberRepository {
	return &workspaceMemberRepository{db: r.db}
}
func (r *Repositories) Anime() interfaces.AnimeRepository            { return &animeRepository{db: r.db} }
func (r *Repositories) Genres() interfaces.GenreRepository            { return &genreRepository{db: r.db} }
func (r *Repositories) Studios() interfaces.StudioRepository          { return &studioRepository{db: r.db} }
func (r *Repositories) Characters() interfaces.CharacterRepository    { return &characterRepository{db: r.db} }
func (r *Repositories) Episodes() interfaces.EpisodeRepository        { return &episodeRepository{db: r.db} }
func (r *Repositories) MediaAssets() interfaces.MediaAssetRepository  { return &mediaAssetRepository{db: r.db} }
func (r *Repositories) EncodingJobs() interfaces.EncodingJobRepository { return &encodingJobRepository{db: r.db} }
func (r *Repositories) Reviews() interfaces.ReviewRepository          { return &reviewRepository{db: r.db} }
func (r *Repositories) Comments() interfaces.CommentRepository        { return &commentRepository{db: r.db} }
func (r *Repositories) Reports() interfaces.ReportRepository          { return &reportRepository{db: r.db} }
func (r *Repositories) Watchlists() interfaces.WatchlistRepository    { return &watchlistRepository{db: r.db} }
func (r *Repositories) WatchProgresses() interfaces.WatchProgressRepository {
	return &watchProgressRepository{db: r.db}
}
func (r *Repositories) WatchHistories() interfaces.WatchHistoryRepository {
	return &watchHistoryRepository{db: r.db}
}
func (r *Repositories) Simulcasts() interfaces.SimulcastRepository {
	return &simulcastRepository{db: r.db}
}
func (r *Repositories) ReleaseSchedules() interfaces.ReleaseScheduleRepository {
	return &releaseScheduleRepository{db: r.db}
}
func (r *Repositories) Notifications() interfaces.NotificationRepository {
	return &notificationRepository{db: r.db}
}
func (r *Repositories) SystemSettings() interfaces.SystemSettingRepository {
	return &systemSettingRepository{db: r.db}
}
func (r *Repositories) AuditLogs() interfaces.AuditLogRepository { return &auditLogRepository{db: r.db} }
func (r *Repositories) Contacts() interfaces.ContactRepository   { return &contactRepository{db: r.db} }
func (r *Repositories) ContactGroups() interfaces.ContactGroupRepository {
	return &contactGroupRepository{db: r.db}
}
func (r *Repositories) WorkspaceSSOConfigs() interfaces.WorkspaceSSOConfigRepository {
	return &workspaceSSOConfigRepository{db: r.db}
}
func (r *Repositories) Tags() interfaces.TagRepository           { return &tagRepository{db: r.db} }
func (r *Repositories) Categories() interfaces.CategoryRepository { return &categoryRepository{db: r.db} }
func (r *Repositories) Libraries() interfaces.LibraryRepository   { return &libraryRepository{db: r.db} }
func (r *Repositories) Roles() interfaces.RoleRepository           { return &roleRepository{db: r.db} }
func (r *Repositories) UserRoles() interfaces.UserRoleRepository   { return &userRoleRepository{db: r.db} }
func (r *Repositories) FAQs() interfaces.FAQRepository {
	return &faqRepository{db: r.db}
}
func (r *Repositories) Tickets() interfaces.TicketRepository {
	return &ticketRepository{db: r.db}
}
func (r *Repositories) TicketReplies() interfaces.TicketReplyRepository {
	return &ticketReplyRepository{db: r.db}
}
func (r *Repositories) ContactMessages() interfaces.ContactMessageRepository {
	return &contactMessageRepository{db: r.db}
}
func (r *Repositories) NotificationTemplates() interfaces.NotificationTemplateRepository {
	return &notificationTemplateRepository{db: r.db}
}
func (r *Repositories) DomainConfigs() interfaces.DomainConfigRepository {
	return &domainConfigRepository{db: r.db}
}
func (r *Repositories) ApiKeys() interfaces.ApiKeyRepository { return &apiKeyRepository{db: r.db} }
func (r *Repositories) Integrations() interfaces.IntegrationRepository {
	return &integrationRepository{db: r.db}
}
func (r *Repositories) CalendarEvents() interfaces.CalendarEventRepository {
	return &calendarEventRepository{db: r.db}
}
func (r *Repositories) Premieres() interfaces.PremiereRepository {
	return &premiereRepository{db: r.db}
}
func (r *Repositories) Profiles() interfaces.ProfileRepository {
	return &profileRepository{db: r.db}
}
func (r *Repositories) MfaRecoveryCodes() interfaces.MfaRecoveryCodeRepository {
	return &mfaRecoveryCodeRepository{db: r.db}
}
func (r *Repositories) MfaSecrets() interfaces.MfaSecretRepository {
	return &mfaSecretRepository{db: r.db}
}
func (r *Repositories) WithDB(db *gorm.DB) *Repositories { return &Repositories{db: db} }

type userRepository struct{ db *gorm.DB }

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}
func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	return &user, normalizeNotFound(err, utils.NewError(404, "USER_NOT_FOUND", "The requested user was not found.", nil))
}
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "email_normalized = ? OR email = ?", email, email).Error
	return &user, normalizeNotFound(err, utils.NewError(404, "USER_NOT_FOUND", "The requested user was not found.", nil))
}
func (r *userRepository) ListStale(ctx context.Context, before time.Time, limit int) ([]models.User, error) {
	var items []models.User
	err := r.db.WithContext(ctx).
		Limit(limit).
		Find(&items).Error
	return items, err
}
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

type userSettingsRepository struct{ db *gorm.DB }

func (r *userSettingsRepository) GetByUserID(ctx context.Context, userID string) (*models.UserSettings, error) {
	var item models.UserSettings
	err := r.db.WithContext(ctx).First(&item, "user_id = ?", userID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "USER_SETTINGS_NOT_FOUND", "The requested user settings were not found.", nil))
}

func (r *userSettingsRepository) Upsert(ctx context.Context, settings *models.UserSettings) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		UpdateAll: true,
	}).Create(settings).Error
}

type notificationPreferenceRepository struct{ db *gorm.DB }

func (r *notificationPreferenceRepository) GetByUserID(ctx context.Context, userID string) (*models.NotificationPreference, error) {
	var item models.NotificationPreference
	err := r.db.WithContext(ctx).First(&item, "user_id = ?", userID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "NOTIFICATION_PREFERENCES_NOT_FOUND", "The requested notification preferences were not found.", nil))
}

func (r *notificationPreferenceRepository) Upsert(ctx context.Context, preference *models.NotificationPreference) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		UpdateAll: true,
	}).Create(preference).Error
}

type localCredentialRepository struct{ db *gorm.DB }

func (r *localCredentialRepository) Create(ctx context.Context, credential *models.LocalCredential) error {
	return r.db.WithContext(ctx).Create(credential).Error
}

func (r *localCredentialRepository) GetByUserID(ctx context.Context, userID string) (*models.LocalCredential, error) {
	var credential models.LocalCredential
	err := r.db.WithContext(ctx).First(&credential, "user_id = ?", userID).Error
	return &credential, normalizeNotFound(err, utils.NewError(404, "LOCAL_CREDENTIAL_NOT_FOUND", "The requested credential was not found.", nil))
}

func (r *localCredentialRepository) Update(ctx context.Context, credential *models.LocalCredential) error {
	return r.db.WithContext(ctx).Save(credential).Error
}

type authSessionRepository struct{ db *gorm.DB }

func (r *authSessionRepository) Create(ctx context.Context, session *models.AuthSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *authSessionRepository) GetByID(ctx context.Context, id string) (*models.AuthSession, error) {
	var session models.AuthSession
	err := r.db.WithContext(ctx).First(&session, "id = ?", id).Error
	return &session, normalizeNotFound(err, utils.NewError(404, "AUTH_SESSION_NOT_FOUND", "The requested session was not found.", nil))
}

func (r *authSessionRepository) ListActiveByUser(ctx context.Context, userID string, now time.Time) ([]models.AuthSession, error) {
	var items []models.AuthSession
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND revoked_at IS NULL AND expires_at > ?", userID, now).
		Order("created_at desc").
		Find(&items).Error
	return items, err
}

func (r *authSessionRepository) ListByUser(ctx context.Context, userID string) ([]models.AuthSession, error) {
	var items []models.AuthSession
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&items).Error
	return items, err
}

func (r *authSessionRepository) Update(ctx context.Context, session *models.AuthSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

func (r *authSessionRepository) Revoke(ctx context.Context, id string, reason string, revokedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&models.AuthSession{}).Where("id = ? AND revoked_at IS NULL", id).Updates(map[string]any{
		"revoked_at":        revokedAt,
		"revocation_reason": reason,
		"updated_at":        revokedAt,
	}).Error
}

func (r *authSessionRepository) RevokeAllByUser(ctx context.Context, userID string, reason string, revokedAt time.Time, exceptSessionID string) error {
	query := r.db.WithContext(ctx).Model(&models.AuthSession{}).Where("user_id = ? AND revoked_at IS NULL", userID)
	if exceptSessionID != "" {
		query = query.Where("id <> ?", exceptSessionID)
	}
	return query.Updates(map[string]any{
		"revoked_at":        revokedAt,
		"revocation_reason": reason,
		"updated_at":        revokedAt,
	}).Error
}

func (r *authSessionRepository) RevokeFamily(ctx context.Context, familyID string, reason string, revokedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&models.AuthSession{}).Where("refresh_token_family_id = ? AND revoked_at IS NULL", familyID).Updates(map[string]any{
		"revoked_at":        revokedAt,
		"revocation_reason": reason,
		"updated_at":        revokedAt,
	}).Error
}

func (r *authSessionRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	return r.db.WithContext(ctx).Where("expires_at < ?", before).Delete(&models.AuthSession{}).Error
}

type authRefreshTokenRepository struct{ db *gorm.DB }

func (r *authRefreshTokenRepository) Create(ctx context.Context, token *models.AuthRefreshToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *authRefreshTokenRepository) GetByHash(ctx context.Context, tokenHash string) (*models.AuthRefreshToken, error) {
	var token models.AuthRefreshToken
	err := r.db.WithContext(ctx).First(&token, "token_hash = ?", tokenHash).Error
	return &token, normalizeNotFound(err, utils.NewError(404, "REFRESH_TOKEN_NOT_FOUND", "The requested refresh token was not found.", nil))
}

func (r *authRefreshTokenRepository) GetByID(ctx context.Context, id string) (*models.AuthRefreshToken, error) {
	var token models.AuthRefreshToken
	err := r.db.WithContext(ctx).First(&token, "id = ?", id).Error
	return &token, normalizeNotFound(err, utils.NewError(404, "REFRESH_TOKEN_NOT_FOUND", "The requested refresh token was not found.", nil))
}

func (r *authRefreshTokenRepository) Update(ctx context.Context, token *models.AuthRefreshToken) error {
	return r.db.WithContext(ctx).Save(token).Error
}

func (r *authRefreshTokenRepository) RevokeFamily(ctx context.Context, familyID string, revokedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&models.AuthRefreshToken{}).Where("family_id = ? AND revoked_at IS NULL", familyID).Updates(map[string]any{
		"revoked_at": revokedAt,
		"updated_at": revokedAt,
	}).Error
}

func (r *authRefreshTokenRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	return r.db.WithContext(ctx).Where("expires_at < ?", before).Delete(&models.AuthRefreshToken{}).Error
}

type emailVerificationTokenRepository struct{ db *gorm.DB }

func (r *emailVerificationTokenRepository) Create(ctx context.Context, token *models.EmailVerificationToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *emailVerificationTokenRepository) GetByHash(ctx context.Context, tokenHash string) (*models.EmailVerificationToken, error) {
	var token models.EmailVerificationToken
	err := r.db.WithContext(ctx).First(&token, "token_hash = ?", tokenHash).Error
	return &token, normalizeNotFound(err, utils.NewError(404, "EMAIL_VERIFICATION_TOKEN_NOT_FOUND", "The requested email verification token was not found.", nil))
}

func (r *emailVerificationTokenRepository) Update(ctx context.Context, token *models.EmailVerificationToken) error {
	return r.db.WithContext(ctx).Save(token).Error
}

func (r *emailVerificationTokenRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	return r.db.WithContext(ctx).Where("expires_at < ?", before).Delete(&models.EmailVerificationToken{}).Error
}

type passwordResetTokenRepository struct{ db *gorm.DB }

func (r *passwordResetTokenRepository) Create(ctx context.Context, token *models.PasswordResetToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *passwordResetTokenRepository) GetByHash(ctx context.Context, tokenHash string) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken
	err := r.db.WithContext(ctx).First(&token, "token_hash = ?", tokenHash).Error
	return &token, normalizeNotFound(err, utils.NewError(404, "PASSWORD_RESET_TOKEN_NOT_FOUND", "The requested password reset token was not found.", nil))
}

func (r *passwordResetTokenRepository) Update(ctx context.Context, token *models.PasswordResetToken) error {
	return r.db.WithContext(ctx).Save(token).Error
}

func (r *passwordResetTokenRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	return r.db.WithContext(ctx).Where("expires_at < ?", before).Delete(&models.PasswordResetToken{}).Error
}

type authAuditEventRepository struct{ db *gorm.DB }

func (r *authAuditEventRepository) Create(ctx context.Context, event *models.AuthAuditEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}

type workspaceRepository struct{ db *gorm.DB }

func (r *workspaceRepository) Create(ctx context.Context, workspace *models.Workspace) error {
	return r.db.WithContext(ctx).Create(workspace).Error
}
func (r *workspaceRepository) ListByUser(ctx context.Context, userID string) ([]models.Workspace, error) {
	var items []models.Workspace
	err := r.db.WithContext(ctx).
		Table("workspaces").
		Joins("left join workspace_members on workspace_members.workspace_id = workspaces.id").
		Where("(workspace_members.user_id = ? OR workspaces.owner_id = ?) AND workspaces.archived_at IS NULL", userID, userID).
		Distinct("workspaces.id, workspaces.created_at, workspaces.updated_at, workspaces.name, workspaces.slug, workspaces.description, workspaces.visibility, workspaces.owner_id, workspaces.archived_at").
		Order("workspaces.created_at asc").
		Scan(&items).Error
	return items, err
}
func (r *workspaceRepository) GetByID(ctx context.Context, id string) (*models.Workspace, error) {
	var item models.Workspace
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.ErrWorkspaceNotFound)
}
func (r *workspaceRepository) Update(ctx context.Context, workspace *models.Workspace) error {
	return r.db.WithContext(ctx).Save(workspace).Error
}
func (r *workspaceRepository) Archive(ctx context.Context, id string, archivedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&models.Workspace{}).Where("id = ?", id).Update("archived_at", archivedAt).Error
}

type workspaceMemberRepository struct{ db *gorm.DB }

func (r *workspaceMemberRepository) Create(ctx context.Context, member *models.WorkspaceMember) error {
	return r.db.WithContext(ctx).Create(member).Error
}
func (r *workspaceMemberRepository) Get(ctx context.Context, workspaceID, userID string) (*models.WorkspaceMember, error) {
	var item models.WorkspaceMember
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND user_id = ?", workspaceID, userID).Error
	return &item, normalizeNotFound(err, utils.ErrMembershipRequired)
}
func (r *workspaceMemberRepository) ListByWorkspace(ctx context.Context, workspaceID string) ([]models.WorkspaceMember, error) {
	var items []models.WorkspaceMember
	err := r.db.WithContext(ctx).Where("workspace_id = ?", workspaceID).Order("joined_at asc").Find(&items).Error
	return items, err
}
func (r *workspaceMemberRepository) Update(ctx context.Context, member *models.WorkspaceMember) error {
	return r.db.WithContext(ctx).Save(member).Error
}
func (r *workspaceMemberRepository) Delete(ctx context.Context, workspaceID, userID string) error {
	return r.db.WithContext(ctx).Delete(&models.WorkspaceMember{}, "workspace_id = ? AND user_id = ?", workspaceID, userID).Error
}

type authAccountRepository struct{ db *gorm.DB }

func (r *authAccountRepository) Create(ctx context.Context, account *models.AuthAccount) error {
	return r.db.WithContext(ctx).Create(account).Error
}

func (r *authAccountRepository) GetByProvider(ctx context.Context, provider, providerAccountID string) (*models.AuthAccount, error) {
	var account models.AuthAccount
	err := r.db.WithContext(ctx).Where("provider = ? AND provider_account_id = ?", provider, providerAccountID).First(&account).Error
	return &account, normalizeNotFound(err, utils.NewError(404, "OAUTH_ACCOUNT_NOT_FOUND", "The OAuth account was not found.", nil))
}

func (r *authAccountRepository) ListByUserID(ctx context.Context, userID string) ([]models.AuthAccount, error) {
	var items []models.AuthAccount
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

func (r *authAccountRepository) GetByUserIDAndProvider(ctx context.Context, userID, provider string) (*models.AuthAccount, error) {
	var account models.AuthAccount
	err := r.db.WithContext(ctx).Where("user_id = ? AND provider = ?", userID, provider).First(&account).Error
	return &account, normalizeNotFound(err, utils.NewError(404, "OAUTH_ACCOUNT_NOT_FOUND", "The OAuth account was not found.", nil))
}

func (r *authAccountRepository) Update(ctx context.Context, account *models.AuthAccount) error {
	return r.db.WithContext(ctx).Save(account).Error
}

func (r *authAccountRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.AuthAccount{}, "id = ?", id).Error
}

type animeRepository struct{ db *gorm.DB }

func (r *animeRepository) Create(ctx context.Context, anime *models.Anime) error {
	return r.db.WithContext(ctx).Create(anime).Error
}

func (r *animeRepository) GetByID(ctx context.Context, id string) (*models.Anime, error) {
	var item models.Anime
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ANIME_NOT_FOUND", "The requested anime was not found.", nil))
}

func (r *animeRepository) GetBySlug(ctx context.Context, slug string) (*models.Anime, error) {
	var item models.Anime
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ANIME_NOT_FOUND", "The requested anime was not found.", nil))
}

func (r *animeRepository) List(ctx context.Context, opts interfaces.ListAnimeOpts) ([]models.Anime, int64, error) {
	var items []models.Anime
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Anime{}).Where("deleted_at IS NULL")

	if opts.Status != "" {
		query = query.Where("status = ?", opts.Status)
	}
	if len(opts.Genres) > 0 {
		query = query.Joins("JOIN anime_genres ON anime_genres.anime_id = anime.id").
			Where("anime_genres.genre_id IN ?", opts.Genres).
			Group("anime.id")
	}
	if opts.Studio != "" {
		query = query.Where("studio_id = ?", opts.Studio)
	}
	if opts.Year > 0 {
		query = query.Where("release_year = ?", opts.Year)
	}
	if opts.Season != "" {
		query = query.Where("season = ?", opts.Season)
	}
	if opts.Query != "" {
		query = query.Where("title ILIKE ? OR synopsis ILIKE ?", "%"+opts.Query+"%", "%"+opts.Query+"%")
	}
	if opts.Featured != nil {
		query = query.Where("is_featured = ?", *opts.Featured)
	}
	if opts.Trending != nil {
		query = query.Where("is_trending = ?", *opts.Trending)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	switch opts.Sort {
	case "rating":
		query = query.Order("rating DESC")
	case "title":
		query = query.Order("title ASC")
	case "release_year":
		query = query.Order("release_year DESC")
	default:
		query = query.Order("created_at DESC")
	}

	offset := 0
	if opts.Page > 1 {
		offset = (opts.Page - 1) * opts.Limit
	}
	if opts.Limit <= 0 {
		opts.Limit = 20
	}
	query = query.Offset(offset).Limit(opts.Limit)

	if err := query.Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *animeRepository) Update(ctx context.Context, anime *models.Anime) error {
	return r.db.WithContext(ctx).Save(anime).Error
}

func (r *animeRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Anime{}, "id = ?", id).Error
}

func (r *animeRepository) Search(ctx context.Context, query string, limit int) ([]models.Anime, error) {
	var items []models.Anime
	err := r.db.WithContext(ctx).
		Where("(title ILIKE ? OR synopsis ILIKE ?) AND deleted_at IS NULL", "%"+query+"%", "%"+query+"%").
		Order("created_at DESC").
		Limit(limit).
		Find(&items).Error
	return items, err
}

type genreRepository struct{ db *gorm.DB }

func (r *genreRepository) Create(ctx context.Context, genre *models.Genre) error {
	return r.db.WithContext(ctx).Create(genre).Error
}

func (r *genreRepository) GetByID(ctx context.Context, id string) (*models.Genre, error) {
	var item models.Genre
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "GENRE_NOT_FOUND", "The requested genre was not found.", nil))
}

func (r *genreRepository) GetBySlug(ctx context.Context, slug string) (*models.Genre, error) {
	var item models.Genre
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "GENRE_NOT_FOUND", "The requested genre was not found.", nil))
}

func (r *genreRepository) List(ctx context.Context) ([]models.Genre, error) {
	var items []models.Genre
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *genreRepository) Update(ctx context.Context, genre *models.Genre) error {
	return r.db.WithContext(ctx).Save(genre).Error
}

func (r *genreRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Genre{}, "id = ?", id).Error
}

type studioRepository struct{ db *gorm.DB }

func (r *studioRepository) Create(ctx context.Context, studio *models.Studio) error {
	return r.db.WithContext(ctx).Create(studio).Error
}

func (r *studioRepository) GetByID(ctx context.Context, id string) (*models.Studio, error) {
	var item models.Studio
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "STUDIO_NOT_FOUND", "The requested studio was not found.", nil))
}

func (r *studioRepository) GetBySlug(ctx context.Context, slug string) (*models.Studio, error) {
	var item models.Studio
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "STUDIO_NOT_FOUND", "The requested studio was not found.", nil))
}

func (r *studioRepository) List(ctx context.Context) ([]models.Studio, error) {
	var items []models.Studio
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *studioRepository) Update(ctx context.Context, studio *models.Studio) error {
	return r.db.WithContext(ctx).Save(studio).Error
}

func (r *studioRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Studio{}, "id = ?", id).Error
}

type characterRepository struct{ db *gorm.DB }

func (r *characterRepository) Create(ctx context.Context, character *models.Character) error {
	return r.db.WithContext(ctx).Create(character).Error
}

func (r *characterRepository) GetByID(ctx context.Context, id string) (*models.Character, error) {
	var item models.Character
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CHARACTER_NOT_FOUND", "The requested character was not found.", nil))
}

func (r *characterRepository) GetBySlug(ctx context.Context, slug string) (*models.Character, error) {
	var item models.Character
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CHARACTER_NOT_FOUND", "The requested character was not found.", nil))
}

func (r *characterRepository) List(ctx context.Context) ([]models.Character, error) {
	var items []models.Character
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *characterRepository) Update(ctx context.Context, character *models.Character) error {
	return r.db.WithContext(ctx).Save(character).Error
}

func (r *characterRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Character{}, "id = ?", id).Error
}

type episodeRepository struct{ db *gorm.DB }

func (r *episodeRepository) Create(ctx context.Context, episode *models.Episode) error {
	return r.db.WithContext(ctx).Create(episode).Error
}

func (r *episodeRepository) GetByID(ctx context.Context, id string) (*models.Episode, error) {
	var item models.Episode
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "EPISODE_NOT_FOUND", "The requested episode was not found.", nil))
}

func (r *episodeRepository) ListByAnime(ctx context.Context, animeID string, seasonID *string) ([]models.Episode, error) {
	var items []models.Episode
	query := r.db.WithContext(ctx).Where("anime_id = ?", animeID)
	if seasonID != nil {
		query = query.Where("season_id = ?", *seasonID)
	}
	err := query.Order("episode_number ASC").Find(&items).Error
	return items, err
}

func (r *episodeRepository) Update(ctx context.Context, episode *models.Episode) error {
	return r.db.WithContext(ctx).Save(episode).Error
}

func (r *episodeRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Episode{}, "id = ?", id).Error
}

type mediaAssetRepository struct{ db *gorm.DB }

func (r *mediaAssetRepository) Create(ctx context.Context, asset *models.MediaAsset) error {
	return r.db.WithContext(ctx).Create(asset).Error
}

func (r *mediaAssetRepository) GetByID(ctx context.Context, id string) (*models.MediaAsset, error) {
	var item models.MediaAsset
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "MEDIA_ASSET_NOT_FOUND", "The requested media asset was not found.", nil))
}

func (r *mediaAssetRepository) List(ctx context.Context, mediaType string, limit, offset int) ([]models.MediaAsset, int64, error) {
	var items []models.MediaAsset
	var total int64
	query := r.db.WithContext(ctx).Model(&models.MediaAsset{})
	if mediaType != "" {
		query = query.Where("media_type = ?", mediaType)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *mediaAssetRepository) Update(ctx context.Context, asset *models.MediaAsset) error {
	return r.db.WithContext(ctx).Save(asset).Error
}

func (r *mediaAssetRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.MediaAsset{}, "id = ?", id).Error
}

type encodingJobRepository struct{ db *gorm.DB }

func (r *encodingJobRepository) Create(ctx context.Context, job *models.EncodingJob) error {
	return r.db.WithContext(ctx).Create(job).Error
}

func (r *encodingJobRepository) GetByID(ctx context.Context, id string) (*models.EncodingJob, error) {
	var item models.EncodingJob
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ENCODING_JOB_NOT_FOUND", "The requested encoding job was not found.", nil))
}

func (r *encodingJobRepository) GetByMediaAssetID(ctx context.Context, mediaAssetID string) (*models.EncodingJob, error) {
	var item models.EncodingJob
	err := r.db.WithContext(ctx).First(&item, "media_asset_id = ?", mediaAssetID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ENCODING_JOB_NOT_FOUND", "The requested encoding job was not found.", nil))
}

func (r *encodingJobRepository) List(ctx context.Context, status string, limit, offset int) ([]models.EncodingJob, int64, error) {
	var items []models.EncodingJob
	var total int64
	query := r.db.WithContext(ctx).Model(&models.EncodingJob{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *encodingJobRepository) Update(ctx context.Context, job *models.EncodingJob) error {
	return r.db.WithContext(ctx).Save(job).Error
}

type reviewRepository struct{ db *gorm.DB }

func (r *reviewRepository) Create(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Create(review).Error
}

func (r *reviewRepository) GetByID(ctx context.Context, id string) (*models.Review, error) {
	var item models.Review
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "REVIEW_NOT_FOUND", "The requested review was not found.", nil))
}

func (r *reviewRepository) ListByAnime(ctx context.Context, animeID string, limit, offset int) ([]models.Review, int64, error) {
	var items []models.Review
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Review{}).Where("anime_id = ?", animeID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *reviewRepository) GetByUserAndAnime(ctx context.Context, userID, animeID string) (*models.Review, error) {
	var item models.Review
	err := r.db.WithContext(ctx).First(&item, "user_id = ? AND anime_id = ?", userID, animeID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "REVIEW_NOT_FOUND", "The requested review was not found.", nil))
}

func (r *reviewRepository) Update(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Save(review).Error
}

func (r *reviewRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Review{}, "id = ?", id).Error
}

func (r *reviewRepository) ListAll(ctx context.Context, rating int, authorID, animeID string, limit, offset int) ([]models.Review, int64, error) {
	var items []models.Review
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Review{})
	if rating > 0 {
		query = query.Where("rating = ?", rating)
	}
	if authorID != "" {
		query = query.Where("user_id = ?", authorID)
	}
	if animeID != "" {
		query = query.Where("anime_id = ?", animeID)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *reviewRepository) ListFlagged(ctx context.Context) ([]models.Review, error) {
	var items []models.Review
	err := r.db.WithContext(ctx).Where("status = ?", "flagged").Order("created_at ASC").Find(&items).Error
	return items, err
}

type commentRepository struct{ db *gorm.DB }

func (r *commentRepository) Create(ctx context.Context, comment *models.Comment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *commentRepository) GetByID(ctx context.Context, id string) (*models.Comment, error) {
	var item models.Comment
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "COMMENT_NOT_FOUND", "The requested comment was not found.", nil))
}

func (r *commentRepository) ListByAnime(ctx context.Context, animeID string, limit, offset int) ([]models.Comment, int64, error) {
	var items []models.Comment
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Comment{}).Where("anime_id = ?", animeID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *commentRepository) ListByReview(ctx context.Context, reviewID string, limit, offset int) ([]models.Comment, int64, error) {
	var items []models.Comment
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Comment{}).Where("review_id = ?", reviewID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *commentRepository) Update(ctx context.Context, comment *models.Comment) error {
	return r.db.WithContext(ctx).Save(comment).Error
}

func (r *commentRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Comment{}, "id = ?", id).Error
}

func (r *commentRepository) ListAll(ctx context.Context, status, authorID, animeID string, limit, offset int) ([]models.Comment, int64, error) {
	var items []models.Comment
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Comment{})
	if authorID != "" {
		query = query.Where("user_id = ?", authorID)
	}
	if animeID != "" {
		query = query.Where("anime_id = ?", animeID)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *commentRepository) ListPending(ctx context.Context) ([]models.Comment, error) {
	var items []models.Comment
	err := r.db.WithContext(ctx).Order("created_at ASC").Find(&items).Error
	return items, err
}

type reportRepository struct{ db *gorm.DB }

func (r *reportRepository) Create(ctx context.Context, report *models.Report) error {
	return r.db.WithContext(ctx).Create(report).Error
}

func (r *reportRepository) GetByID(ctx context.Context, id string) (*models.Report, error) {
	var item models.Report
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "REPORT_NOT_FOUND", "The requested report was not found.", nil))
}

func (r *reportRepository) List(ctx context.Context, status string, limit, offset int) ([]models.Report, int64, error) {
	var items []models.Report
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Report{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *reportRepository) Update(ctx context.Context, report *models.Report) error {
	return r.db.WithContext(ctx).Save(report).Error
}

func (r *reportRepository) ListAll(ctx context.Context, status, targetType string, limit, offset int) ([]models.Report, int64, error) {
	var items []models.Report
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Report{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *reportRepository) ListPending(ctx context.Context) ([]models.Report, error) {
	var items []models.Report
	err := r.db.WithContext(ctx).Where("status = ?", "pending").Order("created_at ASC").Find(&items).Error
	return items, err
}

type watchlistRepository struct{ db *gorm.DB }

func (r *watchlistRepository) Create(ctx context.Context, watchlist *models.Watchlist) error {
	return r.db.WithContext(ctx).Create(watchlist).Error
}

func (r *watchlistRepository) GetByID(ctx context.Context, id string) (*models.Watchlist, error) {
	var item models.Watchlist
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "WATCHLIST_NOT_FOUND", "The requested watchlist was not found.", nil))
}

func (r *watchlistRepository) ListByUser(ctx context.Context, userID string) ([]models.Watchlist, error) {
	var items []models.Watchlist
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *watchlistRepository) ListAll(ctx context.Context) ([]models.Watchlist, error) {
	var items []models.Watchlist
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *watchlistRepository) Update(ctx context.Context, watchlist *models.Watchlist) error {
	return r.db.WithContext(ctx).Save(watchlist).Error
}

func (r *watchlistRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Watchlist{}, "id = ?", id).Error
}

func (r *watchlistRepository) AddAnime(ctx context.Context, item *models.WatchlistItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *watchlistRepository) RemoveAnime(ctx context.Context, watchlistID, animeID string) error {
	return r.db.WithContext(ctx).Delete(&models.WatchlistItem{}, "watchlist_id = ? AND anime_id = ?", watchlistID, animeID).Error
}

func (r *watchlistRepository) ListAnime(ctx context.Context, watchlistID string) ([]models.WatchlistItem, error) {
	var items []models.WatchlistItem
	err := r.db.WithContext(ctx).Where("watchlist_id = ?", watchlistID).Order("position ASC").Find(&items).Error
	return items, err
}

type watchProgressRepository struct{ db *gorm.DB }

func (r *watchProgressRepository) Upsert(ctx context.Context, progress *models.WatchProgress) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "episode_id"}},
		UpdateAll: true,
	}).Create(progress).Error
}

func (r *watchProgressRepository) GetByUserAndEpisode(ctx context.Context, userID, episodeID string) (*models.WatchProgress, error) {
	var item models.WatchProgress
	err := r.db.WithContext(ctx).First(&item, "user_id = ? AND episode_id = ?", userID, episodeID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "WATCH_PROGRESS_NOT_FOUND", "The requested watch progress was not found.", nil))
}

func (r *watchProgressRepository) ListByUser(ctx context.Context, userID string) ([]models.WatchProgress, error) {
	var items []models.WatchProgress
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("updated_at DESC").Find(&items).Error
	return items, err
}

func (r *watchProgressRepository) GetContinueWatching(ctx context.Context, userID string, limit int) ([]models.WatchProgress, error) {
	var items []models.WatchProgress
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND completed = false", userID).
		Order("updated_at DESC").
		Limit(limit).
		Find(&items).Error
	return items, err
}

type watchHistoryRepository struct{ db *gorm.DB }

func (r *watchHistoryRepository) Create(ctx context.Context, history *models.WatchHistory) error {
	return r.db.WithContext(ctx).Create(history).Error
}

func (r *watchHistoryRepository) ListByUser(ctx context.Context, userID string, limit, offset int) ([]models.WatchHistory, int64, error) {
	var items []models.WatchHistory
	var total int64
	query := r.db.WithContext(ctx).Model(&models.WatchHistory{}).Where("user_id = ?", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("watched_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type simulcastRepository struct{ db *gorm.DB }

func (r *simulcastRepository) Create(ctx context.Context, simulcast *models.Simulcast) error {
	return r.db.WithContext(ctx).Create(simulcast).Error
}

func (r *simulcastRepository) GetByID(ctx context.Context, id string) (*models.Simulcast, error) {
	var item models.Simulcast
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "SIMULCAST_NOT_FOUND", "The requested simulcast was not found.", nil))
}

func (r *simulcastRepository) ListActive(ctx context.Context) ([]models.Simulcast, error) {
	var items []models.Simulcast
	err := r.db.WithContext(ctx).Where("status = ?", "active").Order("air_day ASC, air_time ASC").Find(&items).Error
	return items, err
}

func (r *simulcastRepository) ListByWeek(ctx context.Context) (map[string][]models.Simulcast, error) {
	items, err := r.ListActive(ctx)
	if err != nil {
		return nil, err
	}
	result := make(map[string][]models.Simulcast)
	for _, s := range items {
		result[s.AirDay] = append(result[s.AirDay], s)
	}
	return result, nil
}

func (r *simulcastRepository) Update(ctx context.Context, simulcast *models.Simulcast) error {
	return r.db.WithContext(ctx).Save(simulcast).Error
}

func (r *simulcastRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Simulcast{}, "id = ?", id).Error
}

type releaseScheduleRepository struct{ db *gorm.DB }

func (r *releaseScheduleRepository) Create(ctx context.Context, schedule *models.ReleaseSchedule) error {
	return r.db.WithContext(ctx).Create(schedule).Error
}

func (r *releaseScheduleRepository) GetByID(ctx context.Context, id string) (*models.ReleaseSchedule, error) {
	var item models.ReleaseSchedule
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "RELEASE_SCHEDULE_NOT_FOUND", "The requested release schedule was not found.", nil))
}

func (r *releaseScheduleRepository) ListUpcoming(ctx context.Context, limit int) ([]models.ReleaseSchedule, error) {
	var items []models.ReleaseSchedule
	err := r.db.WithContext(ctx).
		Where("scheduled_at >= ?", time.Now()).
		Order("scheduled_at ASC").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *releaseScheduleRepository) Update(ctx context.Context, schedule *models.ReleaseSchedule) error {
	return r.db.WithContext(ctx).Save(schedule).Error
}

type notificationRepository struct{ db *gorm.DB }

func (r *notificationRepository) Create(ctx context.Context, notification *models.Notification) error {
	return r.db.WithContext(ctx).Create(notification).Error
}

func (r *notificationRepository) GetByID(ctx context.Context, id string) (*models.Notification, error) {
	var item models.Notification
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "NOTIFICATION_NOT_FOUND", "The requested notification was not found.", nil))
}

func (r *notificationRepository) ListByUser(ctx context.Context, userID string, unreadOnly bool, limit, offset int) ([]models.Notification, int64, error) {
	var items []models.Notification
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Notification{}).Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("read_at IS NULL")
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *notificationRepository) UnreadCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Notification{}).
		Where("user_id = ? AND read_at IS NULL", userID).
		Count(&count).Error
	return count, err
}

func (r *notificationRepository) MarkRead(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&models.Notification{}).Where("id = ?", id).Update("read_at", time.Now()).Error
}

func (r *notificationRepository) MarkAllRead(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Model(&models.Notification{}).Where("user_id = ? AND read_at IS NULL", userID).Update("read_at", time.Now()).Error
}

func (r *notificationRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Notification{}, "id = ?", id).Error
}

type systemSettingRepository struct{ db *gorm.DB }

func (r *systemSettingRepository) GetByKey(ctx context.Context, key string) (*models.SystemSetting, error) {
	var item models.SystemSetting
	err := r.db.WithContext(ctx).First(&item, "key = ?", key).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "SYSTEM_SETTING_NOT_FOUND", "The requested system setting was not found.", nil))
}

func (r *systemSettingRepository) List(ctx context.Context, category string) ([]models.SystemSetting, error) {
	var items []models.SystemSetting
	query := r.db.WithContext(ctx)
	if category != "" {
		query = query.Where("category = ?", category)
	}
	err := query.Order("key ASC").Find(&items).Error
	return items, err
}

func (r *systemSettingRepository) Upsert(ctx context.Context, setting *models.SystemSetting) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		UpdateAll: true,
	}).Create(setting).Error
}

func (r *systemSettingRepository) Delete(ctx context.Context, key string) error {
	return r.db.WithContext(ctx).Delete(&models.SystemSetting{}, "key = ?", key).Error
}

type auditLogRepository struct{ db *gorm.DB }

func (r *auditLogRepository) Create(ctx context.Context, log *models.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *auditLogRepository) List(ctx context.Context, workspaceID string, limit, offset int) ([]models.AuditLog, int64, error) {
	var items []models.AuditLog
	var total int64
	query := r.db.WithContext(ctx).Model(&models.AuditLog{}).Where("workspace_id = ?", workspaceID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type contactRepository struct{ db *gorm.DB }

func (r *contactRepository) Create(ctx context.Context, contact *models.Contact) error {
	return r.db.WithContext(ctx).Create(contact).Error
}

func (r *contactRepository) GetByID(ctx context.Context, id string) (*models.Contact, error) {
	var item models.Contact
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CONTACT_NOT_FOUND", "The requested contact was not found.", nil))
}

func (r *contactRepository) ListByOwner(ctx context.Context, ownerID string) ([]models.Contact, error) {
	var items []models.Contact
	err := r.db.WithContext(ctx).Where("owner_id = ?", ownerID).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *contactRepository) Update(ctx context.Context, contact *models.Contact) error {
	return r.db.WithContext(ctx).Save(contact).Error
}

func (r *contactRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Contact{}, "id = ?", id).Error
}

type contactGroupRepository struct{ db *gorm.DB }

func (r *contactGroupRepository) Create(ctx context.Context, group *models.ContactGroup) error {
	return r.db.WithContext(ctx).Create(group).Error
}

func (r *contactGroupRepository) GetByID(ctx context.Context, id string) (*models.ContactGroup, error) {
	var item models.ContactGroup
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CONTACT_GROUP_NOT_FOUND", "The requested contact group was not found.", nil))
}

func (r *contactGroupRepository) ListByOwner(ctx context.Context, ownerID string) ([]models.ContactGroup, error) {
	var items []models.ContactGroup
	err := r.db.WithContext(ctx).Where("owner_id = ?", ownerID).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *contactGroupRepository) Update(ctx context.Context, group *models.ContactGroup) error {
	return r.db.WithContext(ctx).Save(group).Error
}

func (r *contactGroupRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ContactGroup{}, "id = ?", id).Error
}

type workspaceSSOConfigRepository struct{ db *gorm.DB }

func (r *workspaceSSOConfigRepository) GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.WorkspaceSSOConfig, error) {
	var item models.WorkspaceSSOConfig
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ?", workspaceID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "WORKSPACE_SSO_CONFIG_NOT_FOUND", "The requested workspace SSO config was not found.", nil))
}

func (r *workspaceSSOConfigRepository) Upsert(ctx context.Context, config *models.WorkspaceSSOConfig) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "workspace_id"}},
		UpdateAll: true,
	}).Create(config).Error
}

func (r *characterRepository) Search(ctx context.Context, query string, limit int) ([]models.Character, error) {
	var items []models.Character
	err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+query+"%").Limit(limit).Find(&items).Error
	return items, err
}

func (r *studioRepository) Search(ctx context.Context, query string, limit int) ([]models.Studio, error) {
	var items []models.Studio
	err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+query+"%").Limit(limit).Find(&items).Error
	return items, err
}

type tagRepository struct{ db *gorm.DB }

func (r *tagRepository) Create(ctx context.Context, tag *models.Tag) error {
	return r.db.WithContext(ctx).Create(tag).Error
}

func (r *tagRepository) GetByID(ctx context.Context, id string) (*models.Tag, error) {
	var item models.Tag
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "TAG_NOT_FOUND", "The requested tag was not found.", nil))
}

func (r *tagRepository) GetBySlug(ctx context.Context, slug string) (*models.Tag, error) {
	var item models.Tag
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "TAG_NOT_FOUND", "The requested tag was not found.", nil))
}

func (r *tagRepository) List(ctx context.Context) ([]models.Tag, error) {
	var items []models.Tag
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *tagRepository) Update(ctx context.Context, tag *models.Tag) error {
	return r.db.WithContext(ctx).Save(tag).Error
}

func (r *tagRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Tag{}, "id = ?", id).Error
}

type categoryRepository struct{ db *gorm.DB }

func (r *categoryRepository) Create(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *categoryRepository) GetByID(ctx context.Context, id string) (*models.Category, error) {
	var item models.Category
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CATEGORY_NOT_FOUND", "The requested category was not found.", nil))
}

func (r *categoryRepository) GetBySlug(ctx context.Context, slug string) (*models.Category, error) {
	var item models.Category
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CATEGORY_NOT_FOUND", "The requested category was not found.", nil))
}

func (r *categoryRepository) List(ctx context.Context) ([]models.Category, error) {
	var items []models.Category
	err := r.db.WithContext(ctx).Order("sort_order ASC, name ASC").Find(&items).Error
	return items, err
}

func (r *categoryRepository) Update(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *categoryRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Category{}, "id = ?", id).Error
}

type libraryRepository struct{ db *gorm.DB }

func (r *libraryRepository) Create(ctx context.Context, library *models.SourceConfig) error {
	return r.db.WithContext(ctx).Create(library).Error
}

func (r *libraryRepository) GetByID(ctx context.Context, id string) (*models.SourceConfig, error) {
	var item models.SourceConfig
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "LIBRARY_NOT_FOUND", "The requested library was not found.", nil))
}

func (r *libraryRepository) GetBySourceType(ctx context.Context, sourceType string) (*models.SourceConfig, error) {
	var item models.SourceConfig
	err := r.db.WithContext(ctx).First(&item, "source_type = ?", sourceType).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "LIBRARY_NOT_FOUND", "The requested library was not found.", nil))
}

func (r *libraryRepository) List(ctx context.Context) ([]models.SourceConfig, error) {
	var items []models.SourceConfig
	err := r.db.WithContext(ctx).Order("source_type ASC").Find(&items).Error
	return items, err
}

func (r *libraryRepository) Update(ctx context.Context, library *models.SourceConfig) error {
	return r.db.WithContext(ctx).Save(library).Error
}

func (r *libraryRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.SourceConfig{}, "id = ?", id).Error
}

type roleRepository struct{ db *gorm.DB }

func (r *roleRepository) Create(ctx context.Context, role *models.Role) error {
	return r.db.WithContext(ctx).Create(role).Error
}

func (r *roleRepository) GetByID(ctx context.Context, id string) (*models.Role, error) {
	var item models.Role
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ROLE_NOT_FOUND", "The requested role was not found.", nil))
}

func (r *roleRepository) GetBySlug(ctx context.Context, slug string) (*models.Role, error) {
	var item models.Role
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "ROLE_NOT_FOUND", "The requested role was not found.", nil))
}

func (r *roleRepository) List(ctx context.Context) ([]models.Role, error) {
	var items []models.Role
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *roleRepository) Update(ctx context.Context, role *models.Role) error {
	return r.db.WithContext(ctx).Save(role).Error
}

func (r *roleRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Role{}, "id = ?", id).Error
}

type userRoleRepository struct{ db *gorm.DB }

func (r *userRoleRepository) Assign(ctx context.Context, userRole *models.UserRole) error {
	return r.db.WithContext(ctx).Create(userRole).Error
}

func (r *userRoleRepository) Remove(ctx context.Context, userID, roleID string) error {
	return r.db.WithContext(ctx).Delete(&models.UserRole{}, "user_id = ? AND role_id = ?", userID, roleID).Error
}

func (r *userRoleRepository) GetByUserAndRole(ctx context.Context, userID, roleID string) (*models.UserRole, error) {
	var item models.UserRole
	err := r.db.WithContext(ctx).First(&item, "user_id = ? AND role_id = ?", userID, roleID).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "USER_ROLE_NOT_FOUND", "The user does not have this role.", nil))
}

func (r *userRoleRepository) ListByUser(ctx context.Context, userID string) ([]models.UserRole, error) {
	var items []models.UserRole
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

func (r *userRoleRepository) ListByRole(ctx context.Context, roleID string) ([]models.UserRole, error) {
	var items []models.UserRole
	err := r.db.WithContext(ctx).Where("role_id = ?", roleID).Find(&items).Error
	return items, err
}

func (r *userRoleRepository) CountByRole(ctx context.Context, roleID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.UserRole{}).Where("role_id = ?", roleID).Count(&count).Error
	return count, err
}

type faqRepository struct{ db *gorm.DB }

func (r *faqRepository) Create(ctx context.Context, faq *models.FAQ) error {
	return r.db.WithContext(ctx).Create(faq).Error
}

func (r *faqRepository) GetByID(ctx context.Context, id string) (*models.FAQ, error) {
	var item models.FAQ
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "FAQ_NOT_FOUND", "The requested FAQ was not found.", nil))
}

func (r *faqRepository) List(ctx context.Context, category string, activeOnly bool) ([]models.FAQ, error) {
	var items []models.FAQ
	query := r.db.WithContext(ctx)
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if activeOnly {
		query = query.Where("is_active = ?", true)
	}
	err := query.Order("sort_order ASC, created_at ASC").Find(&items).Error
	return items, err
}

func (r *faqRepository) Update(ctx context.Context, faq *models.FAQ) error {
	return r.db.WithContext(ctx).Save(faq).Error
}

func (r *faqRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.FAQ{}, "id = ?", id).Error
}

func (r *faqRepository) UpdateSortOrders(ctx context.Context, orders map[string]int) error {
	for id, order := range orders {
		if err := r.db.WithContext(ctx).Model(&models.FAQ{}).Where("id = ?", id).Update("sort_order", order).Error; err != nil {
			return err
		}
	}
	return nil
}

type ticketRepository struct{ db *gorm.DB }

func (r *ticketRepository) Create(ctx context.Context, ticket *models.Ticket) error {
	return r.db.WithContext(ctx).Create(ticket).Error
}

func (r *ticketRepository) GetByID(ctx context.Context, id string) (*models.Ticket, error) {
	var item models.Ticket
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "TICKET_NOT_FOUND", "The requested ticket was not found.", nil))
}

func (r *ticketRepository) List(ctx context.Context, status, priority, category string, limit, offset int) ([]models.Ticket, int64, error) {
	var items []models.Ticket
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Ticket{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *ticketRepository) Update(ctx context.Context, ticket *models.Ticket) error {
	return r.db.WithContext(ctx).Save(ticket).Error
}

type ticketReplyRepository struct{ db *gorm.DB }

func (r *ticketReplyRepository) Create(ctx context.Context, reply *models.TicketReply) error {
	return r.db.WithContext(ctx).Create(reply).Error
}

func (r *ticketReplyRepository) ListByTicket(ctx context.Context, ticketID string, limit, offset int) ([]models.TicketReply, int64, error) {
	var items []models.TicketReply
	var total int64
	query := r.db.WithContext(ctx).Model(&models.TicketReply{}).Where("ticket_id = ?", ticketID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at ASC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type contactMessageRepository struct{ db *gorm.DB }

func (r *contactMessageRepository) Create(ctx context.Context, msg *models.ContactMessage) error {
	return r.db.WithContext(ctx).Create(msg).Error
}

func (r *contactMessageRepository) GetByID(ctx context.Context, id string) (*models.ContactMessage, error) {
	var item models.ContactMessage
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CONTACT_MESSAGE_NOT_FOUND", "The requested contact message was not found.", nil))
}

func (r *contactMessageRepository) List(ctx context.Context, status string, limit, offset int) ([]models.ContactMessage, int64, error) {
	var items []models.ContactMessage
	var total int64
	query := r.db.WithContext(ctx).Model(&models.ContactMessage{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *contactMessageRepository) Update(ctx context.Context, msg *models.ContactMessage) error {
	return r.db.WithContext(ctx).Save(msg).Error
}

func (r *contactMessageRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ContactMessage{}, "id = ?", id).Error
}

type notificationTemplateRepository struct{ db *gorm.DB }

func (r *notificationTemplateRepository) Create(ctx context.Context, tmpl *models.NotificationTemplate) error {
	return r.db.WithContext(ctx).Create(tmpl).Error
}

func (r *notificationTemplateRepository) GetByID(ctx context.Context, id string) (*models.NotificationTemplate, error) {
	var item models.NotificationTemplate
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "NOTIFICATION_TEMPLATE_NOT_FOUND", "The requested notification template was not found.", nil))
}

func (r *notificationTemplateRepository) List(ctx context.Context) ([]models.NotificationTemplate, error) {
	var items []models.NotificationTemplate
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *notificationTemplateRepository) Update(ctx context.Context, tmpl *models.NotificationTemplate) error {
	return r.db.WithContext(ctx).Save(tmpl).Error
}

func (r *notificationTemplateRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.NotificationTemplate{}, "id = ?", id).Error
}

// --- DomainConfig repository ---

type domainConfigRepository struct{ db *gorm.DB }

func (r *domainConfigRepository) Create(ctx context.Context, config *models.DomainConfig) error {
	return r.db.WithContext(ctx).Create(config).Error
}

func (r *domainConfigRepository) GetByID(ctx context.Context, id string) (*models.DomainConfig, error) {
	var item models.DomainConfig
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "DOMAIN_CONFIG_NOT_FOUND", "The requested domain config was not found.", nil))
}

func (r *domainConfigRepository) List(ctx context.Context) ([]models.DomainConfig, error) {
	var items []models.DomainConfig
	err := r.db.WithContext(ctx).Order("domain ASC").Find(&items).Error
	return items, err
}

func (r *domainConfigRepository) Update(ctx context.Context, config *models.DomainConfig) error {
	return r.db.WithContext(ctx).Save(config).Error
}

func (r *domainConfigRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.DomainConfig{}, "id = ?", id).Error
}

// --- ApiKey repository ---

type apiKeyRepository struct{ db *gorm.DB }

func (r *apiKeyRepository) Create(ctx context.Context, key *models.ApiKey) error {
	return r.db.WithContext(ctx).Create(key).Error
}

func (r *apiKeyRepository) GetByID(ctx context.Context, id string) (*models.ApiKey, error) {
	var item models.ApiKey
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "API_KEY_NOT_FOUND", "The requested API key was not found.", nil))
}

func (r *apiKeyRepository) List(ctx context.Context) ([]models.ApiKey, error) {
	var items []models.ApiKey
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *apiKeyRepository) Update(ctx context.Context, key *models.ApiKey) error {
	return r.db.WithContext(ctx).Save(key).Error
}

func (r *apiKeyRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ApiKey{}, "id = ?", id).Error
}

// --- Integration repository ---

type integrationRepository struct{ db *gorm.DB }

func (r *integrationRepository) Create(ctx context.Context, integration *models.Integration) error {
	return r.db.WithContext(ctx).Create(integration).Error
}

func (r *integrationRepository) GetByID(ctx context.Context, id string) (*models.Integration, error) {
	var item models.Integration
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "INTEGRATION_NOT_FOUND", "The requested integration was not found.", nil))
}

func (r *integrationRepository) List(ctx context.Context) ([]models.Integration, error) {
	var items []models.Integration
	err := r.db.WithContext(ctx).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *integrationRepository) Update(ctx context.Context, integration *models.Integration) error {
	return r.db.WithContext(ctx).Save(integration).Error
}

func (r *integrationRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Integration{}, "id = ?", id).Error
}

type calendarEventRepository struct{ db *gorm.DB }

func (r *calendarEventRepository) Create(ctx context.Context, event *models.CalendarEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}

func (r *calendarEventRepository) GetByID(ctx context.Context, id string) (*models.CalendarEvent, error) {
	var item models.CalendarEvent
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "CALENDAR_EVENT_NOT_FOUND", "The requested calendar event was not found.", nil))
}

func (r *calendarEventRepository) List(ctx context.Context) ([]models.CalendarEvent, error) {
	var items []models.CalendarEvent
	err := r.db.WithContext(ctx).Order("start_at ASC").Find(&items).Error
	return items, err
}

func (r *calendarEventRepository) ListByDateRange(ctx context.Context, startDate, endDate string) ([]models.CalendarEvent, error) {
	var items []models.CalendarEvent
	query := r.db.WithContext(ctx)
	if startDate != "" {
		query = query.Where("start_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("start_at <= ?", endDate)
	}
	err := query.Order("start_at ASC").Find(&items).Error
	return items, err
}

func (r *calendarEventRepository) Update(ctx context.Context, event *models.CalendarEvent) error {
	return r.db.WithContext(ctx).Save(event).Error
}

func (r *calendarEventRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.CalendarEvent{}, "id = ?", id).Error
}

type premiereRepository struct{ db *gorm.DB }

func (r *premiereRepository) Create(ctx context.Context, premiere *models.Premiere) error {
	return r.db.WithContext(ctx).Create(premiere).Error
}

func (r *premiereRepository) GetByID(ctx context.Context, id string) (*models.Premiere, error) {
	var item models.Premiere
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "PREMIERE_NOT_FOUND", "The requested premiere was not found.", nil))
}

func (r *premiereRepository) List(ctx context.Context) ([]models.Premiere, error) {
	var items []models.Premiere
	err := r.db.WithContext(ctx).Order("scheduled_at ASC").Find(&items).Error
	return items, err
}

func (r *premiereRepository) Update(ctx context.Context, premiere *models.Premiere) error {
	return r.db.WithContext(ctx).Save(premiere).Error
}

func (r *premiereRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Premiere{}, "id = ?", id).Error
}

type profileRepository struct{ db *gorm.DB }

func (r *profileRepository) Create(ctx context.Context, profile *models.Profile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

func (r *profileRepository) GetByID(ctx context.Context, id string) (*models.Profile, error) {
	var item models.Profile
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "PROFILE_NOT_FOUND", "The requested profile was not found.", nil))
}

func (r *profileRepository) GetByUserID(ctx context.Context, userID string) ([]models.Profile, error) {
	var items []models.Profile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("sort_order ASC, created_at ASC").Find(&items).Error
	return items, err
}

func (r *profileRepository) GetDefaultByUserID(ctx context.Context, userID string) (*models.Profile, error) {
	var item models.Profile
	err := r.db.WithContext(ctx).Where("user_id = ? AND is_default = ?", userID, true).First(&item).Error
	return &item, normalizeNotFound(err, utils.NewError(404, "DEFAULT_PROFILE_NOT_FOUND", "The default profile was not found.", nil))
}

func (r *profileRepository) Update(ctx context.Context, profile *models.Profile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *profileRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Profile{}, "id = ?", id).Error
}

func (r *profileRepository) SetDefault(ctx context.Context, userID, profileID string) error {
	return r.db.WithContext(ctx).Model(&models.Profile{}).Where("id = ? AND user_id = ?", profileID, userID).Update("is_default", true).Error
}

func (r *profileRepository) ClearOtherDefaults(ctx context.Context, userID, excludeProfileID string) error {
	return r.db.WithContext(ctx).Model(&models.Profile{}).Where("user_id = ? AND id <> ? AND is_default = ?", userID, excludeProfileID, true).Update("is_default", false).Error
}

func (r *profileRepository) SetLastUsed(ctx context.Context, id string, lastUsedAt time.Time) error {
	return r.db.WithContext(ctx).Model(&models.Profile{}).Where("id = ?", id).Update("last_used_at", lastUsedAt).Error
}

func normalizeNotFound(err error, notFound error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return notFound
	}
	return err
}
