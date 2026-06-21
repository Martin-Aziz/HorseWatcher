package service

import (
	"context"
	"errors"
	"fmt"

	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var ErrHorseNotFound = errors.New("horse not found")
var ErrUnauthorized   = errors.New("access denied")

// HorseService handles horse CRUD and access management.
type HorseService struct {
	q *sqlcgen.Queries
}

// NewHorseService constructs a HorseService.
func NewHorseService(q *sqlcgen.Queries) *HorseService {
	return &HorseService{q: q}
}

// ListForUser returns all horses visible to the user.
func (s *HorseService) ListForUser(ctx context.Context, userID uuid.UUID) ([]sqlcgen.Horse, error) {
	horses, err := s.q.ListHorsesByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list horses: %w", err)
	}
	return horses, nil
}

// GetForUser returns a single horse, checking that the user has access.
func (s *HorseService) GetForUser(ctx context.Context, horseID, userID uuid.UUID) (sqlcgen.Horse, error) {
	horse, err := s.q.GetHorseWithAccess(ctx, sqlcgen.GetHorseWithAccessParams{
		ID:    horseID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlcgen.Horse{}, ErrHorseNotFound
		}
		return sqlcgen.Horse{}, fmt.Errorf("get horse: %w", err)
	}
	return horse, nil
}

// Create registers a new horse owned by the authenticated user.
func (s *HorseService) Create(ctx context.Context, params sqlcgen.CreateHorseParams) (sqlcgen.Horse, error) {
	horse, err := s.q.CreateHorse(ctx, params)
	if err != nil {
		return sqlcgen.Horse{}, fmt.Errorf("create horse: %w", err)
	}
	return horse, nil
}

// Update modifies a horse's profile. Only the owner may update.
func (s *HorseService) Update(ctx context.Context, params sqlcgen.UpdateHorseParams) (sqlcgen.Horse, error) {
	horse, err := s.q.UpdateHorse(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlcgen.Horse{}, ErrHorseNotFound
		}
		return sqlcgen.Horse{}, fmt.Errorf("update horse: %w", err)
	}
	return horse, nil
}

// Delete removes a horse. Only the owner may delete.
func (s *HorseService) Delete(ctx context.Context, horseID, ownerID uuid.UUID) error {
	if err := s.q.DeleteHorse(ctx, sqlcgen.DeleteHorseParams{
		ID:      horseID,
		OwnerID: ownerID,
	}); err != nil {
		return fmt.Errorf("delete horse: %w", err)
	}
	return nil
}

// GrantAccess grants a user a role on a horse. Only the owner may grant.
func (s *HorseService) GrantAccess(ctx context.Context, horseID, ownerID, targetUserID uuid.UUID, role string) error {
	// Verify ownership before granting.
	horse, err := s.q.GetHorseByID(ctx, horseID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrHorseNotFound
		}
		return fmt.Errorf("get horse: %w", err)
	}
	if horse.OwnerID != ownerID {
		return ErrUnauthorized
	}

	return s.q.GrantHorseAccess(ctx, sqlcgen.GrantHorseAccessParams{
		HorseID: horseID,
		UserID:  targetUserID,
		Role:    role,
	})
}

// RevokeAccess removes a user's access to a horse. Only the owner may revoke.
func (s *HorseService) RevokeAccess(ctx context.Context, horseID, ownerID, targetUserID uuid.UUID) error {
	horse, err := s.q.GetHorseByID(ctx, horseID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrHorseNotFound
		}
		return fmt.Errorf("get horse: %w", err)
	}
	if horse.OwnerID != ownerID {
		return ErrUnauthorized
	}

	return s.q.RevokeHorseAccess(ctx, sqlcgen.RevokeHorseAccessParams{
		HorseID: horseID,
		UserID:  targetUserID,
	})
}
