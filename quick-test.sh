#!/bin/bash

# 🧪 Quick Testing Script for Authentication Flow
# This script helps you quickly test the authentication implementation

set -e

echo "=================================="
echo "🧪 CABO HEALTH - AUTH TESTING"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if on correct branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz" ]; then
    print_warning "Not on testing branch!"
    echo "Current branch: $current_branch"
    echo "Expected: claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_success "On correct branch: $current_branch"
echo ""

# Check if files exist
echo "Checking modified files..."

files=(
    "src/contexts/AuthContext.tsx"
    "src/pages/RegisterPage.tsx"
    "src/pages/LoginPage.tsx"
    "src/pages/AuthCallbackPage.tsx"
    "src/App.tsx"
    "src/constants/index.ts"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file NOT FOUND!"
        all_files_exist=false
    fi
done

echo ""

if [ "$all_files_exist" = false ]; then
    print_error "Some files are missing. Please ensure all changes are in place."
    exit 1
fi

# Check for specific code patterns
echo "Checking code implementation..."

# Check 1: emailRedirectTo in AuthContext
if grep -q "emailRedirectTo" src/contexts/AuthContext.tsx; then
    print_success "emailRedirectTo configured"
else
    print_error "emailRedirectTo NOT found in AuthContext.tsx"
fi

# Check 2: needsConfirmation in signUp return type
if grep -q "needsConfirmation" src/contexts/AuthContext.tsx; then
    print_success "needsConfirmation handling implemented"
else
    print_error "needsConfirmation NOT found in AuthContext.tsx"
fi

# Check 3: Retry logic in loadUserRole
if grep -q "retries = 3" src/contexts/AuthContext.tsx; then
    print_success "Retry logic implemented in loadUserRole"
else
    print_error "Retry logic NOT found in loadUserRole"
fi

# Check 4: AuthCallbackPage route
if grep -q "/auth/callback" src/App.tsx; then
    print_success "AuthCallbackPage route configured"
else
    print_error "AuthCallbackPage route NOT found in App.tsx"
fi

# Check 5: Password minimum length
if grep -q "MIN_LENGTH: 8" src/constants/index.ts; then
    print_success "Password min length updated to 8"
else
    print_warning "Password min length might not be 8"
fi

echo ""
echo "=================================="
echo "📋 TESTING OPTIONS"
echo "=================================="
echo ""
echo "1. Run local development server (pnpm dev)"
echo "2. Build and preview production (pnpm build && pnpm preview)"
echo "3. View detailed test plan (cat test-auth-flow.md)"
echo "4. Check TypeScript compilation (tsc --noEmit)"
echo "5. Exit"
echo ""

read -p "Select option (1-5): " option

case $option in
    1)
        print_info "Starting development server..."
        echo ""
        echo "🌐 Open your browser to: http://localhost:5173"
        echo "📖 Follow test plan in: test-auth-flow.md"
        echo ""
        pnpm dev
        ;;
    2)
        print_info "Building production version..."
        echo ""
        pnpm build
        echo ""
        print_success "Build complete!"
        echo ""
        print_info "Starting preview server..."
        echo "🌐 Open your browser to: http://localhost:4173"
        echo "📖 Follow test plan in: test-auth-flow.md"
        echo ""
        pnpm preview
        ;;
    3)
        print_info "Opening test plan..."
        echo ""
        if command -v less &> /dev/null; then
            less test-auth-flow.md
        else
            cat test-auth-flow.md
        fi
        ;;
    4)
        print_info "Checking TypeScript compilation..."
        echo ""
        if npx tsc --noEmit; then
            print_success "TypeScript compilation successful!"
        else
            print_error "TypeScript compilation failed!"
            exit 1
        fi
        ;;
    5)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
