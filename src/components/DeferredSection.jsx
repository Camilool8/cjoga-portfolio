import { useEffect, useState } from "react";
import { deferredHeight, scheduleMount } from "../utils/deferredMount";

// Holds a below-the-fold section's prerendered height until the browser
// is idle, then mounts it. See utils/deferredMount.js.
export default function DeferredSection({ id, children }) {
  const [height] = useState(() => deferredHeight(id));
  const [ready, setReady] = useState(height === 0);

  useEffect(() => {
    if (ready) return undefined;
    let live = true;
    scheduleMount(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [ready]);

  if (ready) return children;
  return <section id={id} aria-hidden="true" style={{ height }} />;
}
