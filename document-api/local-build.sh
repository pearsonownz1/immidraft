#!/bin/bash

set -e

# Configuration
IMAGE_NAME="document-ai-api:local"
CACHE_DIR=".buildx-cache"

echo "==============================================================="
echo "🚀 Building Docker image with BuildKit caching"
echo "==============================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create cache directory if it doesn't exist
mkdir -p $CACHE_DIR

# Check if BuildKit builder exists, create if not
BUILDER_EXISTS=$(docker buildx ls | grep -c "mybuilder" || true)
if [ "$BUILDER_EXISTS" -eq 0 ]; then
  echo "🏗️ Creating new BuildKit builder..."
  docker buildx create --name mybuilder --use
else
  echo "✅ Using existing BuildKit builder: mybuilder"
  docker buildx use mybuilder
fi

# Build the image with BuildKit caching
echo "🏗️ Building image with BuildKit caching..."
docker buildx build \
  --platform=linux/amd64 \
  --cache-from=type=local,src=$CACHE_DIR \
  --cache-to=type=local,dest=$CACHE_DIR-new \
  -t $IMAGE_NAME \
  --load \
  .

# Move the cache (this is a BuildKit best practice)
echo "📦 Updating cache..."
rm -rf $CACHE_DIR
mv $CACHE_DIR-new $CACHE_DIR

echo "✅ Build complete!"
echo "Image: $IMAGE_NAME"
echo ""
echo "To run the container locally:"
echo "docker run -p 8080:8080 -e GCP_PROJECT_ID=original-nation-459118-a4 -e GCP_LOCATION=us -e GCP_PROCESSOR_ID=9e624c7085434bd9 $IMAGE_NAME"
