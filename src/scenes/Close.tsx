import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { useL } from "../lib/layout";
import { backOut, easeInOut, expoOut, lerp, map, tw } from "../lib/anim";
import { Bg, Flash, Glow } from "../components/Atmos";
import { Caret, Chars, It, serifStyle, typed } from "../components/Type";
import { Cam } from "../components/Fx";
import { OrvantiaBuilds } from "../components/UI";
import { Arc } from "../components/Motion";
import { arcGeom, arcView, baselineOffset, logoLayout } from "../lib/geo";
import { useFontsReady } from "../lib/measure";
import { MaskLine } from "./ActIII";
import { REPORT } from "../data";

/* ───────────── S21 · Works where you work (0:50–0:54) ───────────── */
const SURFACES = ["a Claude Code plugin", "a Claude skill", "a CLI for any agent"];

export const S21Works: React.FC = () => {
  const f = useCurrentFrame();
  const { H, pick } = useL();
  const second = f >= 128;
  const cmd = second ? typed(f, "/contextbridge:resume", 132, 30) : typed(f, "/contextbridge:checkpoint", 20, 30);
  const enterAt = second ? 184 : 86;
  const press = Math.max(0, 1 - Math.abs(f - enterAt) / 6);
  const res1 = tw(f, 92, 16) * (1 - tw(f, 124, 8));
  const res2 = tw(f, 190, 16);
  const fs = pick(52, 38);
  const flipIdx = f < 104 ? 0 : f < 172 ? 1 : 2;
  const flipAt = [24, 104, 172][flipIdx];
  const flip = tw(f, flipAt, 20, expoOut);
  return (
    <Bg>
      <Glow color="rgba(108,150,255,0.16)" x={0.12} y={0.1} r={0.5} />
      <Glow color="rgba(5,150,105,0.10)" x={0.75} y={0.85} r={0.55} opacity={tw(f, 186, 20)} />
      <Cam z={map(f, 0, 240, 1.0, 1.05)} perspective={1400}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: pick(0.13 * H, 0.17 * H), textAlign: "center", color: C.ink }}>
          <div style={serifStyle(pick(150, 124), { lineHeight: 0.94 })}>
            <MaskLine f={f} at={0}>Works where</MaskLine>
            <MaskLine f={f} at={6}>
              you <It>work.</It>
            </MaskLine>
          </div>
          <div style={{ marginTop: pick(60, 80), fontFamily: F.mono, fontSize: fs, color: C.ink, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ color: C.blue }}>{">"}</span>
            <span>
              {cmd.shown}
              <Caret />
            </span>
            <span style={{ fontSize: fs * 0.5, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${press > 0.1 ? C.ink : "rgba(12,14,19,0.25)"}`, background: press > 0.1 ? C.ink : "transparent", color: press > 0.1 ? C.paper : C.mute, transform: `scale(${1 - press * 0.1})` }}>↵</span>
          </div>
          <div style={{ width: pick(1000, 900), height: 2, background: "rgba(12,14,19,0.16)", marginTop: 16 }} />
          <div style={{ position: "relative", height: 70, width: pick(1000, 900), marginTop: 22, fontFamily: F.sans, fontSize: pick(30, 27), color: C.ink2 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: res1, transform: `translateY(${(1 - tw(f, 92, 18)) * 14}px)` }}>
              <span style={{ width: 32, height: 32, borderRadius: 99, background: C.readyD, color: "#fff", display: "grid", placeItems: "center", fontSize: 18, transform: `scale(${tw(f, 92, 18, backOut(2.4))})` }}>✓</span>
              Checkpoint saved to <span style={{ fontFamily: F.mono, color: C.blue }}>contextbridge/</span>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: res2, transform: `translateY(${(1 - tw(f, 190, 18)) * 14}px)` }}>
              <span style={{ width: 16, height: 16, borderRadius: 99, background: C.readyD, boxShadow: `0 0 0 ${7 + 4 * Math.sin(f / 6)}px rgba(5,150,105,0.16)` }} />
              <b style={{ color: C.readyD, fontWeight: 700 }}>READY</b> · continue the next task
            </div>
          </div>
          {/* where it runs: a flip carousel */}
          <div style={{ marginTop: pick(40, 60), display: "flex", alignItems: "baseline", gap: 18, ...serifStyle(pick(64, 54), { lineHeight: 1.1, letterSpacing: "-0.02em" }), color: C.mute }}>
            <span style={{ opacity: tw(f, 20, 16) }}>as</span>
            <span style={{ display: "inline-block", height: pick(72, 62), overflow: "hidden", perspective: 600, textAlign: "left", minWidth: pick(620, 540) }}>
              <span style={{ display: "block", color: C.ink, transform: `rotateX(${(1 - flip) * -90}deg) translateY(${(1 - flip) * 40}%)`, transformOrigin: "50% 0%", opacity: flip }}>
                <It color={C.ink}>{SURFACES[flipIdx]}</It>
              </span>
            </span>
          </div>
        </AbsoluteFill>
      </Cam>
    </Bg>
  );
};

/* ───────────── S22 · end card: the arc draws, becomes the mark, Orvantia Builds (0:54–0:59) ───────────── */
export const S22End: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  useFontsReady();
  const size = pick(210, 172);
  const baseline = pick(0.47 * H, 0.45 * H);
  const logo = logoLayout(W, H, true, size, baseline);
  const g = pick(arcGeom(0.15 * W, 0.85 * W, 0.66 * H), arcGeom(0.1 * W, 0.9 * W, 0.58 * H));
  const mk = tw(f, 32, 40, easeInOut);
  const view = arcView(g, logo.mark, mk);
  const markScale = (logo.mark.x1 - logo.mark.x0) / 68;
  const off = baselineOffset(size, `400 ${size}px "Instrument Serif"`);
  const inst = typed(f, "pip install contextbridge-cli", 104, 44);
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.14)" x={0.5} y={0.48} r={0.6} />
      <Glow color="rgba(108,150,255,0.16)" x={0.08} y={0.06} r={0.45} />
      <Cam z={map(f, 0, 300, 1.04, 1.0, expoOut)}>
        <Arc
          id="end"
          W={W}
          H={H}
          g={g}
          draw={tw(f, 0, 30, easeInOut)}
          deckDraw={tw(f, 0, 26, easeInOut)}
          nodes={tw(f, 6, 24)}
          hangers={tw(f, 14, 20) * (1 - mk)}
          sw={lerp(18, 4.5 * markScale, mk)}
          deckSw={lerp(11, 4 * markScale, mk)}
          nodeR={lerp(20, 5 * markScale, mk)}
          view={view}
          pulse={f < 34 ? [(f - 4) / 30] : []}
        />
        {f >= 50 && (
          <div style={{ position: "absolute", left: logo.wordX, top: baseline - off, ...serifStyle(size, { lineHeight: 1, letterSpacing: "-0.045em", whiteSpace: "nowrap", color: C.ink }) }}>
            <Chars text="Context" at={52} stagger={2.2} dur={40} blur={16} rise={0.35} />
            <Chars text="Bridge" at={52 + 7 * 2.2} stagger={2.2} dur={40} blur={16} rise={0.35} style={{ fontStyle: "italic", color: C.signal }} />
          </div>
        )}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: baseline + pick(48, 50), textAlign: "center", color: C.ink }}>
          <div style={serifStyle(pick(68, 64), { lineHeight: 1.04, letterSpacing: "-0.03em" })}>
            <MaskLine f={f} at={82}>Preserve the state of the work.</MaskLine>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: pick(28, 28), color: C.mute, marginTop: 12, opacity: tw(f, 94, 24), transform: `translateY(${(1 - tw(f, 94, 24)) * 12}px)` }}>Not just the story of the conversation.</div>
          <div style={{ marginTop: pick(40, 54), fontFamily: F.mono, fontSize: pick(32, 30), color: C.ink, opacity: inst.started ? 1 : 0 }}>
            <span style={{ color: C.signal }}>$ </span>
            {inst.shown}
            <Caret on={f < 220} />
          </div>
          <div style={{ marginTop: 14, fontFamily: F.mono, fontSize: pick(22, 21), color: C.mute, opacity: tw(f, 140, 24) }}>github.com/Abhinay2206/ContextBridge</div>
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: pick(0.08 * H, 0.08 * H) }}>
          <OrvantiaBuilds at={120} size={pick(70, 74)} dark={false} />
          <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.26em", textTransform: "uppercase", color: C.mute, marginTop: 18, opacity: tw(f, 146, 30) }}>
            Open source · MIT license · v{REPORT.version}
          </div>
        </AbsoluteFill>
      </Cam>
      <Flash amount={map(f, 0, 18, 0.7, 0)} color="#ffffff" />
    </Bg>
  );
};
