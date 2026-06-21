package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/service"
	"github.com/carrot-watch/backend/pkg/apierr"
)

// AuthHandler exposes authentication endpoints.
type AuthHandler struct {
	authSvc *service.AuthService
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(authSvc *service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

type tokenPairResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// Register handles POST /api/v1/auth/register.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if err := validateRegisterInput(req); err != nil {
		apierr.BadRequest(w, err.Error())
		return
	}

	if req.Role == "" {
		req.Role = "owner"
	}

	result, err := h.authSvc.Register(r.Context(), req.Email, req.Password, req.FullName, req.Role)
	if err != nil {
		if errors.Is(err, service.ErrEmailTaken) {
			apierr.Conflict(w, "email already registered")
			return
		}
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusCreated, tokenPairResponse{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login handles POST /api/v1/auth/login.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	result, err := h.authSvc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCreds) {
			// Return 401 with a generic message to avoid email enumeration.
			apierr.Write(w, http.StatusUnauthorized, "invalid_credentials", "invalid email or password")
			return
		}
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, tokenPairResponse{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	})
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// Refresh handles POST /api/v1/auth/refresh.
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	if req.RefreshToken == "" {
		apierr.BadRequest(w, "refresh_token is required")
		return
	}

	result, err := h.authSvc.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		if errors.Is(err, service.ErrTokenNotFound) {
			apierr.Unauthorized(w)
			return
		}
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, tokenPairResponse{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	})
}

// Logout handles POST /api/v1/auth/logout.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	_ = h.authSvc.Logout(r.Context(), req.RefreshToken)
	w.WriteHeader(http.StatusNoContent)
}

// Me handles GET /api/v1/auth/me.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	userIDParsed, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	user, err := h.authSvc.GetUser(r.Context(), userIDParsed)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func validateRegisterInput(req registerRequest) error {
	if !strings.Contains(req.Email, "@") || len(req.Email) < 5 {
		return errors.New("invalid email address")
	}
	if len(req.Password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	if strings.TrimSpace(req.FullName) == "" {
		return errors.New("full_name is required")
	}
	return nil
}
