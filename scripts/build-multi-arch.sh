#!/bin/bash
set -e

# Configuration
IMAGE_NAME="cjoga/portfolio"
IMAGE_TAG=$(date +"%Y%m%d-%H%M%S")
LATEST_TAG="latest"

# Show configuration
echo "Building multi-architecture Docker image"
echo "========================================"
echo "Image name: $IMAGE_NAME"
echo "Image tag: $IMAGE_TAG"
echo

# Set up Docker buildx
echo "Setting up Docker buildx..."
docker buildx create --name multiarchbuilder --use || true
docker buildx inspect --bootstrap

# Build and push the multi-architecture image
echo "Building and pushing multi-architecture image..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag $IMAGE_NAME:$IMAGE_TAG \
  --tag $IMAGE_NAME:$LATEST_TAG \
  --push \
  .

echo
echo "Multi-architecture image built and pushed successfully:"
echo "$IMAGE_NAME:$IMAGE_TAG"
echo "$IMAGE_NAME:$LATEST_TAG"
echo 
echo "Supported architectures: linux/amd64, linux/arm64"
echo
echo "To deploy to Kubernetes, run:"
echo "kubectl apply -f kubernetes/portfolio.yaml"