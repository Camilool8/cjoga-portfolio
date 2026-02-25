import express from "express";
import logger from "../utils/logger.js";
import {
  getPods,
  getDeployments,
  getNodes,
  getNamespaces,
  getServices,
} from "../services/k8sClient.js";

const router = express.Router();

const MAX_COMMAND_LENGTH = 200;

const RESOURCE_ALIASES = {
  pods: "pods",
  pod: "pods",
  po: "pods",
  deployments: "deployments",
  deployment: "deployments",
  deploy: "deployments",
  services: "services",
  service: "services",
  svc: "services",
  nodes: "nodes",
  node: "nodes",
  no: "nodes",
  namespaces: "namespaces",
  namespace: "namespaces",
  ns: "namespaces",
};

const CLUSTER_SCOPED = new Set(["nodes", "namespaces"]);

const RESOURCE_HANDLERS = {
  pods: getPods,
  deployments: getDeployments,
  services: getServices,
  nodes: getNodes,
  namespaces: getNamespaces,
};

const NS_REGEX = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?$/;

function formatAsTable(headers, rows) {
  if (rows.length === 0) return "No resources found.";

  const widths = headers.map((h, i) => {
    const values = rows.map((r) => String(Object.values(r)[i] ?? ""));
    return Math.max(h.length, ...values.map((v) => v.length));
  });

  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("   ");
  const dataLines = rows.map((row) =>
    Object.values(row)
      .map((v, i) => String(v ?? "").padEnd(widths[i]))
      .join("   ")
  );

  return [headerLine, ...dataLines].join("\n");
}

const FORMATTERS = {
  pods: (data) =>
    formatAsTable(
      ["NAME", "READY", "STATUS", "RESTARTS", "AGE"],
      data.map((p) => ({ name: p.name, ready: p.ready, status: p.status, restarts: p.restarts, age: p.age }))
    ),
  deployments: (data) =>
    formatAsTable(
      ["NAME", "READY", "UP-TO-DATE", "AVAILABLE", "AGE"],
      data.map((d) => ({ name: d.name, ready: d.ready, upToDate: d.upToDate, available: d.available, age: d.age }))
    ),
  services: (data) =>
    formatAsTable(
      ["NAME", "TYPE", "CLUSTER-IP", "PORT(S)", "AGE"],
      data.map((s) => ({ name: s.name, type: s.type, clusterIp: s.clusterIp, ports: s.ports, age: s.age }))
    ),
  nodes: (data) =>
    formatAsTable(
      ["NAME", "STATUS", "ROLES", "AGE", "VERSION"],
      data.map((n) => ({ name: n.name, status: n.status, roles: n.roles, age: n.age, version: n.version }))
    ),
  namespaces: (data) =>
    formatAsTable(
      ["NAME", "STATUS", "AGE"],
      data.map((ns) => ({ name: ns.name, status: ns.status, age: ns.age }))
    ),
};

/**
 * Parse a kubectl command. Only allows: kubectl get <resource> [-n <namespace>]
 * Returns { resource, namespace } or { error: string }
 */
function parseKubectlCommand(normalized) {
  const tokens = normalized.split(" ").filter(Boolean);

  if (tokens[0] !== "kubectl") return { error: "not-kubectl" };

  if (tokens.length < 3 || tokens[1] !== "get") {
    const sub = tokens[1] || "";
    const blocked = [
      "describe", "delete", "create", "apply", "edit", "patch",
      "logs", "exec", "run", "scale", "rollout", "top", "auth",
      "config", "port-forward", "cp", "attach", "label", "annotate",
    ];
    if (blocked.includes(sub)) {
      return { error: `Error: '${sub}' is not allowed. Only 'kubectl get' commands are permitted.` };
    }
    return {
      error: "Error: Only 'kubectl get <resource>' commands are allowed.\nAvailable resources: namespaces | pods | deployments | services | nodes",
    };
  }

  const resource = tokens[2];
  const canonical = RESOURCE_ALIASES[resource];

  if (!canonical) {
    const denied = [
      "configmaps", "configmap", "cm", "secrets", "secret",
      "ingress", "ingresses", "ing", "cronjobs", "cronjob", "cj",
      "jobs", "job", "statefulsets", "statefulset", "sts",
      "daemonsets", "daemonset", "ds", "replicasets", "replicaset", "rs",
      "pv", "pvc", "persistentvolumes", "persistentvolumeclaims",
      "endpoints", "ep", "networkpolicies", "networkpolicy",
      "roles", "rolebindings", "clusterroles", "clusterrolebindings",
      "serviceaccounts", "sa", "events", "ev",
    ];
    if (denied.includes(resource)) {
      return { error: `Error: '${resource}' is not accessible from this terminal.\nAvailable resources: namespaces | pods | deployments | services | nodes` };
    }
    return { error: `Error: unknown resource '${resource}'.\nAvailable resources: namespaces | pods | deployments | services | nodes` };
  }

  let namespace = null;
  let i = 3;
  while (i < tokens.length) {
    if (tokens[i] === "-n" || tokens[i] === "--namespace") {
      if (CLUSTER_SCOPED.has(canonical)) {
        return { error: `Error: ${canonical} are cluster-scoped. The -n flag is not applicable.` };
      }
      if (i + 1 >= tokens.length) {
        return { error: "Error: -n flag requires a namespace argument." };
      }
      namespace = tokens[i + 1];
      if (!NS_REGEX.test(namespace)) {
        return { error: "Error: invalid namespace name." };
      }
      i += 2;
    } else if (tokens[i].startsWith("-")) {
      return { error: `Error: flag '${tokens[i]}' is not allowed. Only '-n <namespace>' is supported.` };
    } else {
      return { error: `Error: unexpected argument '${tokens[i]}'.` };
    }
  }

  return { resource: canonical, namespace };
}

router.post("/execute", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== "string") {
      return res.json({ output: "Error: No command provided.", type: "error" });
    }

    const normalized = command.trim().toLowerCase().replace(/\s+/g, " ");

    if (normalized.length > MAX_COMMAND_LENGTH) {
      return res.json({ output: "Error: Command too long (max 200 characters).", type: "error" });
    }

    const parsed = parseKubectlCommand(normalized);

    if (parsed.error === "not-kubectl") {
      return res.json({
        output: `command not found: ${command.trim().split(" ")[0]}. Type 'help' for available commands.`,
        type: "error",
      });
    }

    if (parsed.error) {
      return res.json({ output: parsed.error, type: "error" });
    }

    const { resource, namespace } = parsed;
    const handler = RESOURCE_HANDLERS[resource];
    const formatter = FORMATTERS[resource];

    const effectiveNs = namespace || "web-development";
    logger.info(`Terminal kubectl: get ${resource}${!CLUSTER_SCOPED.has(resource) ? ` -n ${effectiveNs}` : ""}`);

    const data = CLUSTER_SCOPED.has(resource)
      ? await handler()
      : await handler(effectiveNs);

    const output = formatter(data);

    return res.json({ output, type: "success" });
  } catch (err) {
    logger.error("Terminal execute error:", err.message);
    return res.json({
      output: "Error: Failed to execute command. Please try again.",
      type: "error",
    });
  }
});

export default router;
