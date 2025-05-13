#!/bin/bash

set -e

echo "==============================================================="
echo "🚀 Setting up Docker BuildKit for faster builds"
echo "==============================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create a new BuildKit builder if it doesn't exist
BUILDER_EXISTS=$(docker buildx ls | grep -c "mybuilder" || true)
if [ "$BUILDER_EXISTS" -eq 0 ]; then
  echo "🏗️ Creating new BuildKit builder..."
  docker buildx create --name mybuilder --use
else
  echo "✅ BuildKit builder exists, using it..."
  docker buildx use mybuilder
fi

# Create cache directory if it doesn't exist
mkdir -p .buildx-cache

echo "✅ BuildKit setup complete!"
echo ""
echo "To build with BuildKit caching, use:"
echo ""
echo "docker buildx build \\"
echo "  --platform=linux/amd64 \\"
echo "  --cache-from=type=local,src=.buildx-cache \\"
echo "  --cache-to=type=local,dest=.buildx-cache-new \\"
echo "  -t your-image-name \\"
echo "  --push ."
echo ""
echo "After building, move the cache with:"
echo "rm -rf .buildx-cache"
echo "mv .buildx-cache-new .buildx-cache"
