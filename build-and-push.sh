#!/bin/bash
set -e

# Configuration - change these variables as needed
IMAGE_NAME="cjoga/portfolio"
IMAGE_TAG=$(date +"%Y%m%d-%H%M%S")
LATEST_TAG="latest"

# Show configuration
echo "Building and pushing Docker image"
echo "=================================="
echo "Image name: $IMAGE_NAME"
echo "Image tag: $IMAGE_TAG"
echo

# Build the Docker image
echo "Building image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:$LATEST_TAG .

# Push the Docker image
echo "Pushing image to registry..."
docker push $IMAGE_NAME:$IMAGE_TAG
docker push $IMAGE_NAME:$LATEST_TAG

echo
echo "Image built and pushed successfully:"
echo "$IMAGE_NAME:$IMAGE_TAG"
echo "$IMAGE_NAME:$LATEST_TAG"
echo 
echo "To deploy to Kubernetes, run:"
echo "kubectl apply -f kubernetes/portfolio.yaml"