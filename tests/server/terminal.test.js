import express from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the k8s client so tests never touch a kubeconfig or a live cluster.
vi.mock("../../server/services/k8sClient.js", () => ({
  getPods: vi.fn(async (namespace) => [
    {
      name: `pod-in-${namespace}`,
      ready: "1/1",
      status: "Running",
      restarts: 0,
      age: "5d",
    },
  ]),
  getDeployments: vi.fn(async (namespace) => [
    {
      name: `deploy-in-${namespace}`,
      ready: "2/2",
      upToDate: 2,
      available: 2,
      age: "30d",
    },
  ]),
  getServices: vi.fn(async (namespace) => [
    {
      name: `svc-in-${namespace}`,
      type: "ClusterIP",
      clusterIp: "10.43.0.1",
      ports: "80/TCP",
      age: "30d",
    },
  ]),
  getNodes: vi.fn(async () => [
    {
      name: "k3s-master-01",
      status: "Ready",
      roles: "control-plane,master",
      age: "180d",
      // Even if the client layer leaks these, the formatter must not print them.
      version: "v1.28.4+k3s1",
      os: "Debian GNU/Linux 12",
      arch: "arm64",
    },
  ]),
  getNamespaces: vi.fn(async () => [
    { name: "default", status: "Active", age: "365d" },
    { name: "kube-system", status: "Active", age: "365d" },
    { name: "web-development", status: "Active", age: "180d" },
    { name: "monitoring", status: "Active", age: "120d" },
    { name: "argocd", status: "Active", age: "90d" },
  ]),
}));

const { default: terminalRouter } = await import(
  "../../server/routes/terminal.js"
);
const k8sClient = await import("../../server/services/k8sClient.js");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/terminal", terminalRouter);
  return app;
}

const app = makeApp();

const exec = (command) =>
  request(app).post("/api/terminal/execute").send({ command });

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("terminal namespace allowlist", () => {
  it("allows -n with an allowlisted namespace", async () => {
    const res = await exec("kubectl get pods -n monitoring");
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("success");
    expect(res.body.output).toContain("pod-in-monitoring");
    expect(k8sClient.getPods).toHaveBeenCalledWith("monitoring");
  });

  it("defaults to web-development when no -n is given", async () => {
    const res = await exec("kubectl get pods");
    expect(res.body.type).toBe("success");
    expect(k8sClient.getPods).toHaveBeenCalledWith("web-development");
  });

  it("rejects -n with a namespace outside the allowlist", async () => {
    const res = await exec("kubectl get pods -n kube-system");
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("error");
    expect(res.body.output).toMatch(/not accessible from this terminal/i);
    // Friendly error, no cluster call, no data leak.
    expect(k8sClient.getPods).not.toHaveBeenCalled();
    expect(res.body.output).not.toContain("pod-in-");
  });

  it("rejects disallowed namespaces for services and deployments too", async () => {
    for (const cmd of [
      "kubectl get svc -n argocd",
      "kubectl get deploy -n default",
    ]) {
      const res = await exec(cmd);
      expect(res.body.type).toBe("error");
      expect(res.body.output).toMatch(/not accessible from this terminal/i);
    }
    expect(k8sClient.getServices).not.toHaveBeenCalled();
    expect(k8sClient.getDeployments).not.toHaveBeenCalled();
  });

  it("filters `kubectl get namespaces` output to the allowlist", async () => {
    const res = await exec("kubectl get namespaces");
    expect(res.body.type).toBe("success");
    expect(res.body.output).toContain("web-development");
    expect(res.body.output).toContain("monitoring");
    expect(res.body.output).not.toContain("kube-system");
    expect(res.body.output).not.toContain("argocd");
    expect(res.body.output).not.toContain("default");
  });

  it("respects a custom TERMINAL_NAMESPACE_ALLOWLIST env", async () => {
    vi.stubEnv("TERMINAL_NAMESPACE_ALLOWLIST", "web-development");
    const rejected = await exec("kubectl get pods -n monitoring");
    expect(rejected.body.type).toBe("error");
    expect(rejected.body.output).toMatch(/not accessible/i);

    const nsList = await exec("kubectl get ns");
    expect(nsList.body.output).toContain("web-development");
    expect(nsList.body.output).not.toContain("monitoring");
  });
});

describe("terminal nodes output (recon reduction)", () => {
  it("still serves `kubectl get nodes`", async () => {
    const res = await exec("kubectl get nodes");
    expect(res.body.type).toBe("success");
    expect(res.body.output).toContain("k3s-master-01");
    expect(res.body.output).toContain("Ready");
  });

  it("does not expose kubelet version or OS image columns", async () => {
    const res = await exec("kubectl get nodes");
    expect(res.body.output).not.toContain("VERSION");
    expect(res.body.output).not.toContain("v1.28.4");
    expect(res.body.output).not.toContain("Debian");
  });
});

describe("existing terminal containment (regression)", () => {
  it("blocks mutating/exec verbs", async () => {
    for (const cmd of [
      "kubectl delete pods",
      "kubectl exec pod-x",
      "kubectl apply -f x.yaml",
    ]) {
      const res = await exec(cmd);
      expect(res.body.type).toBe("error");
      expect(res.body.output).toMatch(/not allowed|only 'kubectl get'/i);
    }
  });

  it("denies secrets and other sensitive resources", async () => {
    const res = await exec("kubectl get secrets");
    expect(res.body.type).toBe("error");
    expect(res.body.output).toMatch(/not accessible/i);
  });

  it("caps command length at 200 characters", async () => {
    const res = await exec(`kubectl get pods ${"x".repeat(300)}`);
    expect(res.body.type).toBe("error");
    expect(res.body.output).toMatch(/too long/i);
  });

  it("rejects non-kubectl commands with command-not-found", async () => {
    const res = await exec("ls -la");
    expect(res.body.type).toBe("error");
    expect(res.body.output).toMatch(/command not found/i);
  });

  it("rejects disallowed flags and positional args", async () => {
    const flagRes = await exec("kubectl get pods -o yaml");
    expect(flagRes.body.type).toBe("error");
    const argRes = await exec("kubectl get pods my-pod");
    expect(argRes.body.type).toBe("error");
  });
});
