#!/bin/sh
# Stops the server listening on a port: the first argument, else $PORT, else
# 3000. Only listeners are stopped, not programs connected to the port (a
# browser with one of its pages open, say).
#
#   ./scripts/kill-port.sh          # port 3000 (or $PORT)
#   ./scripts/kill-port.sh 4500

port=${1:-${PORT:-3000}}

pids=$(lsof -ti "tcp:$port" -sTCP:LISTEN)
if [ -z "$pids" ]; then
  echo "Nothing is listening on port $port"
  exit 0
fi

for pid in $pids; do
  echo "Stopping $pid: $(ps -o command= -p "$pid")"
done
kill $pids

# Give them a few seconds to shut down, then force whatever is left.
for _ in 1 2 3 4 5; do
  sleep 1
  pids=$(lsof -ti "tcp:$port" -sTCP:LISTEN)
  if [ -z "$pids" ]; then
    echo "Port $port is free"
    exit 0
  fi
done
echo "Still running after 5 seconds, forcing: $pids"
kill -9 $pids
