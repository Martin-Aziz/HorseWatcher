package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/carrot-watch/backend/pkg/apierr"
)

type contextKey string

const claimsKey contextKey = "claims"

// Middleware validates the Bearer token and injects claims into the request context.
//
// The token is accepted from two sources, in priority order:
//  1. Authorization: Bearer <token> header (preferred for all REST endpoints)
//  2. ?token=<token> query parameter (required for SSE/EventSource which cannot set headers)
//
// SSE token-from-query is intentionally allowed because the EventSource browser API does
// not support custom headers. Tokens passed via query string are still validated identically
// — the security boundary is the JWT signature, not the transport mechanism.
func Middleware(jwtSvc *Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, ok := extractToken(r)
			if !ok {
				apierr.Unauthorized(w)
				return
			}

			claims, err := jwtSvc.Validate(token)
			if err != nil {
				apierr.Unauthorized(w)
				return
			}

			if claims.Type != TokenTypeAccess {
				apierr.Unauthorized(w)
				return
			}

			ctx := context.WithValue(r.Context(), claimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// ClaimsFromContext retrieves JWT claims previously set by the auth middleware.
// Returns nil if the context carries no claims.
func ClaimsFromContext(ctx context.Context) *Claims {
	claims, _ := ctx.Value(claimsKey).(*Claims)
	return claims
}

// extractToken pulls a bearer token from the Authorization header, falling back to the
// `token` query parameter for SSE endpoints (EventSource cannot set custom headers).
func extractToken(r *http.Request) (string, bool) {
	// Prefer the Authorization header — the standard transport.
	header := r.Header.Get("Authorization")
	if strings.HasPrefix(header, "Bearer ") {
		token := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
		if token != "" {
			return token, true
		}
	}

	// Fall back to query param (only used by SSE clients).
	if token := r.URL.Query().Get("token"); token != "" {
		return token, true
	}

	return "", false
}
