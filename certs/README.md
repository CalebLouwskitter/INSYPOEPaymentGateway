# SSL Certificates

This directory contains SSL certificates generated using mkcert for local HTTPS development.

## Setup

1. Install mkcert (if not already installed):
   ```powershell
   winget install FiloSottile.mkcert
   ```

2. Install the local CA:
   ```powershell
   mkcert -install
   ```

3. Generate certificates (already done):
   ```powershell
   mkcert localhost 127.0.0.1 ::1
   ```

## Files

- `localhost+2.pem` - SSL certificate
- `localhost+2-key.pem` - Private key

## Usage

These certificates are automatically used by the application when running in HTTPS mode.

**Important:** Do NOT commit these certificates to version control. They are for local development only.
