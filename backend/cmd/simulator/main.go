package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"
)

// HorseState represents the activity state for the Markov chain.
type HorseState int

const (
	StateResting HorseState = iota
	StateWalking
	StateTrotting
	StateCantering
	StateStressed
)

// Markov transition matrix indexed by [currentState][nextState].
// Rows must sum to 1.0.
var transitions = [5][5]float64{
	// Rest   Walk   Trot   Canter Stress
	{0.70, 0.20, 0.05, 0.01, 0.04}, // from Rest
	{0.40, 0.35, 0.15, 0.05, 0.05}, // from Walk
	{0.20, 0.30, 0.35, 0.10, 0.05}, // from Trot
	{0.10, 0.20, 0.40, 0.25, 0.05}, // from Canter
	{0.35, 0.30, 0.10, 0.05, 0.20}, // from Stress
}

// vitalsRange defines [min, max] for a metric in each state.
type vitalsRange struct {
	hrMin, hrMax     float64
	tempMin, tempMax float64
	actMin, actMax   float64
}

var stateVitals = [5]vitalsRange{
	{28, 36, 37.5, 38.0, 0, 5},    // Resting
	{40, 50, 37.8, 38.3, 20, 40},  // Walking
	{80, 120, 38.2, 38.8, 60, 80}, // Trotting
	{130, 180, 38.5, 39.2, 80, 95}, // Cantering
	{55, 75, 38.3, 38.9, 15, 30},  // Stressed
}

// HorseSimulator maintains state for a single simulated horse.
type HorseSimulator struct {
	horseID        string
	deviceID       string
	state          HorseState
	anomalyTicks   int  // remaining ticks in an active anomaly injection
	rng            *rand.Rand
}

func newHorseSimulator(horseID, deviceID string, seed int64) *HorseSimulator {
	return &HorseSimulator{
		horseID:  horseID,
		deviceID: deviceID,
		state:    StateResting,
		rng:      rand.New(rand.NewSource(seed)),
	}
}

func (s *HorseSimulator) nextState(hour int) HorseState {
	// Time-of-day bias: horses mostly rest at night (22–06).
	if hour >= 22 || hour < 6 {
		if s.state != StateResting && s.rng.Float64() < 0.3 {
			return StateResting
		}
	}

	row := transitions[s.state]
	r := s.rng.Float64()
	var cumulative float64
	for i, p := range row {
		cumulative += p
		if r < cumulative {
			return HorseState(i)
		}
	}
	return StateResting
}

func (s *HorseSimulator) generateReading(now time.Time) reading {
	hour := now.Hour()
	s.state = s.nextState(hour)

	v := stateVitals[s.state]
	hr := lerp(v.hrMin, v.hrMax, s.rng.Float64()) + s.rng.NormFloat64()*0.8
	temp := lerp(v.tempMin, v.tempMax, s.rng.Float64()) + s.rng.NormFloat64()*0.05
	activity := lerp(v.actMin, v.actMax, s.rng.Float64())

	// HRV inversely correlated with HR: higher HR → lower HRV.
	hrv := 120.0 - (hr-28)*0.8 + s.rng.NormFloat64()*3.0
	if hrv < 10 {
		hrv = 10
	}

	// 5% chance to begin a 15-tick anomaly injection for a compelling demo.
	if s.anomalyTicks == 0 && s.rng.Float64() < 0.05 {
		s.anomalyTicks = 15
	}

	if s.anomalyTicks > 0 {
		// Push heart rate 3–4 standard deviations above resting baseline (~28–36 bpm ± 3).
		hr += 18 + s.rng.Float64()*10
		temp += 0.8 + s.rng.Float64()*0.4
		hrv -= 20 + s.rng.Float64()*10
		s.anomalyTicks--
	}

	return reading{
		RecordedAt:    now.UTC().Format(time.RFC3339),
		HeartRateBPM:  intPtr(int(math.Round(hr))),
		HrvMs:         floatPtr(math.Round(hrv*10) / 10),
		SkinTempC:     floatPtr(math.Round(temp*100) / 100),
		ActivityIndex: floatPtr(math.Round(activity*10) / 10),
	}
}

type reading struct {
	RecordedAt    string   `json:"recorded_at"`
	HeartRateBPM  *int     `json:"heart_rate_bpm,omitempty"`
	HrvMs         *float64 `json:"hrv_ms,omitempty"`
	SkinTempC     *float64 `json:"skin_temp_c,omitempty"`
	ActivityIndex *float64 `json:"activity_index,omitempty"`
}

type ingestPayload struct {
	HorseID  string    `json:"horse_id"`
	DeviceID string    `json:"device_id"`
	Readings []reading `json:"readings"`
}

func main() {
	apiURL := getenv("SIMULATOR_API_URL", "http://localhost:8080")
	intervalSec, _ := strconv.Atoi(getenv("SIMULATOR_INTERVAL_SECONDS", "10"))

	// Horse IDs to simulate — comma-separated env var or defaults for demo.
	horseIDs := []string{
		getenv("SIMULATOR_HORSE_1", ""),
		getenv("SIMULATOR_HORSE_2", ""),
	}

	// Filter out empty entries.
	var active []string
	for _, id := range horseIDs {
		if id != "" {
			active = append(active, id)
		}
	}

	if len(active) == 0 {
		slog.Error("no horse IDs configured; set SIMULATOR_HORSE_1, SIMULATOR_HORSE_2, ...")
		os.Exit(1)
	}

	simulators := make([]*HorseSimulator, len(active))
	for i, id := range active {
		simulators[i] = newHorseSimulator(id, fmt.Sprintf("CW-SIM-%02d", i+1), int64(i+42))
	}

	slog.Info("simulator starting", "horses", len(simulators), "interval_sec", intervalSec)

	ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
	defer ticker.Stop()

	client := &http.Client{Timeout: 10 * time.Second}

	for range ticker.C {
		now := time.Now()
		var wg sync.WaitGroup
		for _, sim := range simulators {
			wg.Add(1)
			go func(s *HorseSimulator) {
				defer wg.Done()
				r := s.generateReading(now)
				if err := postReading(client, apiURL, s.horseID, s.deviceID, r); err != nil {
					slog.Warn("ingest failed", "horse_id", s.horseID, "error", err)
				}
			}(sim)
		}
		wg.Wait()
	}
}

func postReading(client *http.Client, apiURL, horseID, deviceID string, r reading) error {
	payload := ingestPayload{
		HorseID:  horseID,
		DeviceID: deviceID,
		Readings: []reading{r},
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := client.Post(apiURL+"/api/v1/readings", "application/json", bytes.NewReader(b))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("ingest rejected: %d", resp.StatusCode)
	}
	return nil
}

func lerp(min, max, t float64) float64 {
	return min + (max-min)*t
}

func getenv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

func intPtr(v int) *int     { return &v }
func floatPtr(v float64) *float64 { return &v }
