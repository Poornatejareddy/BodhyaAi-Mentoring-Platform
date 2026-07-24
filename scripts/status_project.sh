#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI ENTERPRISE STATUS AND RESOURCE DASHBOARD
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}             BODHYAAI SERVICE STATUS & METRICS DASHBOARD              ${NC}"
echo -e "${CYAN}======================================================================${NC}"

PID_DIR=".pids"

# Header
printf "%-22s %-10s %-8s %-6s %-7s %-7s %-12s\n" "SERVICE" "STATUS" "PID" "PORT" "CPU %" "RAM %" "UPTIME"
echo "----------------------------------------------------------------------"

get_uptime() {
    local pid=$1
    if [ -z "$pid" ]; then
        echo "-"
        return
    fi
    # Use ps to get elapsed time if running
    local etime
    etime=$(ps -p "$pid" -o etime= 2>/dev/null | xargs)
    if [ -n "$etime" ]; then
        echo "$etime"
    else
        echo "-"
    fi
}

check_status() {
    local pid_file="$PID_DIR/$1"
    local name=$2
    local port=$3

    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file")
        
        if [[ "$pid" == external-* ]]; then
            if nc -z localhost "$port" >/dev/null 2>&1; then
                printf "%-22s ${GREEN}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "RUNNING" "External" "$port" "-" "-" "External"
            else
                printf "%-22s ${RED}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "OFFLINE" "External" "$port" "-" "-" "-"
            fi
        elif [[ "$pid" == docker-* ]]; then
            local container_name=${pid#docker-}
            if docker ps --format '{{.Names}}' | grep -q "^$container_name$"; then
                local stats
                stats=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemPerc}}" "$container_name" 2>/dev/null)
                local cpu
                local mem
                cpu=$(echo "$stats" | awk '{print $1}')
                mem=$(echo "$stats" | awk '{print $2}')
                local uptime
                uptime=$(docker inspect -f '{{.State.StartedAt}}' "$container_name" 2>/dev/null)
                # Formulate a simplified time format
                if [ -n "$uptime" ]; then
                    uptime="Active"
                else
                    uptime="-"
                fi
                printf "%-22s ${GREEN}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "RUNNING" "Docker" "$port" "${cpu:-0%}" "${mem:-0%}" "$uptime"
            else
                printf "%-22s ${RED}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "OFFLINE" "-" "$port" "-" "-" "-"
            fi
        else
            if kill -0 "$pid" >/dev/null 2>&1; then
                local stats
                stats=$(ps -p "$pid" -o %cpu,%mem --no-headers 2>/dev/null)
                local cpu
                local mem
                cpu=$(echo "$stats" | awk '{print $1}' | xargs)
                mem=$(echo "$stats" | awk '{print $2}' | xargs)
                local uptime
                uptime=$(get_uptime "$pid")
                printf "%-22s ${GREEN}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "RUNNING" "$pid" "$port" "${cpu:-0}%" "${mem:-0}%" "$uptime"
            else
                printf "%-22s ${RED}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "OFFLINE" "-" "$port" "-" "-" "-"
            fi
        fi
    else
        printf "%-22s ${RED}%-10s${NC} %-8s %-6s %-7s %-7s %-12s\n" "$name" "OFFLINE" "-" "$port" "-" "-" "-"
    fi
}

check_status "mongodb.pid" "MongoDB Service" "27017"
check_status "cog.pid" "Cognitive Service" "8000"
check_status "risk.pid" "Risk Service" "8001"
check_status "xai.pid" "XAI Service" "8002"
check_status "llm.pid" "LLM Service" "8003"
check_status "backend.pid" "Express Backend" "5001"
check_status "frontend.pid" "Frontend Client" "5173"

echo -e "${CYAN}======================================================================${NC}"
