import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { backOut, ease, tw } from "../lib/anim";

/** "Orvantia Builds" credit: the Orvantia mark with the site's violet-to-orange gradient wordmark. */
export const OrvantiaBuilds: React.FC<{ at: number; size?: number; dark?: boolean; stacked?: boolean }> = ({ at, size = 64, dark = true, stacked }) => {
  const frame = useCurrentFrame();
  const p = tw(frame, at, 50, ease);
  const logo = tw(frame, at, 40, backOut(1.6));
  return (
    <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", alignItems: "center", gap: size * 0.34, opacity: Math.min(1, p * 1.4) }}>
      <Img
        src={staticFile("img/orvantia.webp")}
        style={{ height: size * 1.08, width: "auto", display: "block", transform: `scale(${0.6 + 0.4 * logo}) rotate(${(1 - logo) * -14}deg)`, filter: `drop-shadow(0 10px 30px rgba(139,92,246,${dark ? 0.45 : 0.25}))` }}
      />
      <div
        style={{
          fontFamily: F.serif,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          backgroundImage: `linear-gradient(92deg, ${C.orvA}, ${C.orvB} 60%, ${C.orvC})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          transform: `translateY(${(1 - p) * 20}px)`,
          paddingBottom: size * 0.08,
        }}
      >
        Orvantia <span style={{ fontStyle: "italic" }}>Builds</span>
      </div>
    </div>
  );
};
