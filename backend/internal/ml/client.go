package ml

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// ReadingInput is a single sensor reading sent to the ML service for scoring.
type ReadingInput struct {
	ID            string  `json:"id"`
	RecordedAt    string  `json:"recorded_at"`
	HeartRateBPM  *int    `json:"heart_rate_bpm,omitempty"`
	HrvMs         *float64 `json:"hrv_ms,omitempty"`
	SkinTempC     *float64 `json:"skin_temp_c,omitempty"`
	ActivityIndex *float64 `json:"activity_index,omitempty"`
}

// BaselineInput is a per-metric baseline summary forwarded from the DB.
type BaselineInput struct {
	Mean       float64 `json:"mean"`
	StdDev     float64 `json:"std_dev"`
	LowerBound float64 `json:"lower_bound"`
	UpperBound float64 `json:"upper_bound"`
}

// AnomalyScoreRequest is the payload sent to POST /anomaly/score.
type AnomalyScoreRequest struct {
	HorseID   string                    `json:"horse_id"`
	Readings  []ReadingInput            `json:"readings"`
	Baselines map[string]BaselineInput  `json:"baselines"`
}

// AnomalyScoreResult holds the score for a single reading.
type AnomalyScoreResult struct {
	ReadingID             string   `json:"reading_id"`
	RecordedAt            string   `json:"recorded_at"`
	AnomalyScore          float64  `json:"anomaly_score"`
	IsAnomalous           bool     `json:"is_anomalous"`
	ContributingMetrics   []string `json:"contributing_metrics"`
}

// ChatRequest is the payload for POST /chat.
type ChatRequest struct {
	HorseID             string            `json:"horse_id"`
	HorseName           string            `json:"horse_name"`
	Message             string            `json:"message"`
	ConversationHistory []ChatMessage     `json:"conversation_history"`
	Context             HorseHealthContext `json:"context"`
}

// ChatMessage is a single turn in a conversation.
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// HorseHealthContext summarizes current horse health for the AI prompt.
type HorseHealthContext struct {
	LatestHeartRateBPM *int     `json:"latest_heart_rate_bpm,omitempty"`
	BaselineHeartRate  *float64 `json:"baseline_heart_rate,omitempty"`
	LatestTempC        *float64 `json:"latest_temp_c,omitempty"`
	BaselineTemp       *float64 `json:"baseline_temp,omitempty"`
	LatestHrvMs        *float64 `json:"latest_hrv_ms,omitempty"`
	BaselineHrv        *float64 `json:"baseline_hrv,omitempty"`
	LatestActivityIndex *float64 `json:"latest_activity_index,omitempty"`
	ActiveAlertCount   int      `json:"active_alert_count"`
	AlertSummary       string   `json:"alert_summary"`
}

// ChatResponse is the reply from POST /chat.
type ChatResponse struct {
	Reply string `json:"reply"`
}

// Client calls the Python ML microservice over internal HTTP.
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient creates a Client targeting the given base URL.
func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// ScoreAnomalies asks the ML service to score a batch of readings.
func (c *Client) ScoreAnomalies(ctx context.Context, req AnomalyScoreRequest) ([]AnomalyScoreResult, error) {
	var results []AnomalyScoreResult
	if err := c.post(ctx, "/anomaly/score", req, &results); err != nil {
		return nil, fmt.Errorf("score anomalies: %w", err)
	}
	return results, nil
}

// Chat sends a user message to the ML chat endpoint and returns the reply.
func (c *Client) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	var resp ChatResponse
	if err := c.post(ctx, "/chat", req, &resp); err != nil {
		return nil, fmt.Errorf("chat: %w", err)
	}
	return &resp, nil
}

// Ping checks whether the ML service is reachable.
func (c *Client) Ping(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/healthz", nil)
	if err != nil {
		return err
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("ml service unhealthy: %d", resp.StatusCode)
	}
	return nil
}

func (c *Client) post(ctx context.Context, path string, body, out any) error {
	b, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(b))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("http post %s: %w", path, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("ml service error %d for %s", resp.StatusCode, path)
	}

	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		return fmt.Errorf("decode response from %s: %w", path, err)
	}

	return nil
}
