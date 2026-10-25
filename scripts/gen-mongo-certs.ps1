$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Resolve-Path "$scriptDir\..").Path
$outDir = Join-Path $rootDir "certs\mongo"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# Locate openssl
$cmd = Get-Command openssl -ErrorAction SilentlyContinue
$openssl = if ($cmd) { $cmd.Source } else { $null }
if (-not $openssl) {
    $fallbackPaths = @(
        "C:\Program Files\Git\usr\bin\openssl.exe",
        "C:\Program Files (x86)\Git\usr\bin\openssl.exe",
        "C:\OpenSSL-Win64\bin\openssl.exe"
    )
    foreach ($p in $fallbackPaths) {
        if (Test-Path $p) {
            $openssl = $p
            break
        }
    }
}

if (-not $openssl) {
    Write-Error "OpenSSL was not found. Please install OpenSSL or ensure it is on your PATH."
    exit 1
}

Write-Host "Using OpenSSL at: $openssl"
Write-Host "Generating MongoDB TLS certificates in $outDir..."

$caKey = Join-Path $outDir "ca.key"
$caPem = Join-Path $outDir "ca.pem"
$mongoKey = Join-Path $outDir "mongodb.key"
$mongoCsr = Join-Path $outDir "mongodb.csr"
$mongoExt = Join-Path $outDir "mongodb.ext"
$mongoCrt = Join-Path $outDir "mongodb.crt"
$mongoPem = Join-Path $outDir "mongodb.pem"
$caSrl = Join-Path $outDir "ca.srl"

# 1. Local Certificate Authority (CA)
& $openssl genrsa -out $caKey 4096
& $openssl req -new -x509 -days 3650 -key $caKey -subj "/CN=INSY7314-Mongo-CA" -out $caPem

# 2. Server Private Key and CSR
& $openssl genrsa -out $mongoKey 2048
& $openssl req -new -key $mongoKey -subj "/CN=mongodb" -out $mongoCsr

# 3. Extension file for SAN
@"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = mongodb
DNS.2 = localhost
IP.1 = 127.0.0.1
"@ | Set-Content -Path $mongoExt -Encoding ascii

# 4. Sign server cert with CA
& $openssl x509 -req -in $mongoCsr -CA $caPem -CAkey $caKey -CAcreateserial -out $mongoCrt -days 825 -sha256 -extfile $mongoExt

# 5. Combine server certificate and private key for mongod
Get-Content $mongoCrt, $mongoKey | Set-Content -Path $mongoPem -Encoding ascii

# 6. Cleanup temporary files
Remove-Item -Path $mongoCsr, $mongoExt -ErrorAction SilentlyContinue
if (Test-Path $caSrl) { Remove-Item -Path $caSrl -ErrorAction SilentlyContinue }

Write-Host "MongoDB TLS certificates successfully generated in $outDir :"
Write-Host "  - CA certificate:       ca.pem"
Write-Host "  - Server cert + key:    mongodb.pem"
Write-Host "  - Server certificate:   mongodb.crt"
Write-Host "  - Server private key:   mongodb.key"
