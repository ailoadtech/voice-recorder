# Code Signing Setup Script for Windows
# This script helps set up code signing for the Voice Intelligence app

param(
    [Parameter(Mandatory=$false)]
    [string]$CertificatePath,
    
    [Parameter(Mandatory=$false)]
    [string]$CertificatePassword,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateSelfSigned,
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowThumbprint
)

Write-Host "Voice Intelligence - Code Signing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to create self-signed certificate
function New-DevCertificate {
    Write-Host "Creating self-signed certificate for development..." -ForegroundColor Yellow
    Write-Host "Note: Self-signed certificates should only be used for testing!" -ForegroundColor Red
    Write-Host ""
    
    try {
        $cert = New-SelfSignedCertificate `
            -Type CodeSigningCert `
            -Subject "CN=Voice Intelligence Development" `
            -CertStoreLocation Cert:\CurrentUser\My `
            -NotAfter (Get-Date).AddYears(2)
        
        Write-Host "✓ Certificate created successfully!" -ForegroundColor Green
        Write-Host "  Subject: $($cert.Subject)" -ForegroundColor Gray
        Write-Host "  Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
        Write-Host "  Expires: $($cert.NotAfter)" -ForegroundColor Gray
        Write-Host ""
        
        # Export certificate
        $exportPath = Join-Path $PSScriptRoot "..\voice-intelligence-dev.pfx"
        $password = Read-Host "Enter password for certificate export" -AsSecureString
        
        Export-PfxCertificate -Cert $cert -FilePath $exportPath -Password $password | Out-Null
        
        Write-Host "✓ Certificate exported to: $exportPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Add certificate thumbprint to src-tauri/tauri.conf.json" -ForegroundColor White
        Write-Host "2. Or set environment variables:" -ForegroundColor White
        Write-Host "   `$env:TAURI_SIGNING_PRIVATE_KEY = '$exportPath'" -ForegroundColor Gray
        Write-Host "   `$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = 'your_password'" -ForegroundColor Gray
        Write-Host ""
        
        return $cert.Thumbprint
    }
    catch {
        Write-Host "✗ Failed to create certificate: $_" -ForegroundColor Red
        return $null
    }
}

# Function to import existing certificate
function Import-Certificate {
    param(
        [string]$Path,
        [string]$Password
    )
    
    Write-Host "Importing certificate from: $Path" -ForegroundColor Yellow
    
    try {
        $securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText
        $cert = Import-PfxCertificate -FilePath $Path -CertStoreLocation Cert:\CurrentUser\My -Password $securePassword
        
        Write-Host "✓ Certificate imported successfully!" -ForegroundColor Green
        Write-Host "  Subject: $($cert.Subject)" -ForegroundColor Gray
        Write-Host "  Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
        Write-Host "  Expires: $($cert.NotAfter)" -ForegroundColor Gray
        Write-Host ""
        
        return $cert.Thumbprint
    }
    catch {
        Write-Host "✗ Failed to import certificate: $_" -ForegroundColor Red
        return $null
    }
}

# Function to list installed certificates
function Show-InstalledCertificates {
    Write-Host "Installed code signing certificates:" -ForegroundColor Yellow
    Write-Host ""
    
    $certs = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
    
    if ($certs.Count -eq 0) {
        Write-Host "No code signing certificates found." -ForegroundColor Red
        Write-Host "Run with -CreateSelfSigned to create a development certificate." -ForegroundColor Yellow
        return
    }
    
    foreach ($cert in $certs) {
        Write-Host "Certificate:" -ForegroundColor Cyan
        Write-Host "  Subject: $($cert.Subject)" -ForegroundColor White
        Write-Host "  Thumbprint: $($cert.Thumbprint)" -ForegroundColor Green
        Write-Host "  Issuer: $($cert.Issuer)" -ForegroundColor Gray
        Write-Host "  Valid From: $($cert.NotBefore)" -ForegroundColor Gray
        Write-Host "  Valid To: $($cert.NotAfter)" -ForegroundColor Gray
        
        if ($cert.NotAfter -lt (Get-Date)) {
            Write-Host "  Status: EXPIRED" -ForegroundColor Red
        }
        elseif ($cert.NotAfter -lt (Get-Date).AddDays(30)) {
            Write-Host "  Status: Expiring soon" -ForegroundColor Yellow
        }
        else {
            Write-Host "  Status: Valid" -ForegroundColor Green
        }
        
        Write-Host ""
    }
}

# Function to update tauri.conf.json
function Update-TauriConfig {
    param([string]$Thumbprint)
    
    Write-Host "Updating tauri.conf.json..." -ForegroundColor Yellow
    
    $configPath = Join-Path $PSScriptRoot "..\src-tauri\tauri.conf.json"
    
    if (-not (Test-Path $configPath)) {
        Write-Host "✗ tauri.conf.json not found at: $configPath" -ForegroundColor Red
        return
    }
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $config.bundle.windows.certificateThumbprint = $Thumbprint
        $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
        
        Write-Host "✓ tauri.conf.json updated with certificate thumbprint" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "✗ Failed to update tauri.conf.json: $_" -ForegroundColor Red
        Write-Host "Please manually update the certificateThumbprint field." -ForegroundColor Yellow
    }
}

# Main execution
if ($ShowThumbprint) {
    Show-InstalledCertificates
    exit 0
}

if ($CreateSelfSigned) {
    $thumbprint = New-DevCertificate
    if ($thumbprint) {
        $response = Read-Host "Update tauri.conf.json with this thumbprint? (y/n)"
        if ($response -eq 'y') {
            Update-TauriConfig -Thumbprint $thumbprint
        }
    }
    exit 0
}

if ($CertificatePath) {
    if (-not (Test-Path $CertificatePath)) {
        Write-Host "✗ Certificate file not found: $CertificatePath" -ForegroundColor Red
        exit 1
    }
    
    if (-not $CertificatePassword) {
        $securePassword = Read-Host "Enter certificate password" -AsSecureString
        $CertificatePassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        )
    }
    
    $thumbprint = Import-Certificate -Path $CertificatePath -Password $CertificatePassword
    if ($thumbprint) {
        $response = Read-Host "Update tauri.conf.json with this thumbprint? (y/n)"
        if ($response -eq 'y') {
            Update-TauriConfig -Thumbprint $thumbprint
        }
    }
    exit 0
}

# Show help if no parameters
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  .\setup-code-signing.ps1 -CreateSelfSigned" -ForegroundColor White
Write-Host "    Create a self-signed certificate for development" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\setup-code-signing.ps1 -CertificatePath <path> [-CertificatePassword <password>]" -ForegroundColor White
Write-Host "    Import an existing certificate" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\setup-code-signing.ps1 -ShowThumbprint" -ForegroundColor White
Write-Host "    List installed code signing certificates" -ForegroundColor Gray
Write-Host ""
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host "  .\setup-code-signing.ps1 -CreateSelfSigned" -ForegroundColor Gray
Write-Host "  .\setup-code-signing.ps1 -CertificatePath .\mycert.pfx -CertificatePassword 'mypassword'" -ForegroundColor Gray
Write-Host "  .\setup-code-signing.ps1 -ShowThumbprint" -ForegroundColor Gray
Write-Host ""
Write-Host "For more information, see docs/CODE_SIGNING.md" -ForegroundColor Yellow
