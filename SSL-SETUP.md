# 🔐 SSL/HTTPS Setup with mkcert

This guide explains how to set up local HTTPS development for the INSYPOEPaymentGateway application using mkcert.

## 📋 Prerequisites

- Windows 10/11
- PowerShell
- Node.js installed
- Administrator access (for CA installation)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:

```powershell
.\setup-ssl.ps1
```

This will:
- ✅ Install mkcert (if needed)
- ✅ Install the local Certificate Authority
- ✅ Generate SSL certificates
- ✅ Configure your .env file

### Option 2: Manual Setup

1. **Install mkcert:**
   ```powershell
   winget install FiloSottile.mkcert
   ```

2. **Install the local CA:**
   ```powershell
   mkcert -install
   ```

3. **Generate certificates:**
   ```powershell
   cd certs
   mkcert localhost 127.0.0.1 ::1
   ```

4. **Update .env file:**
   ```env
   USE_HTTPS=true
   PORT=5000
   ```

## 📁 Certificate Files

After setup, you'll have:
- `certs/localhost+2.pem` - SSL certificate
- `certs/localhost+2-key.pem` - Private key

**Important:** These files are git-ignored and should NOT be committed to version control.

## 🏃 Running with HTTPS

### Backend

```powershell
cd Backend
npm install
npm start
```

Your backend will be available at: **https://localhost:5000**

### Frontend

Update the frontend to use HTTPS endpoints:

In `Frontend/src/App.js` or your API configuration:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:5000';
```

## 🔍 Verification

Test your HTTPS setup:

1. **Check certificate:**
   ```powershell
   curl https://localhost:5000/health
   ```

2. **Visit in browser:**
   Open https://localhost:5000/health
   - You should see a valid certificate (no warnings)

## 🛠️ Configuration Options

### Environment Variables

In your `.env` file:

```env
# Enable/Disable HTTPS
USE_HTTPS=true

# Server port
PORT=5000

# Node environment
NODE_ENV=development
```

### Disable HTTPS

To run without HTTPS:
```env
USE_HTTPS=false
```

The server will automatically fall back to HTTP.

## 🌐 Docker with HTTPS

To use HTTPS in Docker, mount the certificates:

```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./certs:/app/certs:ro
    environment:
      - USE_HTTPS=true
```

## 🔧 Troubleshooting

### Certificate Not Trusted

If your browser shows a certificate warning:

1. Reinstall the CA:
   ```powershell
   mkcert -install
   ```

2. Restart your browser

### "Command not found: mkcert"

Refresh your PATH:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Certificates Expired

Regenerate certificates:
```powershell
cd certs
Remove-Item *.pem
mkcert localhost 127.0.0.1 ::1
```

### Port Already in Use

Change the port in `.env`:
```env
PORT=5001
```

## 📱 Mobile/Network Testing

To test on mobile devices or other computers on your network:

1. **Find your local IP:**
   ```powershell
   ipconfig
   ```

2. **Generate certificate with your IP:**
   ```powershell
   cd certs
   mkcert localhost 127.0.0.1 ::1 192.168.1.x
   ```

3. **Install CA on mobile device:**
   - Get the CA location: `mkcert -CAROOT`
   - Transfer and install the `rootCA.pem` file

## 🔐 Security Notes

- ⚠️ mkcert certificates are for **local development only**
- ⚠️ Never use these certificates in production
- ⚠️ Never commit certificate files to git
- ✅ For production, use Let's Encrypt or a commercial CA
- ✅ The .gitignore file is already configured to exclude certificates

## 📚 Additional Resources

- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Node.js HTTPS documentation](https://nodejs.org/api/https.html)
- [Let's Encrypt](https://letsencrypt.org/) (for production)

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure you're running PowerShell as Administrator
3. Verify Node.js and npm are installed correctly
4. Check that port 5000 is not in use by another application

## 📝 Certificate Details

- **Valid for:** localhost, 127.0.0.1, ::1
- **Expiration:** 3 years from generation
- **Issuer:** mkcert local CA
- **Key size:** 2048-bit RSA

---

**Ready to develop securely! 🚀🔒**
