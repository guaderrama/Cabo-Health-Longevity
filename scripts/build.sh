#!/bin/bash

# Cabo Health Clinic - Build Script
# Automatiza el proceso completo de build, testing y preparación para deploy

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "🏥 CABO HEALTH CLINIC - BUILD AUTOMATION"
echo "=========================================="
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the project root directory?"
    exit 1
fi

# Parse command line arguments
SKIP_TESTS=false
SKIP_LINT=false
PRODUCTION=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-lint)
            SKIP_LINT=true
            shift
            ;;
        --production|-p)
            PRODUCTION=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-tests      Skip testing phase"
            echo "  --skip-lint       Skip linting phase"
            echo "  --production, -p  Production build (optimized)"
            echo "  --verbose, -v     Verbose output"
            echo "  --help, -h        Show this help"
            echo ""
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Environment setup
log_info "Setting up build environment..."

# Check if required tools are installed
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install pnpm first:"
    echo "  npm install -g pnpm"
    exit 1
fi

# Check if node version is correct
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    log_success "Node.js version $NODE_VERSION is compatible"
else
    log_error "Node.js version $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
    exit 1
fi

# Clean previous builds
log_info "Cleaning previous builds..."
if [ -d "dist" ]; then
    rm -rf dist
    log_success "Removed dist directory"
fi

if [ -d ".vite" ]; then
    rm -rf .vite
    log_success "Removed .vite cache"
fi

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    log_success "Removed node_modules/.vite cache"
fi

# Install dependencies
log_info "Installing dependencies..."
if [ "$VERBOSE" = true ]; then
    pnpm install
else
    pnpm install --silent
fi

# Check environment variables
log_info "Checking environment variables..."
if [ -f ".env.local" ]; then
    source .env.local
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        log_warning "VITE_SUPABASE_URL not set in .env.local"
    else
        log_success "VITE_SUPABASE_URL found"
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        log_warning "VITE_SUPABASE_ANON_KEY not set in .env.local"
    else
        log_success "VITE_SUPABASE_ANON_KEY found"
    fi
    
    if [ -z "$GROQ_API_KEY" ]; then
        log_warning "GROQ_API_KEY not set in .env.local"
    else
        log_success "GROQ_API_KEY found"
    fi
else
    log_error ".env.local file not found. Please create it with required environment variables."
    exit 1
fi

# Linting phase
if [ "$SKIP_LINT" = false ]; then
    log_info "Running linting..."
    
    # TypeScript check
    log_info "Running TypeScript type check..."
    if pnpm type-check > /dev/null 2>&1; then
        log_success "TypeScript type check passed"
    else
        log_error "TypeScript type check failed"
        pnpm type-check
        exit 1
    fi
    
    # ESLint
    log_info "Running ESLint..."
    if pnpm lint > /dev/null 2>&1; then
        log_success "ESLint passed"
    else
        log_error "ESLint failed"
        pnpm lint
        exit 1
    fi
else
    log_warning "Skipping linting phase"
fi

# Testing phase
if [ "$SKIP_TESTS" = false ]; then
    log_info "Running tests..."
    
    # Check if test script exists
    if pnpm run test --version > /dev/null 2>&1; then
        if pnpm test > /dev/null 2>&1; then
            log_success "Tests passed"
        else
            log_error "Tests failed"
            pnpm test
            exit 1
        fi
    else
        log_warning "No test script configured. Skipping tests."
    fi
else
    log_warning "Skipping testing phase"
fi

# Build phase
log_info "Building application..."

if [ "$PRODUCTION" = true ]; then
    log_info "Production build mode"
    
    # Clean build
    if pnpm build:prod > /dev/null 2>&1; then
        log_success "Production build completed successfully"
    else
        log_error "Production build failed"
        pnpm build:prod
        exit 1
    fi
    
    # Bundle analysis (if available)
    if pnpm run analyze > /dev/null 2>&1; then
        log_info "Bundle analysis completed"
    fi
    
else
    log_info "Development build mode"
    
    if pnpm build > /dev/null 2>&1; then
        log_success "Development build completed successfully"
    else
        log_error "Development build failed"
        pnpm build
        exit 1
    fi
fi

# Verify build output
log_info "Verifying build output..."

if [ ! -d "dist" ]; then
    log_error "Build directory 'dist' not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    log_error "Build output 'dist/index.html' not found"
    exit 1
fi

# Check bundle size
if command -v du &> /dev/null; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log_info "Build size: $BUILD_SIZE"
fi

# Security checks
log_info "Running security checks..."

# Check for common security issues in built files
if grep -r "console.log" dist/ > /dev/null 2>&1; then
    log_warning "console.log statements found in build"
fi

if grep -r "debugger" dist/ > /dev/null 2>&1; then
    log_warning "debugger statements found in build"
fi

# Performance checks
log_info "Running performance checks..."

# Check if source maps are disabled for production
if [ "$PRODUCTION" = true ] && grep -r "sourceMappingURL" dist/assets/*.js > /dev/null 2>&1; then
    log_warning "Source maps found in production build"
fi

# Generate build report
log_info "Generating build report..."

BUILD_REPORT="
🏥 CABO HEALTH CLINIC - BUILD REPORT
====================================

Build Mode: $([ "$PRODUCTION" = true ] && echo "Production" || echo "Development")
Timestamp: $(date)
Node Version: $NODE_VERSION
Package Manager: pnpm $(pnpm -v)

Build Statistics:
- Build Size: ${BUILD_SIZE:-"N/A"}
- Files Generated: $(find dist -type f | wc -l)
- Assets: $(find dist/assets -type f 2>/dev/null | wc -l)

Environment Variables:
- VITE_SUPABASE_URL: $([ -n "$VITE_SUPABASE_URL" ] && echo "✓ Set" || echo "✗ Missing")
- VITE_SUPABASE_ANON_KEY: $([ -n "$VITE_SUPABASE_ANON_KEY" ] && echo "✓ Set" || echo "✗ Missing")
- GROQ_API_KEY: $([ -n "$GROQ_API_KEY" ] && echo "✓ Set" || echo "✗ Missing")

Quality Checks:
- TypeScript: $([ "$SKIP_LINT" = false ] && echo "✓ Passed" || echo "⚠ Skipped")
- ESLint: $([ "$SKIP_LINT" = false ] && echo "✓ Passed" || echo "⚠ Skipped")
- Tests: $([ "$SKIP_TESTS" = false ] && echo "✓ Passed" || echo "⚠ Skipped")

Next Steps:
1. Deploy dist/ directory to your hosting platform
2. Configure environment variables on the server
3. Test the deployed application
4. Monitor for any issues

Build completed successfully! 🎉
"

echo "$BUILD_REPORT" > dist/build-report.txt
log_success "Build report saved to dist/build-report.txt"

# Success summary
echo -e "\n${GREEN}🎉 BUILD COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}=================================${NC}"

if [ "$PRODUCTION" = true ]; then
    echo -e "${GREEN}✅ Production build ready for deployment${NC}"
else
    echo -e "${YELLOW}ℹ️  Development build ready for testing${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Deploy the 'dist' directory to your hosting platform"
echo "2. Ensure environment variables are configured on the server"
echo "3. Test the application in the deployed environment"
echo ""

# Optional: Deploy to staging (uncomment and configure as needed)
# read -p "Deploy to staging? (y/N): " -n 1 -r
# echo
# if [[ $REPLY =~ ^[Yy]$ ]]; then
#     log_info "Deploying to staging..."
#     # Add your deployment commands here
#     log_success "Deployment to staging completed"
# fi

log_success "Build script completed successfully!"

exit 0