#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the client
./build-client.sh

# Build the server
./build-server.sh

echo "Both client and server builds are complete."