# Code Signing Quick Start

Quick reference for setting up code signing for the Voice Intelligence app.

## TL;DR

**Development (Testing Only):**
```bash
# Windows
npm run sign:setup -- -CreateSelfSigned

# macOS
./scripts/setup-code-signing.sh --setup

# Linux
./scripts/setup-code-signing.sh --setup
```

**Production:** Purchase certificates from certificate authorities and configure as shown below.

## Platform-Specific Quick Start

### Windows

#### Development (Self-Signed)

```powershell
# Create self-signed certificate
npm run sign:setup -- -CreateSelfSigned

# List installed certificates
npm run sign:list
```

#### Production

1. **Purchase certificate** from DigiCert, Sectigo, or similar ($200-$600/year)
2. **Import certificate:**
   ```powershell
   npm run sign:setup -- -CertificatePath .\certificate.pfx -CertificatePassword "password"
   ```
3. **Build signed app:**
   ```bash
   npm run tauri:build
   ```

### macOS

#### Setup

1. **Join Apple Developer Program** ($99/year)
2. **Create certificate** in Xcode → Preferences → Accounts → Manage Certificates
3. **Configure:**
   ```bash
   ./scripts/setup-code-signing.sh --setup
   ```
4. **Build and notarize:**
   ```bash
   npm run tauri:build
   # Then notarize (see full guide)
   ```

### Linux

#### Setup (Optional)

```bash
# Create GPG key
./scripts/setup-code-signing.sh --setup

# Sign package
gpg --detach-sign --armor your-app.AppImage
```

## Configuration Files

### tauri.conf.json

**Windows:**
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_THUMBPRINT_HERE",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

**macOS:**
```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true
    }
  }
}
```

### Environment Variables (Alternative)

**Windows:**
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = "path/to/certificate.pfx"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "your_password"
```

**macOS:**
```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
```

## Verification

### Windows
```powershell
Get-AuthenticodeSignature "Voice Intelligence.exe"
```

### macOS
```bash
codesign -vvv --deep --strict "Voice Intelligence.app"
spctl -a -vvv "Voice Intelligence.app"
```

### Linux
```bash
gpg --verify voice-intelligence.AppImage.asc voice-intelligence.AppImage
```

## CI/CD Setup

1. **Copy template:**
   ```bash
   cp .github/workflows/build-and-sign.yml.template .github/workflows/build-and-sign.yml
   ```

2. **Add GitHub Secrets:**
   - Windows: `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
   - macOS: `MACOS_CERTIFICATE`, `MACOS_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`
   - Linux: `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` (optional)

3. **Push tag to trigger:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Common Commands

```bash
# Setup code signing
npm run sign:setup

# List certificates
npm run sign:list

# Build signed app
npm run tauri:build

# Verify signature (Windows)
Get-AuthenticodeSignature "src-tauri/target/release/Voice Intelligence.exe"

# Verify signature (macOS)
./scripts/setup-code-signing.sh --verify "src-tauri/target/release/bundle/macos/Voice Intelligence.app"
```

## Cost Summary

| Platform | Required? | Cost | Notes |
|----------|-----------|------|-------|
| Windows | Optional | $200-$600/year | Recommended for distribution |
| macOS | **Required** | $99/year | Mandatory for Gatekeeper |
| Linux | Optional | Free | GPG signing |

## When to Implement

✅ **Implement Now:**
- Planning public distribution
- Targeting macOS users
- Enterprise deployment
- Want to avoid security warnings

⏸️ **Can Defer:**
- Internal testing only
- Development builds
- Limited budget
- Linux-only distribution

## Security Checklist

- [ ] Certificates stored securely (not in git)
- [ ] Strong passwords used
- [ ] Environment variables configured
- [ ] .gitignore updated
- [ ] CI/CD secrets configured
- [ ] Certificate expiration tracked
- [ ] Backup certificates created

## Troubleshooting

**"Certificate not found"**
- Run `npm run sign:list` to verify installation
- Check certificate thumbprint in tauri.conf.json

**"Timestamp server unavailable"**
- Try alternative timestamp server
- Check network connectivity

**"No identity found" (macOS)**
- Verify Apple Developer Program membership
- Check certificate in Keychain Access

## Next Steps

1. ✅ Read this quick start
2. ⬜ Choose development or production setup
3. ⬜ Follow platform-specific instructions
4. ⬜ Test signing with development build
5. ⬜ Configure CI/CD (optional)
6. ⬜ Read full guide: [CODE_SIGNING.md](CODE_SIGNING.md)

## Resources

- **Full Guide:** [CODE_SIGNING.md](CODE_SIGNING.md)
- **Scripts:** [scripts/README.md](../scripts/README.md)
- **Tauri Docs:** https://tauri.app/v1/guides/distribution/sign-windows
- **Apple Docs:** https://developer.apple.com/support/code-signing/

---

**Need Help?** See the full [Code Signing Guide](CODE_SIGNING.md) for detailed instructions.
