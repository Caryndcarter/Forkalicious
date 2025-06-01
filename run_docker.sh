#!/bin/sh

# Load .env file
if [ -f .env ]; then
  export PORT=$(grep '^PORT=' .env | cut -d '=' -f2-)
  export MONGODB_URI=$(grep '^MONGODB_URI=' .env | cut -d '=' -f2-)
  export SPOONACULAR_API_KEY=$(grep '^SPOONACULAR_API_KEY=' .env | cut -d '=' -f2-)
  export API_BASE_URL=$(grep '^API_BASE_URL=' .env | cut -d '=' -f2-)
  export JWT_SECRET_KEY=$(grep '^JWT_SECRET_KEY=' .env | cut -d '=' -f2-)
  export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d '=' -f2-)

else
  echo ".env file not found."
  echo "see the README for instructions."
  exit 1
fi

echo $PORT
echo $MONGODB_URI

docker run \
  -e PORT=$PORT \
  -e MONGODB_URI=$MONGODB_URI \
  -e SPOONACULAR_API_KEY=$SPOONACULAR_API_KEY \
  -e API_BASE_URL=$API_BASE_URL \
  -e JWT_SECRET_KEY=$JWT_SECRET_KEY \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -p $PORT:$PORT \
  my-app:latest
