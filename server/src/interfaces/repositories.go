package interfaces

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/astron-collection/server/src/models"
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

// NotificationTemplate repository
type NotificationTemplateRepository interface {
	Create(ctx context.Context, tmpl *models.NotificationTemplate) error
	GetByID(ctx context.Context, id string) (*models.NotificationTemplate, error)
	List(ctx context.Context) ([]models.NotificationTemplate, error)
	Update(ctx context.Context, tmpl *models.NotificationTemplate) error
	Delete(ctx context.Context, id string) error
}

// Bot repository
type BotRepository interface {
	Create(ctx context.Context, bot *models.Bot) error
	GetByID(ctx context.Context, id string) (*models.Bot, error)
	GetByWorkspaceID(ctx context.Context, workspaceID, id string) (*models.Bot, error)
	List(ctx context.Context, workspaceID string, status string, limit, offset int) ([]models.Bot, int64, error)
	Update(ctx context.Context, bot *models.Bot) error
	Delete(ctx context.Context, workspaceID, id string) error
	SetLastHeartbeat(ctx context.Context, id string, at time.Time, status string) error
}

// BotHeartbeat repository
type BotHeartbeatRepository interface {
	Create(ctx context.Context, heartbeat *models.BotHeartbeat) error
	ListByBot(ctx context.Context, botID string, limit, offset int) ([]models.BotHeartbeat, int64, error)
}

// ApiKey repository
type ApiKeyRepository interface {
	Create(ctx context.Context, key *models.ApiKey) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.ApiKey, error)
	GetByHash(ctx context.Context, hash string) (*models.ApiKey, error)
	List(ctx context.Context, workspaceID string) ([]models.ApiKey, error)
	Update(ctx context.Context, key *models.ApiKey) error
	Delete(ctx context.Context, workspaceID, id string) error
	Touch(ctx context.Context, id string, at time.Time) error
}

// LogEntry repository
type LogEntryRepository interface {
	CreateBatch(ctx context.Context, entries []*models.LogEntry) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.LogEntry, error)
	List(ctx context.Context, workspaceID string, filter LogEntryFilter, limit, offset int) ([]models.LogEntry, int64, error)
	Stats(ctx context.Context, workspaceID string) (LogStats, error)
}

type LogEntryFilter struct {
	BotID  string
	Level  string
	Source string
	From   *time.Time
	To     *time.Time
}

type LogStats struct {
	Total     int64            `json:"total"`
	ByLevel   map[string]int64 `json:"byLevel"`
	Last24h   int64            `json:"last24h"`
	LastWeek  int64            `json:"lastWeek"`
	PerMinute float64          `json:"perMinute"`
}

// ProtectRule repository
type ProtectRuleRepository interface {
	Create(ctx context.Context, rule *models.ProtectRule) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.ProtectRule, error)
	List(ctx context.Context, workspaceID string, module string) ([]models.ProtectRule, error)
	Update(ctx context.Context, rule *models.ProtectRule) error
	Delete(ctx context.Context, workspaceID, id string) error
}

// ProtectEvent repository
type ProtectEventRepository interface {
	Create(ctx context.Context, event *models.ProtectEvent) error
	CreateBatch(ctx context.Context, events []*models.ProtectEvent) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.ProtectEvent, error)
	List(ctx context.Context, workspaceID string, filter ProtectEventFilter, limit, offset int) ([]models.ProtectEvent, int64, error)
}

type ProtectEventFilter struct {
	BotID     string
	RuleID    string
	EventType string
	Severity  string
	From      *time.Time
	To        *time.Time
}

// PlayerSession repository
type PlayerSessionRepository interface {
	Create(ctx context.Context, session *models.PlayerSession) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.PlayerSession, error)
	List(ctx context.Context, workspaceID string, botID string, limit, offset int) ([]models.PlayerSession, int64, error)
	End(ctx context.Context, id string, at time.Time) error
}

// PlayerPlayback repository
type PlayerPlaybackRepository interface {
	Create(ctx context.Context, playback *models.PlayerPlayback) error
	GetLatestBySession(ctx context.Context, sessionID string) (*models.PlayerPlayback, error)
	ListByWorkspace(ctx context.Context, workspaceID string, limit, offset int) ([]models.PlayerPlayback, int64, error)
	UpsertState(ctx context.Context, workspaceID, sessionID, state string, position int) error
}

// Webhook repository
type WebhookRepository interface {
	Create(ctx context.Context, webhook *models.Webhook) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.Webhook, error)
	List(ctx context.Context, workspaceID string) ([]models.Webhook, error)
	Update(ctx context.Context, webhook *models.Webhook) error
	Delete(ctx context.Context, workspaceID, id string) error
}

// WebhookDelivery repository
type WebhookDeliveryRepository interface {
	Create(ctx context.Context, delivery *models.WebhookDelivery) error
	GetByID(ctx context.Context, webhookID, id string) (*models.WebhookDelivery, error)
	ListByWebhook(ctx context.Context, webhookID string, limit, offset int) ([]models.WebhookDelivery, int64, error)
}

// Subscription repository
type SubscriptionRepository interface {
	GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.Subscription, error)
	Upsert(ctx context.Context, subscription *models.Subscription) error
}

// BillingInfo repository
type BillingInfoRepository interface {
	GetByWorkspaceID(ctx context.Context, workspaceID string) (*models.BillingInfo, error)
	Upsert(ctx context.Context, info *models.BillingInfo) error
}

// Integration repository
type IntegrationRepository interface {
	Create(ctx context.Context, integration *models.Integration) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.Integration, error)
	List(ctx context.Context, workspaceID string) ([]models.Integration, error)
	Update(ctx context.Context, integration *models.Integration) error
	Delete(ctx context.Context, workspaceID, id string) error
}

// AuditLog repository
type AuditLogRepository interface {
	Create(ctx context.Context, log *models.AuditLog) error
	GetByID(ctx context.Context, workspaceID, id string) (*models.AuditLog, error)
	List(ctx context.Context, workspaceID string, action string, limit, offset int) ([]models.AuditLog, int64, error)
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
	Roles() RoleRepository
	UserRoles() UserRoleRepository
	MfaSecrets() MfaSecretRepository
	MfaRecoveryCodes() MfaRecoveryCodeRepository
	Notifications() NotificationRepository
	NotificationTemplates() NotificationTemplateRepository
	Bots() BotRepository
	BotHeartbeats() BotHeartbeatRepository
	ApiKeys() ApiKeyRepository
	LogEntries() LogEntryRepository
	ProtectRules() ProtectRuleRepository
	ProtectEvents() ProtectEventRepository
	PlayerSessions() PlayerSessionRepository
	PlayerPlaybacks() PlayerPlaybackRepository
	Webhooks() WebhookRepository
	WebhookDeliveries() WebhookDeliveryRepository
	Subscriptions() SubscriptionRepository
	BillingInfos() BillingInfoRepository
	Integrations() IntegrationRepository
	AuditLogs() AuditLogRepository
}
