# Kubernetes Deployment for cjoga.cloud Portfolio

This directory contains Kubernetes manifests to deploy the portfolio website to a Kubernetes cluster with Traefik and Cloudflare Tunnel.

## Manifest Files

- **portfolio.yaml** - Core deployment resources:

  - Deployment: Runs the portfolio application containers
  - Service: Exposes the deployment internally
  - IngressRoute: Configures Traefik routing via Cloudflare Tunnel

- **horizontal-pod-autoscaler.yaml** - Optional HPA for automatic scaling:
  - Scales based on CPU and memory utilization
  - Maintains between 2-5 replicas depending on load

## Deployment Instructions

### Prerequisites

- Kubernetes cluster with Traefik Ingress Controller
- Cloudflare Tunnel configured and running
- kubectl CLI configured to access your cluster
- Docker registry access (Docker Hub or private registry)

### Steps to Deploy

1. Build and push the Docker image:

   ```bash
   # From the project root
   ./build-and-push.sh
   ```

2. Deploy the application:

   ```bash
   kubectl apply -f kubernetes/portfolio.yaml
   ```

3. (Optional) Apply the Horizontal Pod Autoscaler:

   ```bash
   kubectl apply -f kubernetes/horizontal-pod-autoscaler.yaml
   ```

4. Verify the deployment:
   ```bash
   kubectl get deployments,pods,services,ingressroutes
   ```

### Update Procedure

1. Build and push a new image version:

   ```bash
   ./build-and-push.sh
   ```

2. Update the deployment to use the new image:

   ```bash
   # If using a unique tag for each build
   kubectl set image deployment/portfolio-deploy portfolio-container=cjoga/portfolio:NEWTAG

   # If using the 'latest' tag
   kubectl rollout restart deployment/portfolio-deploy
   ```

### Monitoring

Check deployment status:

```bash
kubectl describe deployment portfolio-deploy
```

Check pod logs:

```bash
kubectl logs -l app=portfolio
```

Monitor scaling:

```bash
kubectl get hpa portfolio-hpa -w
```

## Configuration

### Image Registry

If you use a private registry, add an image pull secret:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=your-registry-server \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email
```

Then add to the Deployment:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: regcred
```

### Domain Configuration

Update the IngressRoute host rules in `portfolio.yaml` if you need to change domains:

```yaml
routes:
  - match: Host(`cjoga.cloud`) || Host(`www.cjoga.cloud`)
```

## Troubleshooting

**Pods not starting:**

```bash
kubectl describe pod -l app=portfolio
```

**Cannot access website:**

```bash
# Check IngressRoute
kubectl describe ingressroute portfolio-public-ingress

# Check Traefik logs
kubectl logs -n traefik-system -l app.kubernetes.io/name=traefik
```

**Service not found:**

```bash
kubectl get endpoints portfolio-svc
```
