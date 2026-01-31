#!/bin/bash
# Code Signing Setup Script for macOS/Linux
# This script helps set up code signing for the Voice Intelligence app

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${CYAN}Voice Intelligence - Code Signing Setup${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}$1${NC}"
}

# Check if running on macOS
is_macos() {
    [[ "$OSTYPE" == "darwin"* ]]
}

# List macOS code signing identities
list_macos_identities() {
    print_info "Installed code signing identities:"
    echo ""
    
    if ! command -v security &> /dev/null; then
        print_error "security command not found. Are you on macOS?"
        return 1
    fi
    
    identities=$(security find-identity -v -p codesigning 2>/dev/null)
    
    if [ -z "$identities" ]; then
        print_warning "No code signing identities found."
        echo ""
        echo "To create a code signing identity:"
        echo "1. Join the Apple Developer Program (https://developer.apple.com/programs/)"
        echo "2. Open Xcode → Preferences → Accounts"
        echo "3. Add your Apple ID"
        echo "4. Click 'Manage Certificates' → '+' → 'Developer ID Application'"
        return 1
    fi
    
    echo "$identities"
    echo ""
    
    # Extract identity names
    identity_count=$(echo "$identities" | grep -c "Developer ID Application" || true)
    
    if [ "$identity_count" -eq 0 ]; then
        print_warning "No 'Developer ID Application' certificates found."
        echo "You need a 'Developer ID Application' certificate for distribution."
    else
        print_success "Found $identity_count Developer ID Application certificate(s)"
    fi
}

# Update tauri.conf.json with signing identity
update_tauri_config() {
    local identity="$1"
    local config_path="$(dirname "$0")/../src-tauri/tauri.conf.json"
    
    if [ ! -f "$config_path" ]; then
        print_error "tauri.conf.json not found at: $config_path"
        return 1
    fi
    
    print_info "Updating tauri.conf.json..."
    
    # Use jq if available, otherwise use sed
    if command -v jq &> /dev/null; then
        tmp_file=$(mktemp)
        jq --arg identity "$identity" '.bundle.macOS.signingIdentity = $identity' "$config_path" > "$tmp_file"
        mv "$tmp_file" "$config_path"
        print_success "tauri.conf.json updated with signing identity"
    else
        print_warning "jq not found. Please manually update tauri.conf.json"
        echo "Set bundle.macOS.signingIdentity to: $identity"
    fi
}

# Setup macOS code signing
setup_macos() {
    print_header
    print_info "Setting up macOS code signing..."
    echo ""
    
    # Check for Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode Command Line Tools not found"
        echo ""
        echo "Install with: xcode-select --install"
        exit 1
    fi
    
    # List identities
    list_macos_identities
    
    # Get identity from user
    echo ""
    read -p "Enter the full signing identity name (or press Enter to skip): " identity
    
    if [ -n "$identity" ]; then
        update_tauri_config "$identity"
        echo ""
        print_success "Code signing configured!"
        echo ""
        print_info "Next steps:"
        echo "1. Build your app: npm run tauri:build"
        echo "2. Notarize the app (required for macOS 10.15+)"
        echo "3. See docs/CODE_SIGNING.md for notarization instructions"
    fi
}

# Setup Linux GPG signing
setup_linux() {
    print_header
    print_info "Setting up Linux GPG signing..."
    echo ""
    
    if ! command -v gpg &> /dev/null; then
        print_error "GPG not found. Install with: sudo apt-get install gnupg"
        exit 1
    fi
    
    # List existing keys
    print_info "Existing GPG keys:"
    gpg --list-secret-keys --keyid-format LONG
    echo ""
    
    read -p "Do you want to create a new GPG key? (y/n): " create_key
    
    if [ "$create_key" = "y" ]; then
        print_info "Creating new GPG key..."
        gpg --full-generate-key
        
        print_success "GPG key created!"
        echo ""
        print_info "To sign your application:"
        echo "1. Build your app: npm run tauri:build"
        echo "2. Sign the package:"
        echo "   gpg --detach-sign --armor your-app.AppImage"
        echo "3. Distribute both the app and .asc signature file"
        echo ""
        print_info "Users can verify with:"
        echo "   gpg --verify your-app.AppImage.asc your-app.AppImage"
    fi
}

# Verify code signature
verify_signature() {
    local app_path="$1"
    
    if [ -z "$app_path" ]; then
        print_error "Please provide path to application"
        echo "Usage: $0 --verify <path-to-app>"
        exit 1
    fi
    
    if [ ! -e "$app_path" ]; then
        print_error "Application not found: $app_path"
        exit 1
    fi
    
    print_info "Verifying signature for: $app_path"
    echo ""
    
    if is_macos; then
        # macOS verification
        if [[ "$app_path" == *.app ]]; then
            print_info "Verifying code signature..."
            codesign -vvv --deep --strict "$app_path"
            echo ""
            
            print_info "Verifying notarization..."
            spctl -a -vvv "$app_path"
            echo ""
            
            print_success "Verification complete!"
        else
            print_error "Expected .app bundle on macOS"
            exit 1
        fi
    else
        # Linux verification
        if [[ "$app_path" == *.asc ]]; then
            gpg --verify "$app_path"
        else
            sig_file="${app_path}.asc"
            if [ -f "$sig_file" ]; then
                gpg --verify "$sig_file" "$app_path"
            else
                print_error "Signature file not found: $sig_file"
                exit 1
            fi
        fi
    fi
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --setup          Setup code signing for current platform"
    echo "  --list           List installed signing identities"
    echo "  --verify <path>  Verify signature of application"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --setup"
    echo "  $0 --list"
    echo "  $0 --verify ./Voice\\ Intelligence.app"
    echo ""
    echo "For more information, see docs/CODE_SIGNING.md"
}

# Main execution
case "${1:-}" in
    --setup)
        if is_macos; then
            setup_macos
        else
            setup_linux
        fi
        ;;
    --list)
        if is_macos; then
            print_header
            list_macos_identities
        else
            print_header
            print_info "GPG keys:"
            gpg --list-secret-keys --keyid-format LONG
        fi
        ;;
    --verify)
        verify_signature "$2"
        ;;
    --help|*)
        show_help
        ;;
esac
