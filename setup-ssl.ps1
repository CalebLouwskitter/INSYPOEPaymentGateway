# ========================================
# SSL Certificate Setup Script
# ========================================
# This script sets up mkcert and generates SSL certificates
# for local HTTPS development

Write-Host "🔐 INSYPOEPaymentGateway SSL Setup" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Check if mkcert is installed
Write-Host "Checking for mkcert..." -ForegroundColor Yellow
$mkcertInstalled = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertInstalled) {
    Write-Host "❌ mkcert not found. Installing..." -ForegroundColor Red
    
    # Try to install with winget
    try {
        winget install FiloSottile.mkcert
        Write-Host "✅ mkcert installed successfully!" -ForegroundColor Green
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    catch {
        Write-Host "❌ Failed to install mkcert. Please install manually from: https://github.com/FiloSottile/mkcert" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ mkcert is already installed" -ForegroundColor Green
}

# Install local CA
Write-Host "`nInstalling local Certificate Authority..." -ForegroundColor Yellow
try {
    mkcert -install
    Write-Host "✅ Local CA installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Warning: CA installation had issues, but continuing..." -ForegroundColor Yellow
}

# Create certs directory if it doesn't exist
$certsDir = Join-Path $PSScriptRoot "certs"
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
    Write-Host "✅ Created certs directory" -ForegroundColor Green
}
else {
    Write-Host "✅ Certs directory exists" -ForegroundColor Green
}

# Generate SSL certificates
Write-Host "`nGenerating SSL certificates..." -ForegroundColor Yellow
Set-Location $certsDir

$certFile = "localhost+2.pem"
$keyFile = "localhost+2-key.pem"

if ((Test-Path $certFile) -and (Test-Path $keyFile)) {
    Write-Host "⚠️ Certificates already exist. Do you want to regenerate them? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "✅ Using existing certificates" -ForegroundColor Green
        Set-Location $PSScriptRoot
        Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
        exit 0
    }
    
    # Remove old certificates
    Remove-Item $certFile -Force
    Remove-Item $keyFile -Force
}

try {
    mkcert localhost 127.0.0.1 ::1
    Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to generate certificates" -ForegroundColor Red
    Set-Location $PSScriptRoot
    exit 1
}

Set-Location $PSScriptRoot

# Update .env file
Write-Host "`nUpdating .env file..." -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    
    # Check if USE_HTTPS is already set
    if ($envContent -notmatch "USE_HTTPS=") {
        Add-Content -Path $envFile -Value "`n# SSL Configuration`nUSE_HTTPS=true"
        Write-Host "✅ Added USE_HTTPS=true to .env" -ForegroundColor Green
    }
    else {
        Write-Host "✅ USE_HTTPS already configured in .env" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠️ .env file not found. Creating one..." -ForegroundColor Yellow
    @"
# SSL Configuration
USE_HTTPS=true

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/insy7314
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✅ Created .env file with SSL configuration" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nSSL Certificates Location:" -ForegroundColor Yellow
Write-Host "  📁 $certsDir" -ForegroundColor White
Write-Host "`nCertificate Files:" -ForegroundColor Yellow
Write-Host "  🔐 $certFile" -ForegroundColor White
Write-Host "  🔑 $keyFile" -ForegroundColor White
Write-Host "`nTo start the backend with HTTPS:" -ForegroundColor Yellow
Write-Host "  cd Backend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host "`nYour backend will be available at:" -ForegroundColor Yellow
Write-Host "  🔒 https://localhost:5000" -ForegroundColor Green
Write-Host "`nNote: Certificates expire on $(Get-Date (Get-Date).AddYears(3) -Format 'MMMM dd, yyyy')" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
