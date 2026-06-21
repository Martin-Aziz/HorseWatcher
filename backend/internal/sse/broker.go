package sse

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

// Event is a single SSE message sent to subscribers.
type Event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

// Broker manages Server-Sent Events channels for horses and stables.
// It is safe to use from multiple goroutines.
type Broker struct {
	mu           sync.RWMutex
	horseSubs    map[string]map[chan Event]struct{}  // horse_id → set of subscriber channels
	stableSubs   map[string]map[chan Event]struct{}  // stable_id → set of subscriber channels
}

// NewBroker creates a ready-to-use Broker.
func NewBroker() *Broker {
	return &Broker{
		horseSubs:  make(map[string]map[chan Event]struct{}),
		stableSubs: make(map[string]map[chan Event]struct{}),
	}
}

// SubscribeHorse registers a subscriber for a specific horse and returns a channel and an
// unsubscribe function. The caller must call unsub when the connection closes.
func (b *Broker) SubscribeHorse(horseID string) (<-chan Event, func()) {
	return b.subscribe(b.horseSubs, horseID)
}

// SubscribeStable registers a subscriber for all horses in a stable.
func (b *Broker) SubscribeStable(stableID string) (<-chan Event, func()) {
	return b.subscribe(b.stableSubs, stableID)
}

// PublishHorse broadcasts an event to all subscribers of a horse.
func (b *Broker) PublishHorse(horseID string, event Event) {
	b.publish(b.horseSubs, horseID, event)
}

// PublishStable broadcasts an event to all subscribers of a stable.
func (b *Broker) PublishStable(stableID string, event Event) {
	b.publish(b.stableSubs, stableID, event)
}

func (b *Broker) subscribe(registry map[string]map[chan Event]struct{}, id string) (<-chan Event, func()) {
	ch := make(chan Event, 32)

	b.mu.Lock()
	if registry[id] == nil {
		registry[id] = make(map[chan Event]struct{})
	}
	registry[id][ch] = struct{}{}
	b.mu.Unlock()

	unsub := func() {
		b.mu.Lock()
		delete(registry[id], ch)
		if len(registry[id]) == 0 {
			delete(registry, id)
		}
		b.mu.Unlock()
		close(ch)
	}

	return ch, unsub
}

func (b *Broker) publish(registry map[string]map[chan Event]struct{}, id string, event Event) {
	b.mu.RLock()
	subs := registry[id]
	b.mu.RUnlock()

	for ch := range subs {
		select {
		case ch <- event:
		default:
			// Slow consumer — drop the event rather than blocking.
		}
	}
}

// ServeSSE writes SSE events from ch to w until the client disconnects.
// It sets the required Content-Type and cache-control headers.
func ServeSSE(w http.ResponseWriter, r *http.Request, ch <-chan Event) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", http.StatusInternalServerError)
		return
	}

	// Send initial keepalive comment so the browser knows the connection is live.
	fmt.Fprintf(w, ": connected\n\n")
	flusher.Flush()

	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			return
		case event, ok := <-ch:
			if !ok {
				return
			}
			payload, err := json.Marshal(event)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "data: %s\n\n", payload)
			flusher.Flush()
		}
	}
}
