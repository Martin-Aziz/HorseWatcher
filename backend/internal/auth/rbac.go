package auth

import (
	"net/http"

	"github.com/carrot-watch/backend/pkg/apierr"
)

// Permission names map to specific API capabilities.
type Permission string

const (
	PermViewHorse          Permission = "horse:view"
	PermEditHorse          Permission = "horse:edit"
	PermDeleteHorse        Permission = "horse:delete"
	PermGrantAccess        Permission = "horse:grant_access"
	PermViewReadings       Permission = "readings:view"
	PermViewAlerts         Permission = "alerts:view"
	PermAcknowledgeAlerts  Permission = "alerts:acknowledge"
	PermViewBaseline       Permission = "baseline:view"
	PermViewFullHistory    Permission = "history:view_full"
	PermManageStable       Permission = "stable:manage"
	PermUseAIAssistant     Permission = "ai:use"
	PermAddVetNotes        Permission = "vet_notes:add"
)

// rolePermissions defines what each role is allowed to do globally.
// Fine-grained per-horse access is enforced in the service layer via horse_access table.
var rolePermissions = map[string][]Permission{
	"owner": {
		PermViewHorse, PermEditHorse, PermDeleteHorse, PermGrantAccess,
		PermViewReadings, PermViewAlerts, PermAcknowledgeAlerts,
		PermViewBaseline, PermManageStable, PermUseAIAssistant,
	},
	"stable_manager": {
		PermViewHorse, PermEditHorse,
		PermViewReadings, PermViewAlerts, PermAcknowledgeAlerts,
		PermViewBaseline, PermManageStable, PermUseAIAssistant,
	},
	"trainer": {
		PermViewHorse, PermViewReadings, PermViewAlerts,
		PermAcknowledgeAlerts, PermViewBaseline, PermUseAIAssistant,
	},
	"vet": {
		PermViewHorse, PermViewReadings, PermViewAlerts,
		PermViewBaseline, PermViewFullHistory, PermUseAIAssistant, PermAddVetNotes,
	},
	"rider": {
		PermViewHorse, PermViewReadings, PermViewAlerts, PermViewBaseline,
	},
}

// HasPermission reports whether a role includes the given permission.
func HasPermission(role string, perm Permission) bool {
	for _, p := range rolePermissions[role] {
		if p == perm {
			return true
		}
	}
	return false
}

// RequirePermission returns a middleware that rejects requests from roles without the given permission.
func RequirePermission(perm Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := ClaimsFromContext(r.Context())
			if claims == nil {
				apierr.Unauthorized(w)
				return
			}

			if !HasPermission(claims.Role, perm) {
				apierr.Forbidden(w)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
