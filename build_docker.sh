#!/bin/sh

DOCKER_TAG=forkalicious:latest
DOCKER_DEFAULT_PLATFORM=${2:-linux/amd64}

docker build --platform $DOCKER_DEFAULT_PLATFORM -t $DOCKER_TAG .
