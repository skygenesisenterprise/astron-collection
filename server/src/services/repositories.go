package services

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
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
func (r *Repositories) Roles() interfaces.RoleRepository { return &roleRepository{db: r.db} }
func (r *Repositories) UserRoles() interfaces.UserRoleRepository {
	return &userRoleRepository{db: r.db}
}
func (r *Repositories) MfaSecrets() interfaces.MfaSecretRepository {
	return &mfaSecretRepository{db: r.db}
}
func (r *Repositories) MfaRecoveryCodes() interfaces.MfaRecoveryCodeRepository {
	return &mfaRecoveryCodeRepository{db: r.db}
}
func (r *Repositories) Notifications() interfaces.NotificationRepository {
	return &notificationRepository{db: r.db}
}
func (r *Repositories) NotificationTemplates() interfaces.NotificationTemplateRepository {
	return &notificationTemplateRepository{db: r.db}
}
func (r *Repositories) Bots() interfaces.BotRepository { return &botRepository{db: r.db} }
func (r *Repositories) BotHeartbeats() interfaces.BotHeartbeatRepository {
	return &botHeartbeatRepository{db: r.db}
}
func (r *Repositories) ApiKeys() interfaces.ApiKeyRepository { return &apiKeyRepository{db: r.db} }
func (r *Repositories) LogEntries() interfaces.LogEntryRepository {
	return &logEntryRepository{db: r.db}
}
func (r *Repositories) ProtectRules() interfaces.ProtectRuleRepository {
	return &protectRuleRepository{db: r.db}
}
func (r *Repositories) ProtectEvents() interfaces.ProtectEventRepository {
	return &protectEventRepository{db: r.db}
}
func (r *Repositories) PlayerSessions() interfaces.PlayerSessionRepository {
	return &playerSessionRepository{db: r.db}
}
func (r *Repositories) PlayerPlaybacks() interfaces.PlayerPlaybackRepository {
	return &playerPlaybackRepository{db: r.db}
}
func (r *Repositories) Webhooks() interfaces.WebhookRepository { return &webhookRepository{db: r.db} }
func (r *Repositories) WebhookDeliveries() interfaces.WebhookDeliveryRepository {
	return &webhookDeliveryRepository{db: r.db}
}
func (r *Repositories) Subscriptions() interfaces.SubscriptionRepository {
	return &subscriptionRepository{db: r.db}
}
func (r *Repositories) BillingInfos() interfaces.BillingInfoRepository {
	return &billingInfoRepository{db: r.db}
}
func (r *Repositories) Integrations() interfaces.IntegrationRepository {
	return &integrationRepository{db: r.db}
}
func (r *Repositories) AuditLogs() interfaces.AuditLogRepository {
	return &auditLogRepository{db: r.db}
}
func (r *Repositories) WithDB(db *gorm.DB) *Repositories { return &Repositories{db: db} }

func normalizeNotFound(err error, code string) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return utils.NewError(http.StatusNotFound, code, "The requested resource was not found.", nil)
	}
	return err
}

type userRepository struct{ db *gorm.DB }

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	return &user, normalizeNotFound(err, "USER_NOT_FOUND")
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "email_normalized = ? OR email = ?", email, email).Error
	return &user, normalizeNotFound(err, "USER_NOT_FOUND")
}

func (r *userRepository) ListStale(ctx context.Context, before time.Time, limit int) ([]models.User, error) {
	var items []models.User
	err := r.db.WithContext(ctx).
		Where("email_verified_at IS NULL OR email_verified_at < ?", before).
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
	return &item, normalizeNotFound(err, "USER_SETTINGS_NOT_FOUND")
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
	return &item, normalizeNotFound(err, "NOTIFICATION_PREFERENCES_NOT_FOUND")
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
	return &credential, normalizeNotFound(err, "LOCAL_CREDENTIAL_NOT_FOUND")
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
	return &session, normalizeNotFound(err, "AUTH_SESSION_NOT_FOUND")
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
	return &token, normalizeNotFound(err, "REFRESH_TOKEN_NOT_FOUND")
}

func (r *authRefreshTokenRepository) GetByID(ctx context.Context, id string) (*models.AuthRefreshToken, error) {
	var token models.AuthRefreshToken
	err := r.db.WithContext(ctx).First(&token, "id = ?", id).Error
	return &token, normalizeNotFound(err, "REFRESH_TOKEN_NOT_FOUND")
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
	return &token, normalizeNotFound(err, "EMAIL_VERIFICATION_TOKEN_NOT_FOUND")
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
	return &token, normalizeNotFound(err, "PASSWORD_RESET_TOKEN_NOT_FOUND")
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
	return &item, normalizeNotFound(err, "WORKSPACE_NOT_FOUND")
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
	return &item, normalizeNotFound(err, "MEMBERSHIP_REQUIRED")
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
	return &account, normalizeNotFound(err, "OAUTH_ACCOUNT_NOT_FOUND")
}

func (r *authAccountRepository) GetByUserIDAndProvider(ctx context.Context, userID, provider string) (*models.AuthAccount, error) {
	var account models.AuthAccount
	err := r.db.WithContext(ctx).Where("user_id = ? AND provider = ?", userID, provider).First(&account).Error
	return &account, normalizeNotFound(err, "OAUTH_ACCOUNT_NOT_FOUND")
}

func (r *authAccountRepository) ListByUserID(ctx context.Context, userID string) ([]models.AuthAccount, error) {
	var items []models.AuthAccount
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

func (r *authAccountRepository) Update(ctx context.Context, account *models.AuthAccount) error {
	return r.db.WithContext(ctx).Save(account).Error
}

func (r *authAccountRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.AuthAccount{}, "id = ?", id).Error
}

type roleRepository struct{ db *gorm.DB }

func (r *roleRepository) Create(ctx context.Context, role *models.Role) error {
	return r.db.WithContext(ctx).Create(role).Error
}

func (r *roleRepository) GetByID(ctx context.Context, id string) (*models.Role, error) {
	var item models.Role
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, "ROLE_NOT_FOUND")
}

func (r *roleRepository) GetBySlug(ctx context.Context, slug string) (*models.Role, error) {
	var item models.Role
	err := r.db.WithContext(ctx).First(&item, "slug = ?", slug).Error
	return &item, normalizeNotFound(err, "ROLE_NOT_FOUND")
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
	return &item, normalizeNotFound(err, "USER_ROLE_NOT_FOUND")
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

type notificationRepository struct{ db *gorm.DB }

func (r *notificationRepository) Create(ctx context.Context, notification *models.Notification) error {
	return r.db.WithContext(ctx).Create(notification).Error
}

func (r *notificationRepository) GetByID(ctx context.Context, id string) (*models.Notification, error) {
	var item models.Notification
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, "NOTIFICATION_NOT_FOUND")
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

type notificationTemplateRepository struct{ db *gorm.DB }

func (r *notificationTemplateRepository) Create(ctx context.Context, tmpl *models.NotificationTemplate) error {
	return r.db.WithContext(ctx).Create(tmpl).Error
}

func (r *notificationTemplateRepository) GetByID(ctx context.Context, id string) (*models.NotificationTemplate, error) {
	var item models.NotificationTemplate
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, "NOTIFICATION_TEMPLATE_NOT_FOUND")
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

type botRepository struct{ db *gorm.DB }

func (r *botRepository) Create(ctx context.Context, bot *models.Bot) error {
	return r.db.WithContext(ctx).Create(bot).Error
}

func (r *botRepository) GetByID(ctx context.Context, id string) (*models.Bot, error) {
	var item models.Bot
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	return &item, normalizeNotFound(err, "BOT_NOT_FOUND")
}

func (r *botRepository) GetByWorkspaceID(ctx context.Context, workspaceID, id string) (*models.Bot, error) {
	var item models.Bot
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "BOT_NOT_FOUND")
}

func (r *botRepository) List(ctx context.Context, workspaceID string, status string, limit, offset int) ([]models.Bot, int64, error) {
	var items []models.Bot
	var total int64
	query := r.db.WithContext(ctx).Model(&models.Bot{}).Where("workspace_id = ?", workspaceID)
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

func (r *botRepository) Update(ctx context.Context, bot *models.Bot) error {
	return r.db.WithContext(ctx).Save(bot).Error
}

func (r *botRepository) Delete(ctx context.Context, workspaceID, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Bot{}, "workspace_id = ? AND id = ?", workspaceID, id).Error
}

func (r *botRepository) SetLastHeartbeat(ctx context.Context, id string, at time.Time, status string) error {
	return r.db.WithContext(ctx).Model(&models.Bot{}).Where("id = ?", id).Updates(map[string]any{
		"last_heartbeat_at": at,
		"status":            status,
		"updated_at":        at,
	}).Error
}

type botHeartbeatRepository struct{ db *gorm.DB }

func (r *botHeartbeatRepository) Create(ctx context.Context, heartbeat *models.BotHeartbeat) error {
	return r.db.WithContext(ctx).Create(heartbeat).Error
}

func (r *botHeartbeatRepository) ListByBot(ctx context.Context, botID string, limit, offset int) ([]models.BotHeartbeat, int64, error) {
	var items []models.BotHeartbeat
	var total int64
	query := r.db.WithContext(ctx).Model(&models.BotHeartbeat{}).Where("bot_id = ?", botID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type apiKeyRepository struct{ db *gorm.DB }

func (r *apiKeyRepository) Create(ctx context.Context, key *models.ApiKey) error {
	return r.db.WithContext(ctx).Create(key).Error
}

func (r *apiKeyRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.ApiKey, error) {
	var item models.ApiKey
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "API_KEY_NOT_FOUND")
}

func (r *apiKeyRepository) GetByHash(ctx context.Context, hash string) (*models.ApiKey, error) {
	var item models.ApiKey
	err := r.db.WithContext(ctx).First(&item, "hash = ? AND revoked_at IS NULL", hash).Error
	return &item, normalizeNotFound(err, "API_KEY_NOT_FOUND")
}

func (r *apiKeyRepository) List(ctx context.Context, workspaceID string) ([]models.ApiKey, error) {
	var items []models.ApiKey
	err := r.db.WithContext(ctx).Where("workspace_id = ?", workspaceID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *apiKeyRepository) Update(ctx context.Context, key *models.ApiKey) error {
	return r.db.WithContext(ctx).Save(key).Error
}

func (r *apiKeyRepository) Delete(ctx context.Context, workspaceID, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ApiKey{}, "workspace_id = ? AND id = ?", workspaceID, id).Error
}

func (r *apiKeyRepository) Touch(ctx context.Context, id string, at time.Time) error {
	return r.db.WithContext(ctx).Model(&models.ApiKey{}).Where("id = ?", id).Update("last_used_at", at).Error
}

type logEntryRepository struct{ db *gorm.DB }

func (r *logEntryRepository) CreateBatch(ctx context.Context, entries []*models.LogEntry) error {
	if len(entries) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&entries).Error
}

func (r *logEntryRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.LogEntry, error) {
	var item models.LogEntry
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "LOG_ENTRY_NOT_FOUND")
}

func (r *logEntryRepository) List(ctx context.Context, workspaceID string, filter interfaces.LogEntryFilter, limit, offset int) ([]models.LogEntry, int64, error) {
	var items []models.LogEntry
	var total int64
	query := r.db.WithContext(ctx).Model(&models.LogEntry{}).Where("workspace_id = ?", workspaceID)
	if filter.BotID != "" {
		query = query.Where("bot_id = ?", filter.BotID)
	}
	if filter.Level != "" {
		query = query.Where("level = ?", filter.Level)
	}
	if filter.Source != "" {
		query = query.Where("source = ?", filter.Source)
	}
	if filter.From != nil {
		query = query.Where("timestamp >= ?", *filter.From)
	}
	if filter.To != nil {
		query = query.Where("timestamp <= ?", *filter.To)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("timestamp DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *logEntryRepository) Stats(ctx context.Context, workspaceID string) (interfaces.LogStats, error) {
	var stats interfaces.LogStats
	stats.ByLevel = make(map[string]int64)
	now := time.Now().UTC()

	if err := r.db.WithContext(ctx).Model(&models.LogEntry{}).Where("workspace_id = ?", workspaceID).Count(&stats.Total).Error; err != nil {
		return stats, err
	}

	var levels []struct {
		Level string
		Count int64
	}
	if err := r.db.WithContext(ctx).Model(&models.LogEntry{}).
		Select("level, COUNT(*) as count").
		Where("workspace_id = ?", workspaceID).
		Group("level").
		Scan(&levels).Error; err != nil {
		return stats, err
	}
	for _, l := range levels {
		stats.ByLevel[l.Level] = l.Count
	}

	if err := r.db.WithContext(ctx).Model(&models.LogEntry{}).
		Where("workspace_id = ? AND timestamp >= ?", workspaceID, now.Add(-24*time.Hour)).
		Count(&stats.Last24h).Error; err != nil {
		return stats, err
	}
	if err := r.db.WithContext(ctx).Model(&models.LogEntry{}).
		Where("workspace_id = ? AND timestamp >= ?", workspaceID, now.Add(-7*24*time.Hour)).
		Count(&stats.LastWeek).Error; err != nil {
		return stats, err
	}
	if stats.Last24h > 0 {
		stats.PerMinute = float64(stats.Last24h) / 1440.0
	}
	return stats, nil
}

type protectRuleRepository struct{ db *gorm.DB }

func (r *protectRuleRepository) Create(ctx context.Context, rule *models.ProtectRule) error {
	return r.db.WithContext(ctx).Create(rule).Error
}

func (r *protectRuleRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.ProtectRule, error) {
	var item models.ProtectRule
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "PROTECT_RULE_NOT_FOUND")
}

func (r *protectRuleRepository) List(ctx context.Context, workspaceID string, module string) ([]models.ProtectRule, error) {
	var items []models.ProtectRule
	query := r.db.WithContext(ctx).Where("workspace_id = ?", workspaceID)
	if module != "" {
		query = query.Where("module = ?", module)
	}
	err := query.Order("priority DESC, created_at ASC").Find(&items).Error
	return items, err
}

func (r *protectRuleRepository) Update(ctx context.Context, rule *models.ProtectRule) error {
	return r.db.WithContext(ctx).Save(rule).Error
}

func (r *protectRuleRepository) Delete(ctx context.Context, workspaceID, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ProtectRule{}, "workspace_id = ? AND id = ?", workspaceID, id).Error
}

type protectEventRepository struct{ db *gorm.DB }

func (r *protectEventRepository) Create(ctx context.Context, event *models.ProtectEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}

func (r *protectEventRepository) CreateBatch(ctx context.Context, events []*models.ProtectEvent) error {
	if len(events) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&events).Error
}

func (r *protectEventRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.ProtectEvent, error) {
	var item models.ProtectEvent
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "PROTECT_EVENT_NOT_FOUND")
}

func (r *protectEventRepository) List(ctx context.Context, workspaceID string, filter interfaces.ProtectEventFilter, limit, offset int) ([]models.ProtectEvent, int64, error) {
	var items []models.ProtectEvent
	var total int64
	query := r.db.WithContext(ctx).Model(&models.ProtectEvent{}).Where("workspace_id = ?", workspaceID)
	if filter.BotID != "" {
		query = query.Where("bot_id = ?", filter.BotID)
	}
	if filter.RuleID != "" {
		query = query.Where("rule_id = ?", filter.RuleID)
	}
	if filter.EventType != "" {
		query = query.Where("event_type = ?", filter.EventType)
	}
	if filter.Severity != "" {
		query = query.Where("severity = ?", filter.Severity)
	}
	if filter.From != nil {
		query = query.Where("created_at >= ?", *filter.From)
	}
	if filter.To != nil {
		query = query.Where("created_at <= ?", *filter.To)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type playerSessionRepository struct{ db *gorm.DB }

func (r *playerSessionRepository) Create(ctx context.Context, session *models.PlayerSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *playerSessionRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.PlayerSession, error) {
	var item models.PlayerSession
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "PLAYER_SESSION_NOT_FOUND")
}

func (r *playerSessionRepository) List(ctx context.Context, workspaceID string, botID string, limit, offset int) ([]models.PlayerSession, int64, error) {
	var items []models.PlayerSession
	var total int64
	query := r.db.WithContext(ctx).Model(&models.PlayerSession{}).Where("workspace_id = ?", workspaceID)
	if botID != "" {
		query = query.Where("bot_id = ?", botID)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("started_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *playerSessionRepository) End(ctx context.Context, id string, at time.Time) error {
	return r.db.WithContext(ctx).Model(&models.PlayerSession{}).Where("id = ? AND ended_at IS NULL", id).Updates(map[string]any{
		"ended_at":   at,
		"updated_at": at,
	}).Error
}

type playerPlaybackRepository struct{ db *gorm.DB }

func (r *playerPlaybackRepository) Create(ctx context.Context, playback *models.PlayerPlayback) error {
	return r.db.WithContext(ctx).Create(playback).Error
}

func (r *playerPlaybackRepository) GetLatestBySession(ctx context.Context, sessionID string) (*models.PlayerPlayback, error) {
	var item models.PlayerPlayback
	err := r.db.WithContext(ctx).Where("session_id = ?", sessionID).Order("created_at DESC").First(&item).Error
	return &item, normalizeNotFound(err, "PLAYER_PLAYBACK_NOT_FOUND")
}

func (r *playerPlaybackRepository) ListByWorkspace(ctx context.Context, workspaceID string, limit, offset int) ([]models.PlayerPlayback, int64, error) {
	var items []models.PlayerPlayback
	var total int64
	query := r.db.WithContext(ctx).Model(&models.PlayerPlayback{}).Where("workspace_id = ?", workspaceID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *playerPlaybackRepository) UpsertState(ctx context.Context, workspaceID, sessionID, state string, position int) error {
	var existing models.PlayerPlayback
	err := r.db.WithContext(ctx).Where("workspace_id = ? AND session_id = ?", workspaceID, sessionID).
		Order("created_at DESC").First(&existing).Error
	if err == nil {
		return r.db.WithContext(ctx).Model(&models.PlayerPlayback{}).Where("id = ?", existing.ID).Updates(map[string]any{
			"state":      state,
			"position":   position,
			"updated_at": time.Now().UTC(),
		}).Error
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	now := time.Now().UTC()
	return r.db.WithContext(ctx).Create(&models.PlayerPlayback{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID,
		SessionID:   sessionID,
		Title:       "",
		Duration:    0,
		Position:    position,
		State:       state,
	}).Error
}

type webhookRepository struct{ db *gorm.DB }

func (r *webhookRepository) Create(ctx context.Context, webhook *models.Webhook) error {
	return r.db.WithContext(ctx).Create(webhook).Error
}

func (r *webhookRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.Webhook, error) {
	var item models.Webhook
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "WEBHOOK_NOT_FOUND")
}

func (r *webhookRepository) List(ctx context.Context, workspaceID string) ([]models.Webhook, error) {
	var items []models.Webhook
	err := r.db.WithContext(ctx).Where("workspace_id = ?", workspaceID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *webhookRepository) Update(ctx context.Context, webhook *models.Webhook) error {
	return r.db.WithContext(ctx).Save(webhook).Error
}

func (r *webhookRepository) Delete(ctx context.Context, workspaceID, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Webhook{}, "workspace_id = ? AND id = ?", workspaceID, id).Error
}

type webhookDeliveryRepository struct{ db *gorm.DB }

func (r *webhookDeliveryRepository) Create(ctx context.Context, delivery *models.WebhookDelivery) error {
	return r.db.WithContext(ctx).Create(delivery).Error
}

func (r *webhookDeliveryRepository) GetByID(ctx context.Context, webhookID, id string) (*models.WebhookDelivery, error) {
	var item models.WebhookDelivery
	err := r.db.WithContext(ctx).First(&item, "webhook_id = ? AND id = ?", webhookID, id).Error
	return &item, normalizeNotFound(err, "WEBHOOK_DELIVERY_NOT_FOUND")
}

func (r *webhookDeliveryRepository) ListByWebhook(ctx context.Context, webhookID string, limit, offset int) ([]models.WebhookDelivery, int64, error) {
	var items []models.WebhookDelivery
	var total int64
	query := r.db.WithContext(ctx).Model(&models.WebhookDelivery{}).Where("webhook_id = ?", webhookID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

type subscriptionRepository struct{ db *gorm.DB }

func (r *subscriptionRepository) GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.Subscription, error) {
	var item models.Subscription
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ?", workspaceID).Error
	return &item, normalizeNotFound(err, "SUBSCRIPTION_NOT_FOUND")
}

func (r *subscriptionRepository) Upsert(ctx context.Context, subscription *models.Subscription) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "workspace_id"}},
		UpdateAll: true,
	}).Create(subscription).Error
}

type billingInfoRepository struct{ db *gorm.DB }

func (r *billingInfoRepository) GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.BillingInfo, error) {
	var item models.BillingInfo
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ?", workspaceID).Error
	return &item, normalizeNotFound(err, "BILLING_INFO_NOT_FOUND")
}

func (r *billingInfoRepository) Upsert(ctx context.Context, info *models.BillingInfo) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "workspace_id"}},
		UpdateAll: true,
	}).Create(info).Error
}

type integrationRepository struct{ db *gorm.DB }

func (r *integrationRepository) Create(ctx context.Context, integration *models.Integration) error {
	return r.db.WithContext(ctx).Create(integration).Error
}

func (r *integrationRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.Integration, error) {
	var item models.Integration
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "INTEGRATION_NOT_FOUND")
}

func (r *integrationRepository) List(ctx context.Context, workspaceID string) ([]models.Integration, error) {
	var items []models.Integration
	err := r.db.WithContext(ctx).Where("workspace_id = ?", workspaceID).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *integrationRepository) Update(ctx context.Context, integration *models.Integration) error {
	return r.db.WithContext(ctx).Save(integration).Error
}

func (r *integrationRepository) Delete(ctx context.Context, workspaceID, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Integration{}, "workspace_id = ? AND id = ?", workspaceID, id).Error
}

type auditLogRepository struct{ db *gorm.DB }

func (r *auditLogRepository) Create(ctx context.Context, log *models.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *auditLogRepository) GetByID(ctx context.Context, workspaceID, id string) (*models.AuditLog, error) {
	var item models.AuditLog
	err := r.db.WithContext(ctx).First(&item, "workspace_id = ? AND id = ?", workspaceID, id).Error
	return &item, normalizeNotFound(err, "AUDIT_LOG_NOT_FOUND")
}

func (r *auditLogRepository) List(ctx context.Context, workspaceID string, action string, limit, offset int) ([]models.AuditLog, int64, error) {
	var items []models.AuditLog
	var total int64
	query := r.db.WithContext(ctx).Model(&models.AuditLog{}).Where("workspace_id = ?", workspaceID)
	if action != "" {
		query = query.Where("action = ?", action)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}
