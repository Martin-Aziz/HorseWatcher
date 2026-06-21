package apierr

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse is the canonical error body returned by all API endpoints.
type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// Write serializes an error response and sets the appropriate HTTP status code.
func Write(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(ErrorResponse{Code: code, Message: message})
}

// Common error writers.

func BadRequest(w http.ResponseWriter, message string) {
	Write(w, http.StatusBadRequest, "bad_request", message)
}

func Unauthorized(w http.ResponseWriter) {
	Write(w, http.StatusUnauthorized, "unauthorized", "authentication required")
}

func Forbidden(w http.ResponseWriter) {
	Write(w, http.StatusForbidden, "forbidden", "insufficient permissions")
}

func NotFound(w http.ResponseWriter, resource string) {
	Write(w, http.StatusNotFound, "not_found", resource+" not found")
}

func Conflict(w http.ResponseWriter, message string) {
	Write(w, http.StatusConflict, "conflict", message)
}

func InternalServer(w http.ResponseWriter) {
	Write(w, http.StatusInternalServerError, "internal_error", "an unexpected error occurred")
}

func UnprocessableEntity(w http.ResponseWriter, message string) {
	Write(w, http.StatusUnprocessableEntity, "validation_error", message)
}
