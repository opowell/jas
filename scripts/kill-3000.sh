#!/bin/bash
pids=$(lsof -ti tcp:3000)
if [ -z "$pids" ]; then
  echo "No processes on port 3000"
else
  echo "Killing: $pids"
  kill $pids
fi
