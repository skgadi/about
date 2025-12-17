#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the server directory
cd ../server

# remove existing dist directory if it exists
if [ -d "dist" ]; then
  echo "Removing existing dist directory..."
  rm -rf dist
fi

# Compile the TypeScript code
echo "Compiling TypeScript code in ../server/ ..."
npx tsc

echo "Compilation complete."

# navigate back to the deploy directory
cd ../deploy