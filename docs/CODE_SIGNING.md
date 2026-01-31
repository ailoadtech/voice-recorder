# Code Signing Guide

## Overview

Code signing is the process of digitally signing executables and scripts to confirm the software author and guarantee that the code has not been altered or corrupted since it was signed. This is essential for:

- **User Trust**: Users can verify the application comes from a legitimate source
- **Security**: Operating systems can verify the integrity of the application
- **Distribution**: Some platforms require code signing for distribution (e.g., macOS Gatekeeper, Windows SmartScreen)
- **Updates**: Signed applications can be updated more seamlessly

## Platform Requirements

### Windows

**Required for:**
- Avoiding Windows SmartScreen warnings
- Enterprise deployment
- Windows Store distribution

**Certificate Types:**
- **EV (Extended Validation) Code Signing Certificate**: Recommended, provides immediate SmartScreen reputation
- **Standard Code Signing Certificate**: Requires building reputation over time

**Certificate Providers:**
- DigiCert
- Sectigo (formerly Comodo)
- GlobalSign
- SSL.com

**Cost:** $200-$500/year (Standard), $300-$600/year (EV)

### macOS

**Required for:**
- Gatekeeper approval (mandatory for distribution)
- Mac App Store distribution
- Notarization (required for macOS 10.15+)

**Requirements:**
- Apple Developer Program membership ($99/year)
- Developer ID Application certificate
- Notarization via Apple's notary service

### Linux

**Generally not required** - Most Linux distributions don't require code signing for desktop applications. However, some enterprise environments may have their own requirements.

## Setup Instructions

### Windows Code Signing

#### 1. Obtain a Certificate

**Option A: Purchase from Certificate Authority**
1. Choose a certificate provider (DigiCert, Sectigo, etc.)
2. Complete identity verification process
3. Receive certificate file (.pfx or .p12)

**Option B: Self-Signed Certificate (Development Only)**
```powershell
# Create self-signed certificate (Windows)
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Voice Intelligence Dev" -CertStoreLocation Cert:\CurrentUser\My

# Export certificate
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
Export-PfxCertificate -Cert $cert -FilePath "voice-intelligence-dev.pfx" -Password (ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText)
```

#### 2. Configure Tauri

**Method 1: Certificate Thumbprint (Recommended)**

1. Get certificate thumbprint:
```powershell
# List certificates
Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert

# Copy the Thumbprint value
```

2. Update `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT_HERE",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

**Method 2: Environment Variables**

1. Set environment variables:
```powershell
# Windows PowerShell
$env:TAURI_SIGNING_PRIVATE_KEY = "path/to/certificate.pfx"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "your_password"
```

2. Update `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "windows": {
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

#### 3. Timestamp Servers

Use a timestamp server to ensure signatures remain valid after certificate expiration:

- DigiCert: `http://timestamp.digicert.com`
- Sectigo: `http://timestamp.sectigo.com`
- GlobalSign: `http://timestamp.globalsign.com`

### macOS Code Signing

#### 1. Join Apple Developer Program

1. Visit https://developer.apple.com/programs/
2. Enroll ($99/year)
3. Complete verification process

#### 2. Create Certificates

1. Open Xcode
2. Go to Preferences → Accounts
3. Select your Apple ID
4. Click "Manage Certificates"
5. Click "+" and select "Developer ID Application"

Or use command line:
```bash
# List available certificates
security find-identity -v -p codesigning

# The certificate name will be like:
# "Developer ID Application: Your Name (TEAM_ID)"
```

#### 3. Configure Tauri

Update `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": null,
      "exceptionDomain": null,
      "hardenedRuntime": true
    }
  }
}
```

#### 4. Notarization

After building, notarize the app:

```bash
# Build the app
npm run tauri:build

# Notarize (requires Apple ID app-specific password)
xcrun notarytool submit \
  src-tauri/target/release/bundle/dmg/Voice\ Intelligence_0.1.0_aarch64.dmg \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "YOUR_TEAM_ID" \
  --wait

# Staple the notarization ticket
xcrun stapler staple src-tauri/target/release/bundle/dmg/Voice\ Intelligence_0.1.0_aarch64.dmg
```

### Linux Code Signing

Linux typically doesn't require code signing, but you can use GPG signatures for package verification:

```bash
# Generate GPG key
gpg --full-generate-key

# Sign the package
gpg --detach-sign --armor your-app.AppImage

# Verify signature
gpg --verify your-app.AppImage.asc your-app.AppImage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Sign

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Import certificate
        run: |
          echo "${{ secrets.WINDOWS_CERTIFICATE }}" | base64 --decode > certificate.pfx
        
      - name: Build and sign
        env:
          TAURI_SIGNING_PRIVATE_KEY: certificate.pfx
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
        run: npm run tauri:build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: src-tauri/target/release/bundle/msi/*.msi

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Import certificate
        env:
          CERTIFICATE_BASE64: ${{ secrets.MACOS_CERTIFICATE }}
          CERTIFICATE_PASSWORD: ${{ secrets.MACOS_CERTIFICATE_PASSWORD }}
        run: |
          echo $CERTIFICATE_BASE64 | base64 --decode > certificate.p12
          security create-keychain -p actions build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p actions build.keychain
          security import certificate.p12 -k build.keychain -P $CERTIFICATE_PASSWORD -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k actions build.keychain
      
      - name: Build and sign
        run: npm run tauri:build
      
      - name: Notarize
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          xcrun notarytool submit \
            src-tauri/target/release/bundle/dmg/*.dmg \
            --apple-id "$APPLE_ID" \
            --password "$APPLE_PASSWORD" \
            --team-id "$APPLE_TEAM_ID" \
            --wait
          xcrun stapler staple src-tauri/target/release/bundle/dmg/*.dmg
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: macos-installer
          path: src-tauri/target/release/bundle/dmg/*.dmg
```

## Security Best Practices

### Certificate Storage

1. **Never commit certificates to version control**
   - Add to `.gitignore`: `*.pfx`, `*.p12`, `*.cer`
   
2. **Use environment variables or secure vaults**
   - GitHub Secrets
   - Azure Key Vault
   - AWS Secrets Manager
   - HashiCorp Vault

3. **Restrict access**
   - Limit who can access certificates
   - Use separate certificates for development and production
   - Rotate certificates before expiration

### Password Management

1. **Use strong passwords**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols
   
2. **Store passwords securely**
   - Use password managers
   - Never hardcode in scripts
   - Use environment variables in CI/CD

### Certificate Backup

1. **Backup certificates securely**
   - Encrypted storage
   - Multiple secure locations
   - Document recovery procedures

2. **Plan for expiration**
   - Set calendar reminders
   - Renew 30 days before expiration
   - Test new certificates before old ones expire

## Verification

### Windows

```powershell
# Verify signature
Get-AuthenticodeSignature "Voice Intelligence.exe"

# Should show:
# Status: Valid
# SignerCertificate: CN=Your Company Name
```

### macOS

```bash
# Verify code signature
codesign -vvv --deep --strict "Voice Intelligence.app"

# Verify notarization
spctl -a -vvv "Voice Intelligence.app"

# Should show: accepted
```

### Linux

```bash
# Verify GPG signature
gpg --verify voice-intelligence.AppImage.asc voice-intelligence.AppImage
```

## Troubleshooting

### Windows

**Issue: "Certificate not found"**
- Verify certificate is installed in correct store
- Check certificate thumbprint is correct
- Ensure certificate is valid and not expired

**Issue: "Timestamp server unavailable"**
- Try alternative timestamp servers
- Check network connectivity
- Retry after a few minutes

### macOS

**Issue: "No identity found"**
- Verify Apple Developer Program membership
- Check certificate is installed in Keychain
- Ensure certificate is not expired

**Issue: "Notarization failed"**
- Check hardened runtime is enabled
- Verify entitlements are correct
- Review notarization log for specific errors

## Cost Summary

| Platform | Requirement | Cost | Renewal |
|----------|-------------|------|---------|
| Windows | Optional (recommended) | $200-$600/year | Annual |
| macOS | Required | $99/year | Annual |
| Linux | Optional | Free (GPG) | N/A |

## Decision Matrix

### When to Implement Code Signing

**Implement Now:**
- ✅ Planning public distribution
- ✅ Targeting macOS users (required)
- ✅ Enterprise deployment
- ✅ Want to avoid security warnings

**Defer:**
- ⏸️ Internal testing only
- ⏸️ Development builds
- ⏸️ Limited budget
- ⏸️ Linux-only distribution

## Next Steps

1. **Evaluate Requirements**
   - Determine target platforms
   - Assess distribution needs
   - Calculate budget

2. **Obtain Certificates**
   - Windows: Purchase from CA or use self-signed for testing
   - macOS: Join Apple Developer Program
   - Linux: Generate GPG key if needed

3. **Configure Tauri**
   - Update `tauri.conf.json`
   - Set environment variables
   - Test signing process

4. **Verify**
   - Build signed application
   - Verify signatures
   - Test on target platforms

5. **Document**
   - Record certificate details
   - Document renewal dates
   - Create recovery procedures

## Resources

- [Tauri Code Signing Documentation](https://tauri.app/v1/guides/distribution/sign-windows)
- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Microsoft Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [DigiCert Code Signing](https://www.digicert.com/signing/code-signing-certificates)

---

**Note:** This guide provides configuration for code signing. Actual implementation requires obtaining valid certificates from certificate authorities or Apple Developer Program membership.
