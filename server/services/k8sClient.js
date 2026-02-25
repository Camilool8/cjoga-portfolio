import * as k8s from "@kubernetes/client-node";
import logger from "../utils/logger.js";

const DEFAULT_NAMESPACE = "web-development";
const isProduction = process.env.NODE_ENV === "production";

const kc = new k8s.KubeConfig();

if (isProduction) {
  kc.loadFromCluster();
} else {
  try {
    kc.loadFromDefault();
  } catch {
    logger.warn("No kubeconfig found - terminal will return mock data in dev");
  }
}

let coreApi;
let appsApi;

try {
  coreApi = kc.makeApiClient(k8s.CoreV1Api);
  appsApi = kc.makeApiClient(k8s.AppsV1Api);
} catch {
  logger.warn("Failed to create K8s API clients");
}

function humanizeAge(timestamp) {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const created = new Date(timestamp).getTime();
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}d`;
  if (diffHour > 0) return `${diffHour}h`;
  if (diffMin > 0) return `${diffMin}m`;
  return `${diffSec}s`;
}

function extractRoles(labels) {
  if (!labels) return "<none>";
  const roles = Object.keys(labels)
    .filter((k) => k.startsWith("node-role.kubernetes.io/"))
    .map((k) => k.replace("node-role.kubernetes.io/", ""));
  return roles.length > 0 ? roles.join(",") : "<none>";
}

const MOCK_NAMESPACES = [
  { name: "default", status: "Active", age: "365d" },
  { name: "kube-system", status: "Active", age: "365d" },
  { name: "web-development", status: "Active", age: "180d" },
  { name: "monitoring", status: "Active", age: "120d" },
  { name: "argocd", status: "Active", age: "90d" },
  { name: "traefik", status: "Active", age: "180d" },
];

const MOCK_PODS = {
  "web-development": [
    { name: "portfolio-deploy-7f8b9c6d4-x2kp9", namespace: "web-development", status: "Running", ready: "1/1", restarts: 0, age: "5d" },
    { name: "portfolio-deploy-7f8b9c6d4-m4nt2", namespace: "web-development", status: "Running", ready: "1/1", restarts: 0, age: "5d" },
  ],
  "kube-system": [
    { name: "coredns-7b98449c4-zt8kp", namespace: "kube-system", status: "Running", ready: "1/1", restarts: 0, age: "90d" },
    { name: "local-path-provisioner-6795b5f9d8-w2f7n", namespace: "kube-system", status: "Running", ready: "1/1", restarts: 2, age: "90d" },
    { name: "metrics-server-cdcc87586-r4j6l", namespace: "kube-system", status: "Running", ready: "1/1", restarts: 0, age: "90d" },
  ],
  "monitoring": [
    { name: "prometheus-server-0", namespace: "monitoring", status: "Running", ready: "1/1", restarts: 0, age: "30d" },
    { name: "grafana-5d4f8c7b9-kx2mt", namespace: "monitoring", status: "Running", ready: "1/1", restarts: 0, age: "30d" },
    { name: "loki-0", namespace: "monitoring", status: "Running", ready: "1/1", restarts: 1, age: "30d" },
  ],
};

const MOCK_DEPLOYMENTS = {
  "web-development": [
    { name: "portfolio-deploy", namespace: "web-development", ready: "2/2", upToDate: 2, available: 2, age: "30d" },
  ],
  "monitoring": [
    { name: "grafana", namespace: "monitoring", ready: "1/1", upToDate: 1, available: 1, age: "30d" },
  ],
};

const MOCK_SERVICES = {
  "web-development": [
    { name: "portfolio-svc", namespace: "web-development", type: "ClusterIP", clusterIp: "10.43.12.45", ports: "80/TCP", age: "30d" },
  ],
  "kube-system": [
    { name: "kube-dns", namespace: "kube-system", type: "ClusterIP", clusterIp: "10.43.0.10", ports: "53/UDP,53/TCP,9153/TCP", age: "365d" },
    { name: "metrics-server", namespace: "kube-system", type: "ClusterIP", clusterIp: "10.43.0.2", ports: "443/TCP", age: "90d" },
  ],
  "monitoring": [
    { name: "prometheus-server", namespace: "monitoring", type: "ClusterIP", clusterIp: "10.43.8.21", ports: "9090/TCP", age: "30d" },
    { name: "grafana", namespace: "monitoring", type: "ClusterIP", clusterIp: "10.43.8.33", ports: "3000/TCP", age: "30d" },
  ],
};

const MOCK_NODES = [
  { name: "k3s-master-01", status: "Ready", roles: "control-plane,master", age: "180d", version: "v1.28.4+k3s1", os: "Debian GNU/Linux 12", arch: "arm64" },
  { name: "k3s-worker-01", status: "Ready", roles: "worker", age: "180d", version: "v1.28.4+k3s1", os: "Debian GNU/Linux 12", arch: "arm64" },
  { name: "k3s-worker-02", status: "Ready", roles: "worker", age: "90d", version: "v1.28.4+k3s1", os: "Debian GNU/Linux 12", arch: "arm64" },
];

function getMockData(resource, namespace) {
  const mockMap = { pods: MOCK_PODS, deployments: MOCK_DEPLOYMENTS, services: MOCK_SERVICES };
  const data = mockMap[resource];
  if (!data) return [];
  return data[namespace] || [];
}

export async function getNamespaces() {
  if (!coreApi) {
    logger.info("Returning mock namespace data (no K8s client)");
    return MOCK_NAMESPACES;
  }

  try {
    const res = await coreApi.listNamespace({});
    return res.items.map((ns) => ({
      name: ns.metadata.name,
      status: ns.status?.phase || "Unknown",
      age: humanizeAge(ns.metadata.creationTimestamp),
    }));
  } catch (err) {
    logger.error("Failed to list namespaces:", err.message);
    if (!isProduction) return MOCK_NAMESPACES;
    throw new Error("Failed to retrieve namespace information");
  }
}

export async function getPods(namespace = DEFAULT_NAMESPACE) {
  if (!coreApi) {
    logger.info("Returning mock pod data (no K8s client)");
    return getMockData("pods", namespace);
  }

  try {
    const res = await coreApi.listNamespacedPod({ namespace });
    return res.items.map((pod) => {
      const containers = pod.status?.containerStatuses || [];
      const readyCount = containers.filter((c) => c.ready).length;
      const totalCount = containers.length || pod.spec?.containers?.length || 0;
      const totalRestarts = containers.reduce((sum, c) => sum + (c.restartCount || 0), 0);

      return {
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        status: pod.status?.phase || "Unknown",
        ready: `${readyCount}/${totalCount}`,
        restarts: totalRestarts,
        age: humanizeAge(pod.metadata.creationTimestamp),
      };
    });
  } catch (err) {
    logger.error(`Failed to list pods in ${namespace}:`, err.message);
    if (!isProduction) return getMockData("pods", namespace);
    throw new Error("Failed to retrieve pod information");
  }
}

export async function getDeployments(namespace = DEFAULT_NAMESPACE) {
  if (!appsApi) {
    logger.info("Returning mock deployment data (no K8s client)");
    return getMockData("deployments", namespace);
  }

  try {
    const res = await appsApi.listNamespacedDeployment({ namespace });
    return res.items.map((deploy) => ({
      name: deploy.metadata.name,
      namespace: deploy.metadata.namespace,
      ready: `${deploy.status?.readyReplicas || 0}/${deploy.spec?.replicas || 0}`,
      upToDate: deploy.status?.updatedReplicas || 0,
      available: deploy.status?.availableReplicas || 0,
      age: humanizeAge(deploy.metadata.creationTimestamp),
    }));
  } catch (err) {
    logger.error(`Failed to list deployments in ${namespace}:`, err.message);
    if (!isProduction) return getMockData("deployments", namespace);
    throw new Error("Failed to retrieve deployment information");
  }
}

export async function getServices(namespace = DEFAULT_NAMESPACE) {
  if (!coreApi) {
    logger.info("Returning mock service data (no K8s client)");
    return getMockData("services", namespace);
  }

  try {
    const res = await coreApi.listNamespacedService({ namespace });
    return res.items.map((svc) => {
      const ports = (svc.spec?.ports || [])
        .map((p) => `${p.port}/${p.protocol}`)
        .join(",");
      return {
        name: svc.metadata.name,
        namespace: svc.metadata.namespace,
        type: svc.spec?.type || "ClusterIP",
        clusterIp: svc.spec?.clusterIP || "<none>",
        ports: ports || "<none>",
        age: humanizeAge(svc.metadata.creationTimestamp),
      };
    });
  } catch (err) {
    logger.error(`Failed to list services in ${namespace}:`, err.message);
    if (!isProduction) return getMockData("services", namespace);
    throw new Error("Failed to retrieve service information");
  }
}

export async function getNodes() {
  if (!coreApi) {
    logger.info("Returning mock node data (no K8s client)");
    return MOCK_NODES;
  }

  try {
    const res = await coreApi.listNode({});
    return res.items.map((node) => {
      const readyCondition = node.status?.conditions?.find((c) => c.type === "Ready");
      return {
        name: node.metadata.name,
        status: readyCondition?.status === "True" ? "Ready" : "NotReady",
        roles: extractRoles(node.metadata.labels),
        age: humanizeAge(node.metadata.creationTimestamp),
        version: node.status?.nodeInfo?.kubeletVersion || "Unknown",
        os: node.status?.nodeInfo?.osImage || "Unknown",
        arch: node.status?.nodeInfo?.architecture || "Unknown",
      };
    });
  } catch (err) {
    logger.error("Failed to list nodes:", err.message);
    if (!isProduction) return MOCK_NODES;
    throw new Error("Failed to retrieve node information");
  }
}
