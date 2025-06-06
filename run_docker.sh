#!/bin/sh

docker run \
  -it \
  -e PORT=3001 \
  -e MONGODB_URI="" \
  -e SPOONACULAR_API_KEY="" \
  -e API_BASE_URL="https://api.spoonacular.com" \
  -e JWT_SECRET_KEY="randomString" \
  -e OPENAI_API_KEY="" \
  -p 3001:3001 \
  forkalicious:latest
