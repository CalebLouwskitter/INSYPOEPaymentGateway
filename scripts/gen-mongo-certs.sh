#!/usr/bin/env bash
set -euo pipefail

# Prevent MSYS/Git Bash on Windows from rewriting -subj /CN=... to a file path
export MSYS_NO_PATHCONV=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && (pwd -W 2>/dev/null || pwd))"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && (pwd -W 2>/dev/null || pwd))"
OUT_DIR="${ROOT_DIR}/certs/mongo"

mkdir -p "${OUT_DIR}"

if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl command not found. Please install OpenSSL." >&2
    exit 1
fi

echo "Generating MongoDB TLS certificates in ${OUT_DIR}..."

# 1. Local Certificate Authority (CA)
openssl genrsa -out "${OUT_DIR}/ca.key" 4096
openssl req -new -x509 -days 3650 -key "${OUT_DIR}/ca.key" \
    -subj "/CN=INSY7314-Mongo-CA" \
    -out "${OUT_DIR}/ca.pem"

# 2. Server Private Key and Certificate Signing Request (CSR)
openssl genrsa -out "${OUT_DIR}/mongodb.key" 2048
openssl req -new -key "${OUT_DIR}/mongodb.key" \
    -subj "/CN=mongodb" \
    -out "${OUT_DIR}/mongodb.csr"

# 3. Extension file for Subject Alternative Names (SAN)
cat <<EOF > "${OUT_DIR}/mongodb.ext"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = mongodb
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

# 4. Sign the server certificate with the local CA
openssl x509 -req -in "${OUT_DIR}/mongodb.csr" \
    -CA "${OUT_DIR}/ca.pem" \
    -CAkey "${OUT_DIR}/ca.key" \
    -CAcreateserial \
    -out "${OUT_DIR}/mongodb.crt" \
    -days 825 \
    -sha256 \
    -extfile "${OUT_DIR}/mongodb.ext"

# 5. Combine server certificate and private key for mongod
cat "${OUT_DIR}/mongodb.crt" "${OUT_DIR}/mongodb.key" > "${OUT_DIR}/mongodb.pem"

# 6. Cleanup temporary files
rm -f "${OUT_DIR}/mongodb.csr" "${OUT_DIR}/mongodb.ext" "${OUT_DIR}/ca.srl"

# 7. Restrict file permissions
chmod 600 "${OUT_DIR}/ca.key" "${OUT_DIR}/mongodb.key" || true
chmod 644 "${OUT_DIR}/ca.pem" "${OUT_DIR}/mongodb.crt" "${OUT_DIR}/mongodb.pem" || true

echo "MongoDB TLS certificates successfully generated in ${OUT_DIR}:"
echo "  - CA certificate:       ca.pem"
echo "  - Server cert + key:    mongodb.pem"
echo "  - Server certificate:   mongodb.crt"
echo "  - Server private key:   mongodb.key"
