#!/bin/bash

./build-server.sh
./build-client.sh
./organize-folders.sh

# Build the Docker image for the application
sudo docker build -t papr .

echo "Docker image 'papr' built successfully."

# Zip the docker image to papr-image.zip
sudo docker save -o papr-image.tar papr
echo "Docker image 'papr' saved to papr-image.tar"

# change permissions of papr-image.tar to read and write for all users
sudo chmod 666 papr-image.tar
echo "Permissions for papr-image.tar changed to read and write for all users."