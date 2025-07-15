#!/usr/bin/env zsh

# Enable strict error handling
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Homebrew is installed
check_homebrew() {
  if command -v brew &> /dev/null; then
    print_success "Homebrew is installed"
    return 0
  else
    print_error "Homebrew is not installed"
    print_info "Please install Homebrew first: https://brew.sh"
    return 1
  fi
}

# Install dependencies
install_dependencies() {
  print_info "Installing dependencies..."

  # Install gnupg for binary signature verification
  print_info "Installing gnupg..."
  if brew list gnupg &> /dev/null; then
    print_warning "gnupg is already installed"
  else
    brew install gnupg
    print_success "gnupg installed successfully"
  fi

  # Install Doppler CLI
  print_info "Installing Doppler CLI..."
  if brew list doppler &> /dev/null; then
    print_warning "Doppler CLI is already installed"
  else
    brew install dopplerhq/cli/doppler
    print_success "Doppler CLI installed successfully"
  fi

  # Update Doppler to latest version
  print_info "Updating Doppler CLI to latest version..."
  doppler update
  print_success "Doppler CLI updated successfully"
}

# Main execution
main() {
  print_info "Starting setup..."

  # Check for Homebrew
  if check_homebrew; then
    # Install dependencies
    install_dependencies

    print_success "Setup completed successfully!"
    print_info "You can now use Doppler CLI. Run 'doppler --help' to get started."
  else
    print_error "Setup failed: Homebrew is required"
    exit 1
  fi
}

# Run main function
main
