# Proposed kp-k8s-dev changes (staged here — WS-H, 2026-07-04)

The real GitOps repo (`~/Kodepull/Repositories/kp-k8s-dev`) has uncommitted
WIP, so the audit-remediation manifests are staged in this directory instead
of being written there. Review, then copy into:

```
~/Kodepull/Repositories/kp-k8s-dev/namespaces/web-development/portfolio-deployment.yaml
~/Kodepull/Repositories/kp-k8s-dev/namespaces/web-development/portfolio-service.yaml
~/Kodepull/Repositories/kp-k8s-dev/namespaces/web-development/blog-deployment.yaml
~/Kodepull/Repositories/kp-k8s-dev/namespaces/web-development/blog-service.yaml
~/Kodepull/Repositories/kp-k8s-dev/namespaces/web-development/portfolio-rbac.yaml   (new file)
```

## Ship-together constraint (important)

The Dockerfiles in this repo now run **non-root on port 8080**
(`cjoga/portfolio`: `USER node`, `PORT=8080`; `cjoga/blog`:
`nginxinc/nginx-unprivileged`, listens 8080). These manifests move
`containerPort` and the probes to 8080 to match.

**Old images + new manifests won't pass probes, and new images + old
manifests won't either.** Deploy in one window: merge this repo to `main`
(CI pushes the new `:latest` images), then apply these manifests — the
rolling update pulls the new image (`imagePullPolicy: Always`) as the new
pod template rolls out. Both Services use the *named* port `http`, so
`port: 80` and the HTTPRoutes don't change at all.

## Change-by-change

### portfolio-deployment.yaml

| Change | Why |
|---|---|
| Liveness probe back to `httpGet /api/health` (was a `tcpSocket` workaround) | Root cause fixed in code: `server/index.js` now **exempts `GET /api/health` from rate limiting** (`skip` on the limiter). Probes can no longer burn or trip the 100/15min budget, so the honest HTTP probe is safe again — it actually verifies the app answers, not just that the port is open. |
| `containerPort: 3000` → `8080`, `PORT` env → `"8080"` | Image now runs as the non-root `node` user; 8080 is the conventional unprivileged port. |
| Pod `securityContext`: `runAsNonRoot`, `runAsUser/Group: 1000`, seccomp `RuntimeDefault` | Enforces at admission what the Dockerfile's `USER node` does at build — an image regression can't silently reintroduce root. uid 1000 = `node` in `node:24-alpine`. |
| Container `securityContext`: `allowPrivilegeEscalation: false`, `capabilities: drop ALL`, `readOnlyRootFilesystem: true` + `emptyDir` at `/tmp` | An RCE in Node or a transitive dep lands in a non-root, no-caps, read-only container. The audit flagged root-alongside-SA-token as the top code-level risk. |
| `serviceAccountName: portfolio-terminal` (+ explicit `automountServiceAccountToken: true`) | The terminal was riding the namespace `default` SA. It now has a dedicated, minimally-scoped identity (see RBAC below). |
| New env `TERMINAL_NAMESPACE_ALLOWLIST: web-development,monitoring` | Explicit copy of the in-code default so the manifest documents (and can retune) what the public terminal may see. |
| `REACT_APP_SUPABASE_*` env kept | Vestigial (nothing in the Express server or the built frontend reads them at runtime), but the secret exists and removing it is out of scope here. Candidate for deletion in a follow-up. |

### portfolio-rbac.yaml (new)

The terminal server code only ever calls `list` on
pods/deployments/services (namespaced) and namespaces/nodes
(cluster-scoped), enforces a namespace allowlist in code, filters the
namespace listing to that allowlist, and no longer returns kubelet
version / OS image for nodes. The RBAC mirrors that exactly:

- `ServiceAccount web-development/portfolio-terminal`
- `Role` + `RoleBinding` in **web-development** and **monitoring** only:
  `get`,`list` on `pods`, `services`, `deployments`. No secrets, no
  configmaps, no exec/log subresources, no other namespaces.
- `ClusterRole` + `ClusterRoleBinding`: `get`,`list` on `namespaces` and
  `nodes` only — needed for `kubectl get ns` / `kubectl get nodes`.
  The app hides non-allowlisted namespaces and node version info even
  though RBAC technically returns them.

If you add a namespace to `TERMINAL_NAMESPACE_ALLOWLIST`, add a matching
Role/RoleBinding for the SA in that namespace — code and RBAC should
always name the same set.

### blog-deployment.yaml

| Change | Why |
|---|---|
| `containerPort: 80` → `8080` | `nginxinc/nginx-unprivileged:1-alpine` base runs as uid 101 and listens on 8080 — no root nginx master process at all. |
| `automountServiceAccountToken: false` | A static nginx site has zero reason to hold an API-server credential. |
| Pod + container `securityContext` (same shape as portfolio, uid 101) | Same defense-in-depth rationale. |
| `readOnlyRootFilesystem: true` + `emptyDir` at `/tmp` | `blog-site/nginx.conf` was rewritten to keep the pid file and all temp paths under `/tmp`, so this actually works. |

### Services

`portfolio-service.yaml` is a cleaned copy (the live one carried
`status`/`uid`/last-applied noise); `blog-service.yaml` is unchanged.
Both target the named port `http` — **no HTTPRoute or Envoy change needed**.

## Apply order

```bash
kubectl apply -f portfolio-rbac.yaml        # SA must exist before the pod spec references it
kubectl apply -f portfolio-deployment.yaml
kubectl apply -f portfolio-service.yaml
kubectl apply -f blog-deployment.yaml
kubectl apply -f blog-service.yaml
```

Verify afterwards:

```bash
kubectl auth can-i list pods -n web-development --as=system:serviceaccount:web-development:portfolio-terminal   # yes
kubectl auth can-i list secrets -n web-development --as=system:serviceaccount:web-development:portfolio-terminal # no
kubectl auth can-i list pods -n kube-system --as=system:serviceaccount:web-development:portfolio-terminal        # no
kubectl get pods -n web-development   # all Running, restarts 0
curl -s https://cjoga.cloud/api/health
curl -s https://blog.cjoga.cloud/healthz
```

## Not included (follow-ups worth considering)

- **NetworkPolicy** restricting portfolio egress to the API server + DNS
  (audit §7 "verify in kp-k8s-dev" item).
- Dropping the vestigial `REACT_APP_SUPABASE_*` env + secret.
- Pinning images by digest instead of `:latest` (would pair well with the
  SHA-pinned Actions now in `.github/workflows/build-images.yaml`).
