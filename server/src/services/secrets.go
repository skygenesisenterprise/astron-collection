package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"math/big"
)

const secretAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateSecret(prefix string, length int) string {
	if prefix == "" {
		prefix = "ast"
	}
	bytes := make([]byte, length)
	for i := range bytes {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(secretAlphabet))))
		if err != nil {
			n = big.NewInt(int64(i % len(secretAlphabet)))
		}
		bytes[i] = secretAlphabet[n.Int64()]
	}
	return prefix + "_" + string(bytes)
}

func hashSecret(secret string) string {
	sum := sha256.Sum256([]byte(secret))
	return hex.EncodeToString(sum[:])
}
