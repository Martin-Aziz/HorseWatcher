package config

import (
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
)

// Config holds all runtime configuration sourced from environment variables.
type Config struct {
	Env  string `envconfig:"ENV" default:"development"`
	Port int    `envconfig:"PORT" default:"8080"`

	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
	RedisURL    string `envconfig:"REDIS_URL" required:"true"`

	JWTSecret            string        `envconfig:"JWT_SECRET" required:"true"`
	JWTAccessTTLMinutes  int           `envconfig:"JWT_ACCESS_TTL_MINUTES" default:"15"`
	JWTRefreshTTLDays    int           `envconfig:"JWT_REFRESH_TTL_DAYS" default:"7"`
	JWTAccessTTL         time.Duration `envconfig:"-"`
	JWTRefreshTTL        time.Duration `envconfig:"-"`

	MLServiceURL string `envconfig:"ML_SERVICE_URL" default:"http://localhost:8001"`
	LogLevel     string `envconfig:"LOG_LEVEL" default:"info"`
}

// Load reads configuration from environment variables and computes derived fields.
func Load() (*Config, error) {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	if len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}

	cfg.JWTAccessTTL = time.Duration(cfg.JWTAccessTTLMinutes) * time.Minute
	cfg.JWTRefreshTTL = time.Duration(cfg.JWTRefreshTTLDays) * 24 * time.Hour

	return &cfg, nil
}

// Address returns the listen address for the HTTP server.
func (c *Config) Address() string {
	return fmt.Sprintf(":%d", c.Port)
}

// IsDevelopment reports whether the service is running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}
