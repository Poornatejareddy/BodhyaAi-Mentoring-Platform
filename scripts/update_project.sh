#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI CODEBASE UPDATE UTILITY
# ==============================================================================

GREEN="\033[0;32m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}           BODHYAAI CODEBASE SYNC/UPDATE            ${NC}"
echo -e "${CYAN}====================================================${NC}"

echo "Fetching latest changes from Git..."
git pull

echo "Updating dependencies..."
./scripts/setup_project.sh

echo -e "${GREEN}Update and provisioning completed successfully!${NC}"
echo -e "${CYAN}====================================================${NC}"
