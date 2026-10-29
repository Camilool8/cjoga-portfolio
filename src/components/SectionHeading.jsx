import { m } from "framer-motion";
import { itemVariants } from "../hooks/useMotion";

// Two-tone section heading (after Linear): the claim in full ink, the
// continuation in the muted tone, one sentence read as one thought.
function SectionHeading({ id, title, muted, className = "", style }) {
  return (
    <m.h2 id={id} variants={itemVariants} className={`section-heading ${className}`} style={style}>
      {title}
      {muted ? (
        <>
          {" "}
          <span className="section-heading__muted">{muted}</span>
        </>
      ) : null}
    </m.h2>
  );
}

export default SectionHeading;
