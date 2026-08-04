package routes

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/astron-collection/server/src/config"
	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"gorm.io/gorm"
)

type databaseStub struct{}

func (databaseStub) Gorm() *gorm.DB                                             { return nil }
func (databaseStub) Ping(context.Context) error                                 { return nil }
func (databaseStub) Close() error                                               { return nil }
func (databaseStub) Transaction(context.Context, func(tx *gorm.DB) error) error { return nil }

type eventBusStub struct{}

func (eventBusStub) Publish(context.Context, interfaces.Event) error { return nil }
func (eventBusStub) Subscribe(context.Context, string, interfaces.EventHandler) error {
	return nil
}
func (eventBusStub) Close() error                  { return nil }
func (eventBusStub) Healthy(context.Context) error { return nil }

type identityProviderStub struct{}

func (identityProviderStub) Authenticate(context.Context, string) (*interfaces.Principal, error) {
	return &interfaces.Principal{UserID: "user-1"}, nil
}
func (identityProviderStub) IssueToken(context.Context, interfaces.Principal) (string, error) {
	return "", nil
}

func TestHealthRoutes(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	SetupRoutes(router, Dependencies{
		Config: config.Config{
			App: config.AppConfig{Version: "test"},
		},
		Database:    databaseStub{},
		EventBus:    eventBusStub{},
		RuntimeRole: "api",
	})

	for _, target := range []string{"/health/live", "/health/ready", "/api/v1/health", "/api/v1/ready"} {
		req := httptest.NewRequest(http.MethodGet, target, nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("%s returned %d", target, rec.Code)
		}
	}
}

func TestProtectedRoutesRequireAuthentication(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	SetupRoutes(router, Dependencies{
		Config: config.Config{
			App: config.AppConfig{Version: "test"},
		},
		Database:    databaseStub{},
		EventBus:    eventBusStub{},
		RuntimeRole: "api",
	})

	protected := []string{
		"/api/v1/me",
		"/api/v1/me/preferences",
		"/api/v1/workspaces",
		"/api/v1/workspaces/w-1",
		"/api/v1/workspaces/w-1/members",
		"/api/v1/workspaces/w-1/bots",
		"/api/v1/workspaces/w-1/api-keys",
		"/api/v1/workspaces/w-1/logs",
		"/api/v1/workspaces/w-1/protect/rules",
		"/api/v1/workspaces/w-1/protect/events",
		"/api/v1/workspaces/w-1/player/sessions",
		"/api/v1/workspaces/w-1/player/playbacks",
		"/api/v1/workspaces/w-1/webhooks",
		"/api/v1/workspaces/w-1/billing/subscription",
		"/api/v1/workspaces/w-1/integrations",
		"/api/v1/workspaces/w-1/audit-logs",
		"/api/v1/notifications",
	}

	for _, target := range protected {
		req := httptest.NewRequest(http.MethodGet, target, nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("%s expected 401, got %d", target, rec.Code)
		}
	}
}
