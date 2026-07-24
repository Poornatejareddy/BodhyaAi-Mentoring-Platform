#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI PROJECT RESTART UTILITY
# ==============================================================================

GREEN="\033[0;32m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}        RESTARTING ALL BODHYAAI SERVICES            ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Execute stop
./scripts/stop_project.sh

# Execute start (it automatically audits dependencies and runs validations)
./scripts/run_project.sh
