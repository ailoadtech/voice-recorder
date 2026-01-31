# Setup Dependency Management Tools (PowerShell)
# This script installs additional tools needed for dependency management

$ErrorActionPreference = "Stop"

Write-Host "🔧 Setting up dependency management tools..." -ForegroundColor Cyan
Write-Host ""

# Check if cargo is installed
try {
    $cargoVersion = cargo --version
    Write-Host "✅ Cargo is installed: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cargo is not installed" -ForegroundColor Red
    Write-Host "Please install Rust and Cargo from https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Install cargo-audit
Write-Host "📦 Installing cargo-audit..." -ForegroundColor Cyan
try {
    cargo install cargo-audit
    Write-Host "✅ cargo-audit installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install cargo-audit" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install cargo-outdated (optional but useful)
Write-Host "📦 Installing cargo-outdated..." -ForegroundColor Cyan
try {
    cargo install cargo-outdated
    Write-Host "✅ cargo-outdated installed successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to install cargo-outdated (optional)" -ForegroundColor Yellow
}

Write-Host ""

# Verify installations
Write-Host "🔍 Verifying installations..." -ForegroundColor Cyan
Write-Host ""

try {
    $auditVersion = cargo audit --version
    Write-Host "✅ cargo-audit: $auditVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ cargo-audit verification failed" -ForegroundColor Red
}

try {
    $outdatedVersion = cargo outdated --version
    Write-Host "✅ cargo-outdated: $outdatedVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  cargo-outdated not available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Dependency management tools setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now use:"
Write-Host "  - npm run deps:check    # Check for outdated npm packages"
Write-Host "  - npm run deps:audit    # Run security audits"
Write-Host "  - npm run deps:update   # Update dependencies"
Write-Host ""
