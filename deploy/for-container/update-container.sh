#!/bin/bash

# Define variables
TAR_FILE="papr-image.tar"
IMAGE_NAME="papr"
DOCKER_CONTAINER_NAME='papr-container'

# Stop and remove the existing container
docker stop "$DOCKER_CONTAINER_NAME"
docker rm "$DOCKER_CONTAINER_NAME"


docker rmi -f $IMAGE_NAME:latest
docker load -i $TAR_FILE
docker tag $IMAGE_NAME:latest $IMAGE_NAME:latest
docker images | grep $IMAGE_NAME



# Bring up the Docker Compose services in detached mode
docker-compose up -d

