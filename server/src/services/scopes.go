package services

import (
	"strings"

	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

var validScopes = map[string]struct{}{
	"bots:read":          {},
	"bots:write":         {},
	"logs:read":          {},
	"logs:write":         {},
	"protect:read":       {},
	"protect:write":      {},
	"player:read":        {},
	"player:write":       {},
	"webhooks:read":      {},
	"webhooks:write":     {},
	"billing:read":       {},
	"billing:write":      {},
	"integrations:read":  {},
	"integrations:write": {},
	"audit:read":         {},
}

func normalizeScopes(scopes []string) []string {
	seen := make(map[string]struct{}, len(scopes))
	out := make([]string, 0, len(scopes))
	for _, scope := range scopes {
		scope = strings.TrimSpace(scope)
		if scope == "" {
			continue
		}
		if _, ok := seen[scope]; ok {
			continue
		}
		seen[scope] = struct{}{}
		out = append(out, scope)
	}
	return out
}

func validScopesSet(scopes []string) error {
	for _, scope := range scopes {
		if _, ok := validScopes[scope]; !ok {
			return utils.NewError(400, "INVALID_SCOPE", "Unknown API scope: "+scope, map[string]any{"scope": scope})
		}
	}
	return nil
}
