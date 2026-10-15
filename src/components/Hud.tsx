import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { tw } from "../lib/anim";
import { useL } from "../lib/layout";
import TL from "../timeline.json";

/** A quiet viewfinder frame: crop marks, chapter label and timecode. It ties the cut together as a film. */
const CHAPTERS: [number, string][] = [
  [TL.scenes.terminal[0], "01  The problem"],
  [TL.scenes.bridge[0], "02  The bridge"],
  [TL.scenes.how[0], "03  How it works"],
  [TL.scenes.reality[0], "04  The gate"],
  [TL.scenes.provenance[0], "05  Provenance"],
  [TL.scenes.benchTitle[0], "06  Benchmarks"],
  [TL.scenes.works[0], "07  Get started"],
];

export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, portrait } = useL();
  const endAt = TL.scenes.end[0];
  const vis = tw(f, 24, 30) * (1 - tw(f, endAt - 10, 20));
  // In 9:16 the corners and labels sit under Instagram's own UI, so the frame is landscape-only.
  if (vis <= 0.001 || portrait) return null;
  const m = portrait ? 44 : 40;
  const len = 26;
  const chapter = [...CHAPTERS].reverse().find(([at]) => f >= at)!;
  const chapterAge = f - chapter[0];
  const secs = f / 60;
  const tc = `00:${String(Math.floor(secs)).padStart(2, "0")}:${String(Math.floor((secs % 1) * 60)).padStart(2, "0")}`;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <div style={{ position: "absolute", left: x, top: y, width: len, height: len, borderLeft: sx > 0 ? `1.5px solid ${C.ink}` : undefined, borderRight: sx < 0 ? `1.5px solid ${C.ink}` : undefined, borderTop: sy > 0 ? `1.5px solid ${C.ink}` : undefined, borderBottom: sy < 0 ? `1.5px solid ${C.ink}` : undefined, opacity: 0.4 }} />
  );
  const label: React.CSSProperties = { position: "absolute", fontFamily: F.mono, fontSize: portrait ? 15 : 14, letterSpacing: "0.2em", textTransform: "uppercase", color: C.ink, opacity: 0.55, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ opacity: vis, pointerEvents: "none" }}>
      {corner(m, m, 1, 1)}
      {corner(W - m - len, m, -1, 1)}
      {corner(m, H - m - len, 1, -1)}
      {corner(W - m - len, H - m - len, -1, -1)}
      <div style={{ ...label, left: m + len + 14, top: m - 6 }}>ContextBridge</div>
      <div style={{ ...label, right: m + len + 14, top: m - 6 }}>v0.3.3 · MIT</div>
      <div style={{ ...label, left: m + len + 14, bottom: m - 6, overflow: "hidden" }}>
        <span style={{ display: "inline-block", transform: `translateY(${(1 - tw(chapterAge, 0, 24)) * 110}%)` }}>{chapter[1]}</span>
      </div>
      <div style={{ ...label, right: m + len + 14, bottom: m - 6, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: C.signal, marginRight: 10, opacity: Math.floor(f / 30) % 2 ? 1 : 0.25 }} />
        {tc}
      </div>
    </AbsoluteFill>
  );
};
