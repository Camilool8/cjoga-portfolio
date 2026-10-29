import { useRef } from "react";
import { useInView } from "framer-motion";
import AWSRegionsLive from "./AWSRegionsLive";
import TerraformGraphLive from "./TerraformGraphLive";
import DynatraceWaveformLive from "./DynatraceWaveformLive";
import AwardSparkleLive from "./AwardSparkleLive";
import RedHatRadarLive from "./RedHatRadarLive";
import GitLabPipelineLive from "./GitLabPipelineLive";
import KubestronautRingLive from "./KubestronautRingLive";

// Mounts the heavy live-tile SVG only when the frame is on screen.
// Every live tile (AWS, KCNA, Terraform, GitLab, etc.) ran multiple
// `repeat: Infinity` framer-motion animations forever once mounted,
// so seven tiles compounded into constant GPU/main-thread work even
// while scrolled out of view. Gating on intersection cuts that to zero
// past the section, which was the bulk of the mobile slowdown near the
// Handbook section that sits just after this one.
function LiveTileFrame({ brandColor, liveTile, progress, rawColor }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "120px 0px" });

  return (
    <div
      ref={ref}
      // A dark "screen" in both themes: the tiles mimic vendor consoles,
      // and their glows read as smudges on a light card.
      className="chapter-dark relative w-full mb-4 rounded-xl overflow-hidden"
      style={{
        height: "140px",
        // color-mix rather than hex+alpha: groups without a brand colour
        // pass a CSS variable, and "var(--accent)1f" is invalid CSS that
        // drops the whole background.
        background: `radial-gradient(ellipse at center, color-mix(in srgb, ${brandColor} 12%, transparent) 0%, transparent 70%), var(--bg-void)`,
        border: `1px solid color-mix(in srgb, ${brandColor} 15%, transparent)`,
      }}
    >
      {inView && liveTile === "aws" && <AWSRegionsLive color={brandColor} />}
      {inView && liveTile === "kubestronaut" && (
        <KubestronautRingLive
          color={brandColor}
          current={progress?.current}
          inProgress={progress?.inProgress}
          total={progress?.total}
        />
      )}
      {inView && liveTile === "terraform" && (
        <TerraformGraphLive color={brandColor} />
      )}
      {inView && liveTile === "dynatrace" && (
        <DynatraceWaveformLive color={brandColor} />
      )}
      {inView && liveTile === "award" && <AwardSparkleLive color={rawColor} />}
      {inView && liveTile === "redhat" && <RedHatRadarLive color={brandColor} />}
      {inView && liveTile === "gitlab" && (
        <GitLabPipelineLive color={brandColor} />
      )}
    </div>
  );
}

export default LiveTileFrame;
