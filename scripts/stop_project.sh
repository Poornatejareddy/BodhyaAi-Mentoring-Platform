#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI ENTERPRISE CLEAN SHUTDOWN UTILITY
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}        BODHYAAI SERVICES CLEAN SHUTDOWN            ${NC}"
echo -e "${CYAN}====================================================${NC}"

PID_DIR=".pids"

stop_process() {
    local pid_file="$PID_DIR/$1"
    local name=$2

    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file")
        echo -n "Stopping $name (PID $pid)... "
        
        if [[ "$pid" == external-* ]]; then
            echo -e "${YELLOW}[EXTERNAL INSTANCE LEFT RUNNING]${NC}"
        elif [[ "$pid" == docker-* ]]; then
            local container_name=${pid#docker-}
            docker rm -f "$container_name" >/dev/null 2>&1
            echo -e "${GREEN}[STOPPED CONTAINER]${NC}"
        else
            if kill -0 "$pid" >/dev/null 2>&1; then
                kill "$pid" >/dev/null 2>&1
                sleep 1
                if kill -0 "$pid" >/dev/null 2>&1; then
                    kill -9 "$pid" >/dev/null 2>&1
                fi
                echo -e "${GREEN}[STOPPED]${NC}"
            else
                echo -e "${YELLOW}[ALREADY OFFLINE]${NC}"
            fi
        fi
        rm -f "$pid_file"
    else
        echo -e "$name pid file not found. ${YELLOW}[SKIPPED]${NC}"
    fi
}

stop_process "frontend.pid" "Frontend Client"
stop_process "backend.pid" "Backend Gateway"
stop_process "llm.pid" "LLM Service"
stop_process "xai.pid" "XAI Service"
stop_process "risk.pid" "Risk Service"
stop_process "cog.pid" "Cognitive Service"
stop_process "mongodb.pid" "MongoDB Service"

rm -rf "$PID_DIR"
echo -e "${CYAN}====================================================${NC}"
echo -e "${GREEN}Shutdown completed successfully! All processes stopped.${NC}"
echo -e "${CYAN}====================================================${NC}"
