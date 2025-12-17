#!/bin/bash

# Remove existing temp directory if it exists
if [ -d "temp/" ]; then
  echo "Removing existing temp directory..."
  rm -rf temp/
fi

# Create the temp directory
mkdir temp

# Copy the server dist to temp
cp -r ../server/dist/. temp
# Copy package.json and package-lock.json to temp
cp ../server/package.json temp/
if [ -f "../server/package-lock.json" ]; then
  cp ../server/package-lock.json temp/
fi
if [ -f "../server/yarn.lock" ]; then
  cp ../server/yarn.lock temp/
fi

# Create the public directory inside temp
mkdir temp/public

# Copy the client build to the public directory
cp -r ../client/dist/pwa/. temp/public/

echo "Folders organized in temp directory."