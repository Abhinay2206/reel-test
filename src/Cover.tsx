import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "./theme";
import { useL } from "./lib/layout";
import { Bg, Glow, Grain, Vignette } from "./components/Atmos";
import { Arc } from "./components/Motion";
import { OrvantiaBuilds } from "./components/UI";
import { It, serifStyle } from "./components/Type";
import { arcGeom } from "./lib/geo";

/** Cover frame. In 9:16 everything that matters sits inside the central 4:5 band, so the
 *  Instagram profile grid (which crops covers to 3:4 / 4:5) never cuts into the text. */
export const Cover: React.FC = () => {
  const { W, H, portrait, pick } = useL();
  const g = portrait ? arcGeom(0.1 * W, 0.9 * W, 0.725 * H) : arcGeom(0.52 * W, 0.92 * W, 0.7 * H);
  const size = pick(200, 176);
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.16)" x={portrait ? 0.5 : 0.75} y={0.6} r={0.65} />
      <Glow color="rgba(108,150,255,0.2)" x={0.08} y={0.06} r={0.5} />
      <Arc id="cover" W={W} H={H} g={g} sw={pick(20, 20)} deckSw={pick(12, 12)} nodeR={pick(22, 22)} hangers={1} />
      <div style={{ position: "absolute", left: pick(120, 90), top: pick(0.2 * H, 0.235 * H), color: C.ink }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.3em", color: C.mute, textTransform: "uppercase", marginBottom: 34 }}>
          <span style={{ color: C.signal }}>●</span>&nbsp;&nbsp;Open source · MIT
        </div>
        <div style={serifStyle(size, { lineHeight: 0.9, letterSpacing: "-0.045em" })}>
          <div>Context</div>
          <div>
            <It>outlives</It>
          </div>
          <div>the session.</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: pick(0.09 * H, 0.2 * H), display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: portrait ? "center" : "flex-start", paddingLeft: portrait ? 0 : 120, gap: 22 }}>
        <OrvantiaBuilds at={-60} size={pick(54, 62)} dark={false} />
      </div>
      <AbsoluteFill style={{ pointerEvents: "none" }} />
      <Vignette />
      <Grain opacity={0.12} />
    </Bg>
  );
};
