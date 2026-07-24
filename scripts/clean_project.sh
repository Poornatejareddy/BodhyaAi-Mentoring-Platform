#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI ENTERPRISE CLEAN UTILITY
# ==============================================================================

GREEN="\033[0;32m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}           BODHYAAI WORKSPACE CLEANER               ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Stop processes first
./scripts/stop_project.sh

echo "Purging temporary folders..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".pytest_cache" -exec rm -rf {} +
find . -type d -name ".mypy_cache" -exec rm -rf {} +
find . -type d -name ".ruff_cache" -exec rm -rf {} +
find . -type d -name "node_modules" -exec rm -rf {} +
find . -type d -name "dist" -exec rm -rf {} +
find . -type d -name "build" -exec rm -rf {} +

echo "Purging logs and markers..."
rm -rf logs .pids
rm -rf ai-services/venv

echo -e "${GREEN}Cleanup completed successfully!${NC}"
echo -e "${CYAN}====================================================${NC}"
