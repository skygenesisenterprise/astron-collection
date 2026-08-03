package routes

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	redisclient "github.com/skygenesisenterprise/kami-sama/server/internal/redis"
	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type Dependencies struct {
	Config                   config.Config
	Logger                   *slog.Logger
	RuntimeRole              string
	Database                 interfaces.Database
	Redis                    *redisclient.Client
	EventBus                 interfaces.EventBus
	IdentityProvider         interfaces.IdentityProvider
	AuthService              *services.AuthService
	OAuthService             *services.OAuthService
	UserService              *services.UserService
	WorkspaceService         *services.WorkspaceService
	Repos                    *services.Repositories
	AnimeService             *services.AnimeService
	EpisodeService           *services.EpisodeService
	GenreService             *services.GenreService
	StudioService            *services.StudioService
	CharacterService         *services.CharacterService
	MediaService             *services.MediaService
	CommunityService         *services.CommunityService
	WatchService             *services.WatchService
	SchedulingService        *services.SchedulingService
	NotificationService      *services.NotificationService
	SearchService            *services.SearchService
	SettingsService          *services.SettingsService
	MediaSourceService       *services.MediaSourceService
	TagService               *services.TagService
	CategoryService          *services.CategoryService
	CollectionService        *services.CollectionService
	LibraryService           *services.LibraryService
	DashboardService         *services.DashboardService
	AnalyticsService         *services.AnalyticsService
	AdminUserService         *services.AdminUserService
	AdminProfileService      *services.AdminProfileService
	AdminRoleService         *services.AdminRoleService
	AdminPermissionService   *services.AdminPermissionService
	CalendarService          *services.CalendarService
	PremiereService          *services.PremiereService
	SystemService            *services.SystemService
	SupportService           *services.SupportService
	ContactAdminService      *services.ContactAdminService
	FAQService               *services.FAQService
	ModerationService        *services.ModerationService
	NotificationAdminService *services.NotificationAdminService
	SettingsAdminService     *services.SettingsAdminService
	AnilistService           *services.AnilistService
	ProfileService           *services.ProfileService
	MfaService               *services.MfaService
	RecommendationService    *services.RecommendationService
}

func SetupRoutes(router *gin.Engine, deps Dependencies) {
	handler := &apiHandler{deps: deps}
	platform := NewPlatformHandler(deps)
	anime := NewAnimeHandler(deps)
	episode := NewEpisodeHandler(deps)
	genre := NewGenreHandler(deps)
	studio := NewStudioHandler(deps)
	character := NewCharacterHandler(deps)
	media := NewMediaHandler(deps)
	mediaSource := NewMediaSourceHandler(deps)
	community := NewCommunityHandler(deps)
	watch := NewWatchHandler(deps)
	scheduling := NewSchedulingHandler(deps)
	notification := NewNotificationHandler(deps)
	search := NewSearchHandler(deps)
	settings := NewSettingsHandler(deps)
	settingsAdmin := NewSettingsAdminHandler(deps)
	tag := NewTagHandler(deps)
	category := NewCategoryHandler(deps)
	collection := NewCollectionHandler(deps)
	library := NewLibraryHandler(deps)
	dashboard := NewDashboardHandler(deps)
	analytics := NewAnalyticsHandler(deps)
	adminUser := NewAdminUserHandler(deps)
	adminProfile := NewAdminProfileHandler(deps)
	adminRole := NewAdminRoleHandler(deps)
	adminPermission := NewAdminPermissionHandler(deps)
	calendar := NewCalendarHandler(deps)
	premiere := NewPremiereHandler(deps)
	system := NewSystemHandler(deps)
	support := NewSupportHandler(deps)
	contactAdmin := NewContactAdminHandler(deps)
	faq := NewFAQHandler(deps)
	moderation := NewModerationHandler(deps)
	notificationAdmin := NewNotificationAdminHandler(deps)

	recommendation := NewRecommendationHandler(deps)

	router.GET("/health/live", handler.live)
	router.GET("/health/ready", handler.ready)
	router.GET("/metrics", handler.metrics)

	api := router.Group("/api/v1")
	api.GET("/health", handler.health)
	api.GET("/ready", handler.ready)
	api.POST("/webhooks/:provider/:integrationId", handler.webhook)

	auth := api.Group("/auth")
	{
		auth.POST("/register", handler.register)
		auth.POST("/login", handler.login)
		auth.POST("/refresh", handler.refresh)
		auth.POST("/logout", handler.logout)
		auth.POST("/forgot-password", handler.forgotPassword)
		auth.POST("/reset-password", handler.resetPassword)
		auth.POST("/verify-email", handler.verifyEmail)
		auth.POST("/resend-verification", handler.resendVerification)
		auth.GET("/oauth/:provider", handler.oauthLogin)
		auth.GET("/oauth/:provider/callback", handler.oauthCallback)
		authProtected := auth.Group("")
		authProtected.Use(middleware.Auth(deps.IdentityProvider))
		{
			authProtected.POST("/logout-all", handler.logoutAll)
			authProtected.POST("/change-password", handler.changePassword)
			authProtected.GET("/me", handler.authMe)
			authProtected.GET("/sessions", handler.listAuthSessions)
			authProtected.DELETE("/sessions/:sessionId", handler.deleteAuthSession)
			authProtected.GET("/oauth/accounts", handler.listOAuthAccounts)
			authProtected.DELETE("/oauth/:provider", handler.unlinkOAuthAccount)
			authProtected.POST("/ensure-first-user-admin", handler.ensureFirstUserIsAdmin)
			authProtected.GET("/first-user", handler.getFirstUserInfo)
			authProtected.POST("/ensure-user-owner", handler.ensureUserIsOwner)
		}

		mfaProtected := auth.Group("/mfa")
		mfaProtected.Use(middleware.Auth(deps.IdentityProvider))
		{
			mfaProtected.POST("/setup", handler.mfaSetup)
			mfaProtected.POST("/verify", handler.mfaVerify)
			mfaProtected.POST("/disable", handler.mfaDisable)
			mfaProtected.POST("/validate-login", handler.mfaValidateLogin)
			mfaProtected.POST("/recovery-codes", handler.mfaRecoveryCodes)
			mfaProtected.POST("/regenerate-recovery-codes", handler.mfaRegenerateRecoveryCodes)
		}
	}

	protected := api.Group("")
	protected.Use(middleware.Auth(deps.IdentityProvider))
	protected.Use(middleware.WorkspaceContext())
	{
		protected.GET("/me", handler.me)
		protected.PATCH("/me", handler.updateMe)

		protected.GET("/workspaces", handler.listWorkspaces)
		protected.POST("/workspaces", handler.createWorkspace)
		protected.GET("/workspaces/:workspaceId", handler.getWorkspace)
		protected.PATCH("/workspaces/:workspaceId", handler.updateWorkspace)
		protected.DELETE("/workspaces/:workspaceId", handler.deleteWorkspace)
		protected.GET("/workspaces/:workspaceId/members", handler.listWorkspaceMembers)
		protected.POST("/workspaces/:workspaceId/members", handler.createWorkspaceMember)
		protected.POST("/workspaces/:workspaceId/members/provision", handler.provisionWorkspaceUser)
		protected.PATCH("/workspaces/:workspaceId/members/:userId", handler.updateWorkspaceMember)
		protected.DELETE("/workspaces/:workspaceId/members/:userId", handler.deleteWorkspaceMember)

		platformGroup := protected.Group("/platform")
		{
			platformGroup.GET("/home", platform.GetHomeData)
			platformGroup.GET("/wallet", platform.GetWalletInfo)
			platformGroup.GET("/user-info", platform.GetUserInfo)
			platformGroup.PATCH("/user-info", platform.UpdateUserInfo)
			platformGroup.GET("/security", platform.GetSecurityInfo)
			platformGroup.POST("/password/change", platform.ChangePassword)
			platformGroup.GET("/applications", platform.ListApplications)
			platformGroup.GET("/applications/:applicationId", platform.GetApplicationDetails)
			platformGroup.GET("/data-privacy", platform.GetDataPrivacyInfo)
			platformGroup.PATCH("/data-privacy", platform.UpdatePrivacySettings)
			platformGroup.GET("/contacts", platform.ListContacts)
			platformGroup.GET("/contacts/:contactId", platform.GetContactDetails)
			platformGroup.GET("/family", platform.ListFamilyMembers)
			platformGroup.POST("/family/invite", platform.InviteFamilyMember)
			platformGroup.GET("/storage", platform.GetStorageInfo)
			platformGroup.GET("/storage/files", platform.ListFiles)
			platformGroup.GET("/settings", platform.GetSettings)
			platformGroup.PATCH("/settings", platform.UpdateSettings)
		}

		animeGroup := protected.Group("/anime")
		{
			animeGroup.GET("", anime.List)
			animeGroup.POST("", anime.Create)
			animeGroup.GET("/:animeId", anime.GetByID)
			animeGroup.GET("/slug/:slug", anime.GetBySlug)
			animeGroup.PATCH("/:animeId", anime.Update)
			animeGroup.DELETE("/:animeId", anime.Delete)
		}

		genreGroup := protected.Group("/genres")
		{
			genreGroup.GET("", genre.List)
			genreGroup.POST("", genre.Create)
			genreGroup.GET("/:genreId", genre.GetByID)
			genreGroup.GET("/slug/:slug", genre.GetBySlug)
			genreGroup.PATCH("/:genreId", genre.Update)
			genreGroup.DELETE("/:genreId", genre.Delete)
		}

		studioGroup := protected.Group("/studios")
		{
			studioGroup.GET("", studio.List)
			studioGroup.POST("", studio.Create)
			studioGroup.GET("/:studioId", studio.GetByID)
			studioGroup.GET("/slug/:slug", studio.GetBySlug)
			studioGroup.PATCH("/:studioId", studio.Update)
			studioGroup.DELETE("/:studioId", studio.Delete)
		}

		characterGroup := protected.Group("/characters")
		{
			characterGroup.GET("", character.List)
			characterGroup.POST("", character.Create)
			characterGroup.GET("/:characterId", character.GetByID)
			characterGroup.GET("/slug/:slug", character.GetBySlug)
			characterGroup.PATCH("/:characterId", character.Update)
			characterGroup.DELETE("/:characterId", character.Delete)
		}

		episodeGroup := protected.Group("/anime/:animeId/episodes")
		{
			episodeGroup.GET("", episode.ListByAnime)
			episodeGroup.POST("", episode.Create)
			episodeGroup.GET("/:episodeId", episode.GetByID)
			episodeGroup.GET("/number/:episodeNumber", episode.GetNumber)
			episodeGroup.PATCH("/:episodeId", episode.Update)
			episodeGroup.DELETE("/:episodeId", episode.Delete)
		}

		mediaGroup := protected.Group("/media")
		{
			mediaGroup.GET("", media.List)
			mediaGroup.POST("", media.Create)
			mediaGroup.GET("/:mediaId", media.GetByID)
			mediaGroup.PATCH("/:mediaId", media.Update)
			mediaGroup.DELETE("/:mediaId", media.Delete)
			mediaGroup.GET("/encoding-jobs", media.ListEncodingJobs)
			mediaGroup.GET("/encoding-jobs/:jobId", media.GetEncodingJob)
			mediaGroup.POST("/thumbnails/generate", media.GenerateThumbnail)
			mediaGroup.POST("/encoding-jobs/:jobId/retry", media.RetryEncodingJob)
			mediaGroup.POST("/encoding-jobs/:jobId/cancel", media.CancelEncodingJob)
			mediaGroup.GET("/encoding/profiles", media.GetEncodingProfiles)
			mediaGroup.GET("/uploads", media.ListUploads)
			mediaGroup.POST("/uploads", media.InitiateUpload)
			mediaGroup.GET("/uploads/:uploadId", media.GetUploadProgress)
			mediaGroup.DELETE("/uploads/:uploadId", media.CancelUpload)
			mediaGroup.POST("/uploads/:uploadId/complete", media.CompleteUpload)
		}

		sourceGroup := protected.Group("/source")
		{
			sourceGroup.GET("/libraries", mediaSource.ListLibraries)
			sourceGroup.GET("/libraries/:libraryId", mediaSource.GetLibrary)
			sourceGroup.GET("/items", mediaSource.ListItems)
			sourceGroup.GET("/items/:itemId", mediaSource.GetItem)
			sourceGroup.GET("/items/search", mediaSource.SearchItems)
			sourceGroup.GET("/items/:itemId/stream", mediaSource.GetStreamURL)
			sourceGroup.GET("/items/:itemId/playback", mediaSource.GetPlaybackInfo)
			sourceGroup.POST("/items/:itemId/progress", mediaSource.ReportProgress)
			sourceGroup.POST("/libraries/:libraryId/sync", mediaSource.SyncLibrary)
			sourceGroup.GET("/libraries/:libraryId/sync", mediaSource.GetSyncStatus)
			sourceGroup.GET("/sync/logs", mediaSource.ListSyncLogs)
		}

		communityGroup := protected.Group("/community")
		{
			communityGroup.GET("/reviews", community.ListReviews)
			communityGroup.POST("/reviews", community.CreateReview)
			communityGroup.GET("/reviews/:reviewId", community.GetReview)
			communityGroup.PATCH("/reviews/:reviewId", community.UpdateReview)
			communityGroup.DELETE("/reviews/:reviewId", community.DeleteReview)
			communityGroup.GET("/reviews/:reviewId/comments", community.ListCommentsByReview)
			communityGroup.POST("/reviews/:reviewId/comments", community.CreateComment)
			communityGroup.PATCH("/comments/:commentId", community.UpdateComment)
			communityGroup.DELETE("/comments/:commentId", community.DeleteComment)
			communityGroup.GET("/watchlists", community.ListWatchlists)
			communityGroup.POST("/watchlists", community.CreateWatchlist)
			communityGroup.GET("/watchlists/:watchlistId", community.GetWatchlist)
			communityGroup.PATCH("/watchlists/:watchlistId", community.UpdateWatchlist)
			communityGroup.DELETE("/watchlists/:watchlistId", community.DeleteWatchlist)
			communityGroup.GET("/watchlists/:watchlistId/anime", community.ListWatchlistAnime)
			communityGroup.POST("/watchlists/:watchlistId/anime", community.AddToWatchlist)
			communityGroup.DELETE("/watchlists/:watchlistId/anime/:animeId", community.RemoveFromWatchlist)
			communityGroup.GET("/reports", community.ListReports)
			communityGroup.POST("/reports", community.CreateReport)
			communityGroup.PATCH("/reports/:reportId", community.UpdateReport)
		}

		watchGroup := protected.Group("/watch")
		{
			watchGroup.GET("/progress/:episodeId", watch.GetProgress)
			watchGroup.PUT("/progress/:episodeId", watch.UpsertProgress)
			watchGroup.GET("/progress", watch.ListProgress)
			watchGroup.GET("/continue", watch.ContinueWatching)
			watchGroup.GET("/history", watch.ListHistory)
			watchGroup.POST("/history", watch.AddHistory)
		}

		recommendationGroup := protected.Group("/recommendations")
		{
			recommendationGroup.GET("", recommendation.GetRecommendations)
		}

		schedulingGroup := protected.Group("/scheduling")
		{
			schedulingGroup.GET("/simulcasts", scheduling.ListSimulcasts)
			schedulingGroup.POST("/simulcasts", scheduling.CreateSimulcast)
			schedulingGroup.GET("/simulcasts/:simulcastId", scheduling.GetSimulcast)
			schedulingGroup.PATCH("/simulcasts/:simulcastId", scheduling.UpdateSimulcast)
			schedulingGroup.DELETE("/simulcasts/:simulcastId", scheduling.DeleteSimulcast)
			schedulingGroup.GET("/simulcasts/week/:weekday", scheduling.GetSimulcastByWeek)
			schedulingGroup.GET("/upcoming", scheduling.ListUpcomingReleases)
			schedulingGroup.POST("/schedules", scheduling.CreateReleaseSchedule)
			schedulingGroup.PATCH("/schedules/:scheduleId", scheduling.UpdateReleaseSchedule)
			schedulingGroup.GET("/releases", scheduling.ListReleases)
			schedulingGroup.GET("/releases/:releaseId", scheduling.GetRelease)
			schedulingGroup.DELETE("/releases/:releaseId", scheduling.CancelRelease)
			schedulingGroup.POST("/releases/:releaseId/publish", scheduling.PublishRelease)
		}

		schedulingGroup.GET("/calendar", calendar.ListEvents)
		schedulingGroup.POST("/calendar", calendar.CreateEvent)
		schedulingGroup.GET("/calendar/:eventId", calendar.GetEvent)
		schedulingGroup.PATCH("/calendar/:eventId", calendar.UpdateEvent)
		schedulingGroup.DELETE("/calendar/:eventId", calendar.DeleteEvent)

		schedulingGroup.GET("/premieres", premiere.List)
		schedulingGroup.POST("/premieres", premiere.Create)
		schedulingGroup.GET("/premieres/:premiereId", premiere.GetByID)
		schedulingGroup.PATCH("/premieres/:premiereId", premiere.Update)
		schedulingGroup.DELETE("/premieres/:premiereId", premiere.Delete)

		notificationGroup := protected.Group("/notifications")
		{
			notificationGroup.GET("", notification.List)
			notificationGroup.GET("/:notificationId", notification.GetByID)
			notificationGroup.PATCH("/:notificationId/read", notification.MarkRead)
			notificationGroup.POST("/read-all", notification.MarkAllRead)
			notificationGroup.DELETE("/:notificationId", notification.Delete)
			notificationGroup.GET("/unread-count", notification.UnreadCount)
			notificationGroup.GET("/preferences", notification.GetPreferences)
			notificationGroup.PUT("/preferences", notification.UpdatePreferences)
		}

		searchGroup := protected.Group("/search")
		{
			searchGroup.GET("", search.Search)
			searchGroup.GET("/anime", search.SearchAnime)
			searchGroup.GET("/characters", search.SearchCharacters)
			searchGroup.GET("/studios", search.SearchStudios)
			searchGroup.GET("/suggestions", search.Suggestions)
		}

		profile := NewProfileHandler(deps)
		profileGroup := protected.Group("/profiles")
		{
			profileGroup.GET("", profile.List)
			profileGroup.POST("", profile.Create)
			profileGroup.GET("/:profileId", profile.GetByID)
			profileGroup.PATCH("/:profileId", profile.Update)
			profileGroup.DELETE("/:profileId", profile.Delete)
			profileGroup.POST("/:profileId/select", profile.Select)
			profileGroup.POST("/:profileId/pin", profile.SetPin)
			profileGroup.POST("/verify-pin", profile.VerifyPin)
		}

		anilist := NewAnilistHandler(deps)
		anilistGroup := protected.Group("/integrations/anilist")
		{
			anilistGroup.GET("/search", anilist.Search)
			anilistGroup.GET("/trending", anilist.Trending)
			anilistGroup.GET("/popular", anilist.Popular)
			anilistGroup.GET("/seasonal", anilist.Seasonal)
			anilistGroup.GET("/airing-schedule", anilist.AiringSchedule)
			anilistGroup.GET("/characters/:characterId", anilist.GetCharacter)
			anilistGroup.GET("/staff/:staffId", anilist.GetStaff)
			anilistGroup.GET("/:anilistId", anilist.GetMedia)
			anilistGroup.POST("/:anilistId/import", anilist.ImportMedia)
		}

		plex := NewPlexHandler(deps)
		plexGroup := protected.Group("/integrations/plex")
		{
			plexGroup.GET("/health", plex.HealthCheck)
			plexGroup.GET("/identity", plex.GetIdentity)
			plexGroup.GET("/libraries", plex.ListLibraries)
			plexGroup.GET("/libraries/:libraryId", plex.GetLibrary)
			plexGroup.GET("/libraries/:libraryId/items", plex.ListItems)
			plexGroup.POST("/libraries/:libraryId/refresh", plex.RefreshLibrary)
			plexGroup.GET("/metadata/:ratingKey", plex.GetMetadata)
			plexGroup.GET("/metadata/:ratingKey/children", plex.GetChildren)
			plexGroup.GET("/hubs", plex.GetHubs)
			plexGroup.GET("/search", plex.Search)
			plexGroup.POST("/import", plex.ImportItem)
			plexGroup.GET("/image", plex.ImageProxy)
			plexGroup.POST("/transcode", plex.TranscodeDecision)
			plexGroup.POST("/scrobble", plex.Scrobble)
			plexGroup.POST("/unscrobble", plex.Unscrobble)
			plexGroup.POST("/timeline", plex.UpdateTimeline)
		}

		discover := NewDiscoverHandler(deps)
		discoverGroup := api.Group("/discover")
		{
			discoverGroup.GET("", discover.GetDiscover)
			discoverGroup.GET("/sections", discover.GetDiscoverSections)
			discoverGroup.GET("/continue-watching", discover.GetDiscoverContinueWatching)
			discoverGroup.GET("/content/:anilistId", discover.GetContentDetail)
		}

		settingsGroup := protected.Group("/settings")
		{
			settingsGroup.GET("", settings.List)
			settingsGroup.GET("/seo", settings.GetSeoMeta)
			settingsGroup.PUT("/seo", settings.UpsertSeoMeta)
			settingsGroup.GET("/:key", settings.GetByKey)
			settingsGroup.PUT("/:key", settings.Upsert)
			settingsGroup.DELETE("/:key", settings.Delete)

			settingsGroup.GET("/general", settingsAdmin.GetGeneral)
			settingsGroup.PUT("/general", settingsAdmin.UpdateGeneral)

			settingsGroup.GET("/security", settingsAdmin.GetSecurity)
			settingsGroup.PUT("/security", settingsAdmin.UpdateSecurity)
			settingsGroup.GET("/security/sessions", settingsAdmin.GetSessions)
			settingsGroup.PUT("/security/sessions", settingsAdmin.UpdateSessions)
			settingsGroup.GET("/security/rate-limit", settingsAdmin.GetRateLimit)
			settingsGroup.PUT("/security/rate-limit", settingsAdmin.UpdateRateLimit)
			settingsGroup.GET("/security/2fa", settingsAdmin.Get2FA)
			settingsGroup.PUT("/security/2fa", settingsAdmin.Update2FA)

			settingsGroup.GET("/branding", settingsAdmin.GetBranding)
			settingsGroup.PUT("/branding", settingsAdmin.UpdateBranding)
			settingsGroup.POST("/branding/logo", settingsAdmin.UploadLogo)
			settingsGroup.POST("/branding/favicon", settingsAdmin.UploadFavicon)
			settingsGroup.POST("/branding/preview", settingsAdmin.PreviewBranding)

			settingsGroup.GET("/email", settingsAdmin.GetEmail)
			settingsGroup.PUT("/email", settingsAdmin.UpdateEmail)
			settingsGroup.POST("/email/test", settingsAdmin.SendTestEmail)
			settingsGroup.GET("/email/templates", settingsAdmin.ListEmailTemplates)
			settingsGroup.PATCH("/email/templates/:templateId", settingsAdmin.UpdateEmailTemplate)
			settingsGroup.GET("/email/logs", settingsAdmin.ListEmailLogs)

			settingsGroup.GET("/seo/pages", settingsAdmin.ListSEOPages)
			settingsGroup.PUT("/seo/pages/:pagePath", settingsAdmin.UpdateSEOPage)
			settingsGroup.GET("/seo/sitemap", settingsAdmin.GetSitemap)
			settingsGroup.GET("/seo/robots", settingsAdmin.GetRobots)

			settingsGroup.GET("/storage", settingsAdmin.GetStorage)
			settingsGroup.PUT("/storage", settingsAdmin.UpdateStorage)
			settingsGroup.POST("/storage/test", settingsAdmin.TestStorage)
			settingsGroup.GET("/storage/usage", settingsAdmin.GetStorageUsage)
			settingsGroup.GET("/storage/buckets", settingsAdmin.ListBuckets)

			settingsGroup.GET("/cdn", settingsAdmin.GetCDN)
			settingsGroup.PUT("/cdn", settingsAdmin.UpdateCDN)
			settingsGroup.POST("/cdn/purge", settingsAdmin.PurgeCDN)
			settingsGroup.GET("/cdn/stats", settingsAdmin.GetCDNStats)

			settingsGroup.GET("/domains", settingsAdmin.ListDomains)
			settingsGroup.POST("/domains", settingsAdmin.CreateDomain)
			settingsGroup.GET("/domains/:domainId", settingsAdmin.GetDomain)
			settingsGroup.DELETE("/domains/:domainId", settingsAdmin.DeleteDomain)
			settingsGroup.POST("/domains/:domainId/verify", settingsAdmin.VerifyDomain)
			settingsGroup.POST("/domains/:domainId/ssl", settingsAdmin.GenerateSSL)

			settingsGroup.GET("/apis", settingsAdmin.ListAPIKeys)
			settingsGroup.POST("/apis", settingsAdmin.CreateAPIKey)
			settingsGroup.GET("/apis/:keyId", settingsAdmin.GetAPIKey)
			settingsGroup.PATCH("/apis/:keyId", settingsAdmin.UpdateAPIKey)
			settingsGroup.DELETE("/apis/:keyId", settingsAdmin.DeleteAPIKey)
			settingsGroup.GET("/apis/:keyId/usage", settingsAdmin.GetAPIKeyUsage)

			settingsGroup.PUT("/oauth/:provider", settingsAdmin.UpdateOAuth)
			settingsGroup.POST("/oauth/:provider/test", settingsAdmin.TestOAuth)
			settingsGroup.GET("/oauth/:provider/callback-url", settingsAdmin.GetCallbackURL)

			settingsGroup.GET("/integrations", settingsAdmin.ListIntegrations)
			settingsGroup.POST("/integrations", settingsAdmin.CreateIntegration)
			settingsGroup.GET("/integrations/:integrationId", settingsAdmin.GetIntegration)
			settingsGroup.PATCH("/integrations/:integrationId", settingsAdmin.UpdateIntegration)
			settingsGroup.DELETE("/integrations/:integrationId", settingsAdmin.DeleteIntegration)
			settingsGroup.POST("/integrations/:integrationId/test", settingsAdmin.TestIntegration)
			settingsGroup.GET("/integrations/:integrationId/logs", settingsAdmin.GetIntegrationLogs)

			settingsGroup.GET("/maintenance", settingsAdmin.GetMaintenance)
			settingsGroup.PUT("/maintenance", settingsAdmin.UpdateMaintenance)
			settingsGroup.POST("/maintenance/cache-clear", settingsAdmin.ClearCache)
			settingsGroup.POST("/maintenance/db-optimize", settingsAdmin.OptimizeDB)
			settingsGroup.GET("/maintenance/jobs", settingsAdmin.ListMaintenanceJobs)
		}

		tagGroup := protected.Group("/tags")
		{
			tagGroup.GET("", tag.List)
			tagGroup.POST("", tag.Create)
			tagGroup.GET("/:tagId", tag.GetByID)
			tagGroup.GET("/slug/:slug", tag.GetBySlug)
			tagGroup.PATCH("/:tagId", tag.Update)
			tagGroup.DELETE("/:tagId", tag.Delete)
		}

		categoryGroup := protected.Group("/categories")
		{
			categoryGroup.GET("", category.List)
			categoryGroup.POST("", category.Create)
			categoryGroup.GET("/:categoryId", category.GetByID)
			categoryGroup.GET("/slug/:slug", category.GetBySlug)
			categoryGroup.PATCH("/:categoryId", category.Update)
			categoryGroup.DELETE("/:categoryId", category.Delete)
		}

		collectionGroup := protected.Group("/collections")
		{
			collectionGroup.GET("", collection.List)
			collectionGroup.POST("", collection.Create)
			collectionGroup.GET("/:collectionId", collection.GetByID)
			collectionGroup.GET("/slug/:slug", collection.GetBySlug)
			collectionGroup.PATCH("/:collectionId", collection.Update)
			collectionGroup.DELETE("/:collectionId", collection.Delete)
		}

		libraryGroup := protected.Group("/libraries")
		{
			libraryGroup.GET("", library.List)
			libraryGroup.POST("", library.Create)
			libraryGroup.GET("/:libraryId", library.GetByID)
			libraryGroup.PATCH("/:libraryId", library.Update)
			libraryGroup.DELETE("/:libraryId", library.Delete)
		}

		dashboardGroup := protected.Group("/dashboard")
		{
			dashboardGroup.GET("/stats", dashboard.GetStats)
			dashboardGroup.GET("/weekly-views", dashboard.GetWeeklyViews)
			dashboardGroup.GET("/subscription-distribution", dashboard.GetSubscriptionDistribution)
			dashboardGroup.GET("/top-anime", dashboard.GetTopAnime)
			dashboardGroup.GET("/recent-uploads", dashboard.GetRecentUploads)
		}

		analyticsGroup := protected.Group("/analytics")
		{
			analyticsGroup.GET("/overview", analytics.GetOverview)
			analyticsGroup.GET("/overview/period", analytics.GetOverviewByPeriod)
			analyticsGroup.GET("/watch-time", analytics.GetWatchTime)
			analyticsGroup.GET("/watch-time/by-anime", analytics.GetWatchTimeByAnime)
			analyticsGroup.GET("/watch-time/by-episode", analytics.GetWatchTimeByEpisode)
			analyticsGroup.GET("/watch-time/histogram", analytics.GetWatchTimeHistogram)
			analyticsGroup.GET("/devices", analytics.GetDevices)
			analyticsGroup.GET("/devices/browsers", analytics.GetDevicesBrowsers)
			analyticsGroup.GET("/devices/os", analytics.GetDevicesOS)
			analyticsGroup.GET("/popular", analytics.GetPopular)
			analyticsGroup.GET("/popular/trending", analytics.GetPopularTrending)
			analyticsGroup.GET("/popular/new", analytics.GetPopularNew)
			analyticsGroup.GET("/geography", analytics.GetGeography)
			analyticsGroup.GET("/geography/top-countries", analytics.GetGeographyTopCountries)
			analyticsGroup.GET("/active-users", analytics.GetActiveUsers)
			analyticsGroup.GET("/active-users/retention", analytics.GetActiveUsersRetention)
			analyticsGroup.GET("/active-users/sessions", analytics.GetActiveUsersSessions)
		}

		systemHealthGroup := protected.Group("/system/health")
		{
			systemHealthGroup.GET("/services", system.HealthServices)
			systemHealthGroup.GET("/uptime", system.HealthUptime)
			systemHealthGroup.GET("/metrics", system.HealthMetrics)
		}

		systemLogsGroup := protected.Group("/system/logs")
		{
			systemLogsGroup.GET("", system.ListLogs)
			systemLogsGroup.GET("/search", system.SearchLogs)
			systemLogsGroup.GET("/:logId", system.GetLogByID)
		}

		systemQueueGroup := protected.Group("/system/queue")
		{
			systemQueueGroup.GET("", system.GetQueueStatus)
			systemQueueGroup.GET("/jobs", system.ListQueueJobs)
			systemQueueGroup.POST("/jobs/:jobId/retry", system.RetryQueueJob)
			systemQueueGroup.POST("/jobs/:jobId/cancel", system.CancelQueueJob)
			systemQueueGroup.POST("/flush", system.FlushQueue)
		}

		systemCacheGroup := protected.Group("/system/cache")
		{
			systemCacheGroup.GET("", system.GetCacheStatus)
			systemCacheGroup.POST("/flush", system.FlushCache)
			systemCacheGroup.POST("/flush/:pattern", system.FlushCacheByPattern)
			systemCacheGroup.GET("/keys", system.ListCacheKeys)
			systemCacheGroup.DELETE("/keys/:key", system.DeleteCacheKey)
		}

		systemSearchGroup := protected.Group("/system/search")
		{
			systemSearchGroup.GET("", system.GetSearchStatus)
			systemSearchGroup.POST("/reindex", system.TriggerReindex)
			systemSearchGroup.GET("/indexes", system.ListSearchIndexes)
			systemSearchGroup.GET("/indexes/:indexName", system.GetSearchIndexStats)
			systemSearchGroup.POST("/indexes/:indexName/update", system.UpdateSearchIndex)
		}

		systemBgJobsGroup := protected.Group("/system/background-jobs")
		{
			systemBgJobsGroup.GET("", system.ListBackgroundJobs)
			systemBgJobsGroup.POST("/:jobId/run", system.RunBackgroundJob)
			systemBgJobsGroup.POST("/:jobId/pause", system.PauseBackgroundJob)
			systemBgJobsGroup.POST("/:jobId/resume", system.ResumeBackgroundJob)
			systemBgJobsGroup.GET("/history", system.GetBackgroundJobHistory)
		}

		adminGroup := protected.Group("/admin")
		{
			adminGroup.GET("/users", adminUser.List)
			adminGroup.GET("/users/:userId", adminUser.GetByID)
			adminGroup.PATCH("/users/:userId", adminUser.Update)
			adminGroup.DELETE("/users/:userId", adminUser.Delete)
			adminGroup.POST("/users/:userId/disable", adminUser.Disable)
			adminGroup.POST("/users/:userId/enable", adminUser.Enable)
			adminGroup.GET("/users/:userId/sessions", adminUser.ListSessions)
			adminGroup.DELETE("/users/:userId/sessions/:sessionId", adminUser.RevokeSession)

			adminGroup.GET("/profiles", adminProfile.List)
			adminGroup.GET("/profiles/:userId", adminProfile.GetByUserID)
			adminGroup.PATCH("/profiles/:userId", adminProfile.Update)
			adminGroup.DELETE("/profiles/:userId", adminProfile.Delete)

			adminGroup.GET("/roles", adminRole.List)
			adminGroup.POST("/roles", adminRole.Create)
			adminGroup.GET("/roles/:roleId", adminRole.GetByID)
			adminGroup.PATCH("/roles/:roleId", adminRole.Update)
			adminGroup.DELETE("/roles/:roleId", adminRole.Delete)
			adminGroup.POST("/roles/:roleId/assign", adminRole.Assign)
			adminGroup.DELETE("/roles/:roleId/assign/:userId", adminRole.Unassign)

			adminGroup.GET("/permissions", adminPermission.GetMatrix)
			adminGroup.PATCH("/permissions", adminPermission.UpdateRolePermissions)
			adminGroup.GET("/permissions/effective/:userId", adminPermission.GetEffectivePermissions)

			adminGroup.GET("/comments", community.AdminListComments)
			adminGroup.GET("/comments/:commentId", community.AdminGetComment)
			adminGroup.PATCH("/comments/:commentId", community.AdminModerateComment)
			adminGroup.DELETE("/comments/:commentId", community.AdminDeleteComment)
			adminGroup.POST("/comments/:commentId/approve", community.AdminApproveComment)
			adminGroup.POST("/comments/:commentId/flag", community.AdminFlagComment)

			adminGroup.GET("/reviews", community.AdminListReviews)
			adminGroup.POST("/reviews/:reviewId/feature", community.AdminFeatureReview)

			adminGroup.GET("/reports", community.AdminListReports)
			adminGroup.GET("/reports/:reportId", community.AdminGetReport)
			adminGroup.PATCH("/reports/:reportId", community.AdminProcessReport)
			adminGroup.POST("/reports/:reportId/resolve", community.AdminResolveReport)
			adminGroup.POST("/reports/:reportId/dismiss", community.AdminDismissReport)

			adminGroup.GET("/moderations", moderation.GetQueue)
			adminGroup.GET("/moderations/:moderationId", moderation.GetItem)
			adminGroup.POST("/moderations/:moderationId/approve", moderation.Approve)
			adminGroup.POST("/moderations/:moderationId/reject", moderation.Reject)
			adminGroup.POST("/moderations/:moderationId/escalate", moderation.Escalate)

			adminGroup.GET("/watchlists/stats", community.AdminWatchlistStats)

			adminGroup.GET("/notifications/templates", notificationAdmin.ListTemplates)
			adminGroup.POST("/notifications/templates", notificationAdmin.CreateTemplate)
			adminGroup.PATCH("/notifications/templates/:templateId", notificationAdmin.UpdateTemplate)
			adminGroup.DELETE("/notifications/templates/:templateId", notificationAdmin.DeleteTemplate)
			adminGroup.POST("/notifications/send", notificationAdmin.Send)
			adminGroup.GET("/notifications/history", notificationAdmin.GetHistory)
		}

		supportGroup := protected.Group("/support")
		{
			supportGroup.GET("/tickets", support.ListTickets)
			supportGroup.POST("/tickets", support.CreateTicket)
			supportGroup.GET("/tickets/:ticketId", support.GetTicket)
			supportGroup.PATCH("/tickets/:ticketId", support.UpdateTicket)
			supportGroup.POST("/tickets/:ticketId/reply", support.ReplyToTicket)
			supportGroup.POST("/tickets/:ticketId/close", support.CloseTicket)
			supportGroup.POST("/tickets/:ticketId/escalate", support.EscalateTicket)

			supportGroup.GET("/contact", contactAdmin.List)
			supportGroup.GET("/contact/:messageId", contactAdmin.GetByID)
			supportGroup.PATCH("/contact/:messageId", contactAdmin.Update)
			supportGroup.POST("/contact/:messageId/reply", contactAdmin.Reply)
			supportGroup.DELETE("/contact/:messageId", contactAdmin.Delete)

			supportGroup.GET("/logs", support.SupportLogs)
			supportGroup.GET("/logs/export", support.ExportLogs)
		}

		adminFaqGroup := protected.Group("/support/faq")
		{
			adminFaqGroup.GET("", faq.List)
			adminFaqGroup.POST("", faq.Create)
			adminFaqGroup.GET("/:faqId", faq.GetByID)
			adminFaqGroup.PATCH("/:faqId", faq.Update)
			adminFaqGroup.DELETE("/:faqId", faq.Delete)
			adminFaqGroup.PUT("/reorder", faq.Reorder)
		}
	}
}

type apiHandler struct {
	deps Dependencies
}

func (h *apiHandler) principal(c *gin.Context) (interfaces.Principal, bool) {
	return middleware.PrincipalFromGin(c)
}

func (h *apiHandler) live(c *gin.Context) {
	utils.Success(c, http.StatusOK, gin.H{
		"status":  "alive",
		"role":    h.runtimeRole(),
		"version": h.deps.Config.App.Version,
	})
}

func (h *apiHandler) runtimeRole() string {
	if h.deps.RuntimeRole == "" {
		return "api"
	}
	return h.deps.RuntimeRole
}

func (h *apiHandler) health(c *gin.Context) {
	status := "healthy"
	redisStatus := "disabled"
	if err := h.deps.Database.Ping(c.Request.Context()); err != nil {
		status = "degraded"
	}
	if h.deps.Redis != nil {
		redisHealth := h.deps.Redis.Health(c.Request.Context())
		redisStatus = string(redisHealth.Status)
		if redisHealth.Status != redisclient.StatusHealthy {
			status = "degraded"
		}
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   status,
		"database": "healthy",
		"redis":    redisStatus,
		"role":     h.runtimeRole(),
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	result := gin.H{"database": "healthy", "redis": "disabled"}
	if err := h.deps.Database.Ping(ctx); err != nil {
		result["database"] = "unhealthy"
		utils.Error(c, utils.ErrDependencyUnavailable)
		return
	}
	if h.deps.Config.Redis.Enabled {
		if h.deps.Redis == nil || !h.deps.Redis.IsAvailable() {
			if h.deps.Config.Redis.Required {
				result["redis"] = "unhealthy"
				utils.Error(c, utils.ErrDependencyUnavailable)
				return
			}
			result["redis"] = "unavailable"
		} else {
			result["redis"] = "healthy"
		}
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   "ready",
		"database": result["database"],
		"redis":    result["redis"],
		"role":     h.runtimeRole(),
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) me(c *gin.Context) {
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.GetMe(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":                user.ID,
		"email":             user.Email,
		"displayName":       user.DisplayName,
		"avatarUrl":         user.AvatarURL,
		"status":            user.Status,
		"presenceStatus":    "offline",
		"roles":             principal.Roles,
		"permissions":       principal.Permissions,
		"workspaceId":       principal.WorkspaceID,
		"createdAt":         user.CreatedAt,
		"updatedAt":         user.UpdatedAt,
		"lastSeenAt":        nil,
		"disabledAt":        user.DisabledAt,
		"emailVerifiedAt":   user.EmailVerifiedAt,
		"passwordChangedAt": user.PasswordChangedAt,
	})
}

func (h *apiHandler) updateMe(c *gin.Context) {
	var req struct {
		DisplayName string `json:"displayName"`
		AvatarURL   string `json:"avatarUrl"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.UpdateMe(c.Request.Context(), principal, req.DisplayName, req.AvatarURL, req.Status)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":                user.ID,
		"email":             user.Email,
		"displayName":       user.DisplayName,
		"avatarUrl":         user.AvatarURL,
		"status":            user.Status,
		"presenceStatus":    "offline",
		"roles":             principal.Roles,
		"permissions":       principal.Permissions,
		"workspaceId":       principal.WorkspaceID,
		"createdAt":         user.CreatedAt,
		"updatedAt":         user.UpdatedAt,
		"lastSeenAt":        nil,
		"disabledAt":        user.DisabledAt,
		"emailVerifiedAt":   user.EmailVerifiedAt,
		"passwordChangedAt": user.PasswordChangedAt,
	})
}

func (h *apiHandler) listWorkspaces(c *gin.Context) {
	principal, _ := h.principal(c)
	items, err := h.deps.WorkspaceService.List(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *apiHandler) createWorkspace(c *gin.Context) {
	var req struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.WorkspaceService.Create(c.Request.Context(), principal, req.Name, req.Slug, req.Description)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) getWorkspace(c *gin.Context)    { h.workspaceResource(c, "get") }
func (h *apiHandler) updateWorkspace(c *gin.Context) { h.workspaceResource(c, "update") }
func (h *apiHandler) deleteWorkspace(c *gin.Context) { h.workspaceResource(c, "delete") }

func (h *apiHandler) workspaceResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("workspaceId")
	switch action {
	case "get":
		item, err := h.deps.WorkspaceService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name, Description string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.Update(c.Request.Context(), principal, id, req.Name, req.Description)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.Archive(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) listWorkspaceMembers(c *gin.Context)   { h.membersResource(c, "list") }
func (h *apiHandler) createWorkspaceMember(c *gin.Context)  { h.membersResource(c, "create") }
func (h *apiHandler) provisionWorkspaceUser(c *gin.Context) { h.membersResource(c, "provision") }
func (h *apiHandler) updateWorkspaceMember(c *gin.Context)  { h.membersResource(c, "update") }
func (h *apiHandler) deleteWorkspaceMember(c *gin.Context)  { h.membersResource(c, "delete") }

func (h *apiHandler) membersResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.WorkspaceService.ListMembers(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct {
			UserID string `json:"userId"`
			Email  string `json:"email"`
			Role   string `json:"role"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.AddMember(c.Request.Context(), principal, workspaceID, req.UserID, req.Email, req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	case "provision":
		var req struct {
			Email             string `json:"email"`
			DisplayName       string `json:"displayName"`
			Role              string `json:"role"`
			TemporaryPassword string `json:"temporaryPassword"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.ProvisionWorkspaceUser(
			c.Request.Context(),
			principal,
			workspaceID,
			services.ProvisionWorkspaceUserInput{
				Email:             req.Email,
				DisplayName:       req.DisplayName,
				Role:              req.Role,
				TemporaryPassword: req.TemporaryPassword,
			},
		)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	case "update":
		var req struct{ Role string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.UpdateMember(c.Request.Context(), principal, workspaceID, c.Param("userId"), req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.RemoveMember(c.Request.Context(), principal, workspaceID, c.Param("userId")); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) metrics(c *gin.Context) {
	c.String(http.StatusOK, "")
}

func (h *apiHandler) webhook(c *gin.Context) {
	payload, _ := io.ReadAll(io.LimitReader(c.Request.Body, 1<<20))
	_ = payload
	utils.Success(c, http.StatusAccepted, gin.H{"accepted": true})
}
