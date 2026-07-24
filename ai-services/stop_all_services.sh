#!/bin/bash

# stop_all_services.sh
# Stops all BodhyaAI FastAPI services gracefully.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$SCRIPT_DIR"
PID_FILE="$BASE_DIR/.services.pid"

echo "🛑 Stopping BodhyaAI Microservices..."

if [ -f "$PID_FILE" ]; then
    while IFS= read -r line; do
        if [ ! -z "$line" ]; then
            svc_name=$(echo "$line" | cut -d':' -f1)
            pid=$(echo "$line" | cut -d':' -f2)
            
            if kill -0 "$pid" 2>/dev/null; then
                echo "Terminating $svc_name (PID: $pid)..."
                kill "$pid"
                # Wait up to 3 seconds for it to exit
                for i in {1..3}; do
                    if ! kill -0 "$pid" 2>/dev/null; then
                        break
                    fi
                    sleep 1
                done
                # Force kill if still running
                if kill -0 "$pid" 2>/dev/null; then
                    echo "Force killing $svc_name (PID: $pid)..."
                    kill -9 "$pid"
                fi
            else
                echo "$svc_name (PID: $pid) is already stopped."
            fi
        fi
    done < "$PID_FILE"
    rm "$PID_FILE"
else
    echo "⚠️ .services.pid file not found. Falling back to port-based termination..."
fi

# Fallback/Safety Check: Kill any remaining python processes on ports 8000, 8001, 8002, 8003
PORTS=(8000 8001 8002 8003)
for port in "${PORTS[@]}"; do
    pid=$(lsof -t -i :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Found remaining process on port $port (PID: $pid). Terminating..."
        kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
    fi
done

echo "✅ All services stopped."
