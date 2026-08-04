package services

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/skygenesisenterprise/astron-collection/server/src/config"
	"golang.org/x/crypto/argon2"
)

type PasswordHasher struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

func NewPasswordHasher(cfg config.AuthConfig) *PasswordHasher {
	return &PasswordHasher{
		memory:      cfg.Argon2Memory,
		iterations:  cfg.Argon2Iterations,
		parallelism: cfg.Argon2Parallelism,
		saltLength:  16,
		keyLength:   32,
	}
}

func (h *PasswordHasher) Hash(password string) (string, error) {
	if strings.TrimSpace(password) == "" {
		return "", errors.New("password must not be empty")
	}
	salt := make([]byte, h.saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(password), salt, h.iterations, h.memory, h.parallelism, h.keyLength)
	return fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version,
		h.memory,
		h.iterations,
		h.parallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

func (h *PasswordHasher) Verify(password, encodedHash string) (bool, error) {
	params, salt, hash, err := decodeHash(encodedHash)
	if err != nil {
		return false, err
	}
	other := argon2.IDKey([]byte(password), salt, params.iterations, params.memory, params.parallelism, uint32(len(hash)))
	if subtle.ConstantTimeCompare(hash, other) == 1 {
		return true, nil
	}
	return false, nil
}

func (h *PasswordHasher) NeedsRehash(encodedHash string) bool {
	params, _, _, err := decodeHash(encodedHash)
	if err != nil {
		return true
	}
	return params.memory != h.memory ||
		params.iterations != h.iterations ||
		params.parallelism != h.parallelism
}

type argon2Params struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

func decodeHash(encodedHash string) (*argon2Params, []byte, []byte, error) {
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return nil, nil, nil, errors.New("invalid hash format")
	}

	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil {
		return nil, nil, nil, errors.New("invalid argon2 version")
	}
	if version != argon2.Version {
		return nil, nil, nil, fmt.Errorf("incompatible argon2 version: %d", version)
	}

	params := &argon2Params{}
	for _, segment := range strings.Split(parts[3], ",") {
		kv := strings.SplitN(segment, "=", 2)
		if len(kv) != 2 {
			return nil, nil, nil, errors.New("invalid hash parameters")
		}
		value, err := strconv.ParseUint(kv[1], 10, 32)
		if err != nil {
			return nil, nil, nil, errors.New("invalid hash parameter value")
		}
		switch kv[0] {
		case "m":
			params.memory = uint32(value)
		case "t":
			params.iterations = uint32(value)
		case "p":
			params.parallelism = uint8(value)
		default:
			return nil, nil, nil, errors.New("unknown hash parameter")
		}
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return nil, nil, nil, errors.New("invalid salt encoding")
	}
	hash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return nil, nil, nil, errors.New("invalid hash encoding")
	}
	params.saltLength = uint32(len(salt))
	params.keyLength = uint32(len(hash))
	return params, salt, hash, nil
}
