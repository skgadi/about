#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Building Quasar project for production..."

# Navigate to the client directory
cd ../client


# remove existing dist directory if it exists
if [ -d "dist/" ]; then
  echo "Removing existing dist directory..."
  rm -rf dist/
fi

# Build the Quasar project
yarn build-pwa

echo "Build complete. Output is in the /dist/spa directory."

# navigate back to the deploy directory
cd ../deploy