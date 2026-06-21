package service

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/carrot-watch/backend/internal/auth"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailTaken     = errors.New("email already registered")
	ErrInvalidCreds   = errors.New("invalid email or password")
	ErrTokenNotFound  = errors.New("refresh token not found or expired")
)

// AuthService handles user registration, login, and token rotation.
type AuthService struct {
	q       *sqlcgen.Queries
	jwtSvc  *auth.Service
	refreshTTL time.Duration
}

// NewAuthService constructs an AuthService.
func NewAuthService(q *sqlcgen.Queries, jwtSvc *auth.Service, refreshTTL time.Duration) *AuthService {
	return &AuthService{q: q, jwtSvc: jwtSvc, refreshTTL: refreshTTL}
}

// RegisterResult holds the tokens returned after a successful registration.
type RegisterResult struct {
	User         sqlcgen.User
	AccessToken  string
	RefreshToken string
}

// Register creates a new user and returns a token pair.
func (s *AuthService) Register(ctx context.Context, email, password, fullName, role string) (*RegisterResult, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user, err := s.q.CreateUser(ctx, sqlcgen.CreateUserParams{
		Email:        email,
		PasswordHash: string(hash),
		FullName:     fullName,
		Role:         role,
	})
	if err != nil {
		if isDuplicateError(err) {
			return nil, ErrEmailTaken
		}
		return nil, fmt.Errorf("create user: %w", err)
	}

	return s.issueTokens(ctx, user)
}

// LoginResult holds the tokens returned after a successful login.
type LoginResult struct {
	User         sqlcgen.User
	AccessToken  string
	RefreshToken string
}

// Login validates credentials and returns a token pair.
func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	user, err := s.q.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidCreds
		}
		return nil, fmt.Errorf("get user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCreds
	}

	res, err := s.issueTokens(ctx, user)
	if err != nil {
		return nil, err
	}

	return &LoginResult{User: res.User, AccessToken: res.AccessToken, RefreshToken: res.RefreshToken}, nil
}

// RefreshResult holds the new token pair after rotating a refresh token.
type RefreshResult struct {
	AccessToken  string
	RefreshToken string
	UserID       string
	Role         string
}

// Refresh validates a refresh token, revokes it, and issues a new pair.
func (s *AuthService) Refresh(ctx context.Context, rawToken string) (*RefreshResult, error) {
	hash := hashToken(rawToken)

	row, err := s.q.GetRefreshTokenByHash(ctx, hash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTokenNotFound
		}
		return nil, fmt.Errorf("get refresh token: %w", err)
	}

	if err := s.q.RevokeRefreshToken(ctx, hash); err != nil {
		return nil, fmt.Errorf("revoke old token: %w", err)
	}

	userIDStr := row.UserID.String()
	access, err := s.jwtSvc.GenerateAccessToken(userIDStr, row.Role)
	if err != nil {
		return nil, fmt.Errorf("generate access token: %w", err)
	}

	refresh, tokenHash, err := s.generateAndStoreRefresh(ctx, row.UserID, row.Role)
	if err != nil {
		return nil, err
	}
	_ = tokenHash

	return &RefreshResult{
		AccessToken:  access,
		RefreshToken: refresh,
		UserID:       userIDStr,
		Role:         row.Role,
	}, nil
}

// Logout revokes the given refresh token.
func (s *AuthService) Logout(ctx context.Context, rawToken string) error {
	return s.q.RevokeRefreshToken(ctx, hashToken(rawToken))
}

// GetUser returns the user for the given ID.
func (s *AuthService) GetUser(ctx context.Context, userID uuid.UUID) (sqlcgen.User, error) {
	return s.q.GetUserByID(ctx, userID)
}

func (s *AuthService) issueTokens(ctx context.Context, user sqlcgen.User) (*RegisterResult, error) {
	userIDStr := user.ID.String()

	access, err := s.jwtSvc.GenerateAccessToken(userIDStr, user.Role)
	if err != nil {
		return nil, fmt.Errorf("generate access token: %w", err)
	}

	refresh, _, err := s.generateAndStoreRefresh(ctx, user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	return &RegisterResult{User: user, AccessToken: access, RefreshToken: refresh}, nil
}

func (s *AuthService) generateAndStoreRefresh(ctx context.Context, userID uuid.UUID, role string) (string, string, error) {
	rawToken, err := s.jwtSvc.GenerateRefreshToken(userID.String(), role)
	if err != nil {
		return "", "", fmt.Errorf("generate refresh token: %w", err)
	}

	hash := hashToken(rawToken)
	expiresAt := time.Now().Add(s.refreshTTL)

	var pgExpiresAt pgtype.Timestamptz
	if err := pgExpiresAt.Scan(expiresAt); err != nil {
		return "", "", fmt.Errorf("scan expires_at: %w", err)
	}

	_, err = s.q.CreateRefreshToken(ctx, sqlcgen.CreateRefreshTokenParams{
		UserID:    userID,
		TokenHash: hash,
		ExpiresAt: pgExpiresAt,
	})
	if err != nil {
		return "", "", fmt.Errorf("store refresh token: %w", err)
	}

	return rawToken, hash, nil
}

// hashToken returns the SHA-256 hex digest of a raw token string.
// Hashing prevents the token from being recoverable if the DB is compromised.
func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return fmt.Sprintf("%x", sum)
}

func isDuplicateError(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "duplicate key") || strings.Contains(msg, "unique constraint")
}
