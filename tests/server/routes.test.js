import request from "supertest";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
} from "vitest";

// Never touch a kubeconfig or a live cluster from these tests.
vi.mock("../../server/services/k8sClient.js", () => ({
  getPods: vi.fn(async () => []),
  getDeployments: vi.fn(async () => []),
  getServices: vi.fn(async () => []),
  getNodes: vi.fn(async () => []),
  getNamespaces: vi.fn(async () => []),
}));

describe("route handling (dev mode)", () => {
  let app;

  beforeAll(async () => {
    vi.resetModules();
    app = (await import("../../server/index.js")).default;
  });

  it("exports the app without starting a listener", () => {
    expect(app).toBeTypeOf("function");
  });

  it.each(["/", "/terminal", "/es", "/es/terminal"])(
    "serves the SPA at %s",
    async (route) => {
      const res = await request(app).get(route);
      if (res.status === 301) {
        // When a prerendered dist/<route>/index.html exists, express.static
        // canonically redirects the bare path to its trailing-slash form.
        expect(res.headers.location).toBe(`${route}/`);
        const followed = await request(app).get(res.headers.location);
        expect(followed.status).toBe(200);
        expect(followed.headers["content-type"]).toMatch(/html/);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/html/);
    }
  );

  it("returns 404 for unknown paths instead of a soft-200", async () => {
    for (const route of ["/bogus", "/wp-admin", "/some/deep/path"]) {
      const res = await request(app).get(route);
      expect(res.status, `expected 404 for ${route}`).toBe(404);
    }
  });

  it("returns a JSON 404 for unknown API paths", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("still serves real static files (robots.txt)", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.status).toBe(200);
    expect(res.text).toContain("User-agent");
  });

  it("serves /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("HTTP hardening (production mode)", () => {
  let app;

  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    app = (await import("../../server/index.js")).default;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("sends a CSP without unsafe-eval (keeps unsafe-inline)", async () => {
    const res = await request(app).get("/");
    const csp = res.headers["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toMatch(/script-src [^;]*'unsafe-inline'/);
  });

  it("serves hashed assets with a 1y immutable cache", async () => {
    // Any fingerprinted asset from the built bundle will do.
    const index = await request(app).get("/");
    const match = index.text.match(/\/assets\/[^"']+\.js/);
    expect(match).toBeTruthy();
    const res = await request(app).get(match[0]);
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("immutable");
    expect(res.headers["cache-control"]).toContain("max-age=31536000");
  });

  it("serves index.html with no-cache", async () => {
    const res = await request(app).get("/");
    expect(res.headers["cache-control"]).toContain("no-cache");
  });

  it("exempts GET /api/health from rate limiting", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.headers["ratelimit-limit"]).toBeUndefined();
    expect(res.headers["ratelimit-remaining"]).toBeUndefined();
  });

  it("rate-limits other /api routes", async () => {
    const res = await request(app)
      .post("/api/terminal/execute")
      .set("CF-Connecting-IP", "203.0.113.50")
      .send({ command: "help" });
    expect(res.headers["ratelimit-limit"]).toBeDefined();
  });

  it("keys the terminal limiter on CF-Connecting-IP", async () => {
    const fire = (ip) =>
      request(app)
        .post("/api/terminal/execute")
        .set("CF-Connecting-IP", ip)
        .send({ command: "help" });

    let lastStatus = 200;
    for (let i = 0; i < 31; i++) {
      const res = await fire("203.0.113.7");
      lastStatus = res.status;
    }
    // 31st request from the same CF IP is over the 30/min terminal budget.
    expect(lastStatus).toBe(429);

    // A different CF client IP gets its own bucket.
    const other = await fire("203.0.113.8");
    expect(other.status).toBe(200);
  });
});
