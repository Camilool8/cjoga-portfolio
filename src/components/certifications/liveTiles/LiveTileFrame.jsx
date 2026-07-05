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
      className="relative w-full mb-4 rounded-xl overflow-hidden"
      style={{
        height: "140px",
        background: `radial-gradient(ellipse at center, ${brandColor}14 0%, transparent 70%)`,
        border: `1px solid ${brandColor}1a`,
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
