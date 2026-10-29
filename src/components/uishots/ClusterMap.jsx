import { m, useReducedMotion } from "framer-motion";

// A redrawn view of the cluster map, in the site's palette. The content
// is real — the platform namespaces and workloads as Headlamp showed them
// on the K3s cluster (2026-10-28) — but the drawing is ours, so it stays
// sharp at any size and never shows a client namespace.
const GROUPS = [
  {
    ns: "envoy-gateway-system",
    items: [
      ["Deployment", "envoy-gateway"],
      ["Deployment", "envoy-eg"],
      ["Deployment", "envoy-eg-internal"],
    ],
  },
  {
    ns: "cert-manager",
    items: [
      ["Deployment", "cert-manager"],
      ["Deployment", "cert-manager-webhook"],
      ["Deployment", "cert-manager-cainjector"],
    ],
  },
  {
    ns: "external-secrets",
    items: [
      ["Deployment", "external-secrets"],
      ["Deployment", "external-secrets-webhook"],
      ["Deployment", "external-secrets-cert-controller"],
    ],
  },
  { ns: "openbao", items: [["StatefulSet", "openbao"]] },
  {
    ns: "kubestronaut-sim",
    items: [
      ["Deployment", "kubestronaut-sim"],
      ["Pod", "sim-session-practical"],
    ],
  },
];

function ClusterMap({ title = "k3s · cluster map", label }) {
  const reduced = useReducedMotion();

  return (
    <figure className="uishot chapter-dark" role="img" aria-label={label}>
      <div className="uishot__frame">
        <div className="uishot__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <b>{title}</b>
        </div>
        <div className="cmap" aria-hidden="true">
          <div className="cmap__toolbar">
            <span className="cmap__chip cmap__chip--on">Namespace</span>
            <span className="cmap__chip">Instance</span>
            <span className="cmap__chip">Node</span>
            <span className="cmap__meta">k3s v1.33 · platform namespaces</span>
          </div>
          <div className="cmap__grid">
            {GROUPS.map((g, gi) => (
              <m.div
                key={g.ns}
                className="cmap__group"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: gi * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="cmap__ns">
                  <span>Namespace</span> {g.ns}
                </p>
                {g.items.map(([kind, name]) => (
                  <div key={name} className="cmap__node">
                    <span className="cmap__ring" />
                    <span className="cmap__text">
                      <small>{kind}</small>
                      {name}
                    </span>
                  </div>
                ))}
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

export default ClusterMap;
