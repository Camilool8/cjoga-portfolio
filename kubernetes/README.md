# Kubernetes manifests for cjoga.cloud

The portfolio runs on KodePull's on-prem K3s cluster, exposed through Envoy Gateway (Gateway API `HTTPRoute`) and a Cloudflare Tunnel. Images are built and pushed by `.github/workflows/build-images.yaml` on every push to `main`.

## Files

- **portfolio.yaml** — the Deployment, its ClusterIP Service, and the `HTTPRoute` that attaches `cjoga.cloud` and `www.cjoga.cloud` to the public and the VPN-only gateways in `envoy-gateway-system`.
- **terminal-rbac.yaml** — the read-only RBAC for the live terminal's `portfolio-terminal` service account, scoped to an allowlist of namespaces. This file is the source of truth for it; see its header for how to add a namespace.

## Deploy

```bash
kubectl apply -f kubernetes/portfolio.yaml
kubectl apply -f kubernetes/terminal-rbac.yaml
```

Apply `terminal-rbac.yaml` only once the running image reads namespaces by name (`server/services/k8sClient.js`); older images list every namespace, which the scoped role refuses.

Roll out a new `latest` image:

```bash
kubectl rollout restart deployment/portfolio-deploy -n web-development
```

## Check

```bash
kubectl get deploy,pods,svc -n web-development -l app=portfolio
kubectl get httproute portfolio -n web-development
kubectl logs -n web-development -l app=portfolio
```
