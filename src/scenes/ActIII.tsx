import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, F, VERDICT, Verdict } from "../theme";
import { useL } from "../lib/layout";
import { backOut, easeIn, easeInOut, expoOut, hash, lerp, map, shake, tw } from "../lib/anim";
import { Bg, Flash, Glow } from "../components/Atmos";
import { Caret, It, serifStyle, typed } from "../components/Type";
import { Cam } from "../components/Fx";
import { Arc, Hazard, Reel, Sparks, Strike } from "../components/Motion";
import { arcGeom } from "../lib/geo";

const HEX = "0123456789abcdef";
const randHex = (seed: number, n: number) => Array.from({ length: n }, (_, i) => HEX[Math.floor(hash(seed * 31 + i * 7) * 16)]).join("");

export const MaskLine: React.FC<{ f: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, at, children, style }) => {
  const p = tw(f, at, 24, expoOut);
  return (
    <div style={{ overflow: "hidden", padding: "0.05em 0.06em 0.16em", margin: "-0.05em -0.06em -0.16em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

/* ───────────── S8 · Before any edit, it checks reality: reels lock checkpoint against workspace (0:20–0:22) ───────────── */
const ROWS: [string, string, number][] = [
  ["branch", "main", 30],
  ["HEAD", "580df56", 42],
  ["src/auth.py", "9f2c41e", 54],
  ["evidence", "E1 PASSED", 66],
];

export const S8Reality: React.FC = () => {
  const f = useCurrentFrame();
  const { H, pick } = useL();
  const val = pick(44, 36);
  const colW = pick(420, 380);
  return (
    <Bg>
      <Glow color="rgba(58,91,255,0.12)" x={0.5} y={0.62} r={0.6} />
      <Cam z={map(f, 0, 120, 1, 1.05)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.1 * H, 0.12 * H), textAlign: "center", color: C.ink, ...serifStyle(pick(124, 108), { lineHeight: 0.95 }) }}>
          <MaskLine f={f} at={0}>Before any edit,</MaskLine>
          <MaskLine f={f} at={6}>
            it <It>checks reality.</It>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: "50%", top: pick(0.44 * H, 0.38 * H), transform: "translateX(-50%)", width: colW * 2 + 140 }}>
          <div style={{ display: "grid", gridTemplateColumns: `${colW}px 140px ${colW}px`, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.3em", color: C.mute, marginBottom: 14, opacity: tw(f, 8, 16) }}>
            <span style={{ textAlign: "right" }}>CHECKPOINT</span>
            <span />
            <span>WORKSPACE</span>
          </div>
          {ROWS.map(([k, v, lockAt], i) => {
            const p = tw(f, 10 + i * 4, 18);
            const locked = f >= lockAt;
            const snap = tw(f, lockAt, 14, expoOut);
            const spin = randHex(Math.floor(f / 2) + i * 101, v.length);
            const eqPop = tw(f, lockAt, 16, backOut(3));
            return (
              <div key={k} style={{ opacity: p, padding: `${pick(14, 18)}px 0`, borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.18em", color: C.mute, textTransform: "uppercase", textAlign: "center", marginBottom: 4 }}>{k}</div>
                <div style={{ display: "grid", gridTemplateColumns: `${colW}px 140px ${colW}px`, alignItems: "center", fontFamily: F.mono, fontSize: val }}>
                  <span style={{ textAlign: "right", color: C.ink }}>{v}</span>
                  <span style={{ textAlign: "center", color: locked ? C.readyD : "rgba(12,14,19,0.25)", transform: `scale(${locked ? 0.7 + 0.3 * eqPop : 1})`, fontWeight: 700 }}>{locked ? "=" : "≟"}</span>
                  <span style={{ overflow: "hidden", height: val * 1.3, display: "block", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 0, color: locked ? C.ink : "rgba(12,14,19,0.45)", transform: `translateY(${locked ? (1 - snap) * -60 : Math.sin(f * 1.7 + i) * 8}%)`, filter: locked ? undefined : "blur(1.6px)", whiteSpace: "nowrap" }}>
                      {locked ? v : spin}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: 26, fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: "0.5em", color: C.readyD, opacity: tw(f, 76, 10), transform: `scale(${0.9 + 0.1 * tw(f, 76, 18, backOut(2))})` }}>
            NO DRIFT
          </div>
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S9 · READY / REVIEW_REQUIRED / BLOCKED under the arc (0:22–0:26) ───────────── */
type V = { v: Verdict; from: number; to: number; note: string; lines: string[] };
const VS: V[] = [
  { v: "READY", from: 0, to: 90, note: "Continue the next task.", lines: ["READY"] },
  { v: "REVIEW_REQUIRED", from: 90, to: 180, note: "Inspect before you edit.", lines: ["REVIEW_", "REQUIRED"] },
  { v: "BLOCKED", from: 180, to: 240, note: "No resume prompt. No blind edits.", lines: ["BLOCKED"] },
];
const LOG: Record<Verdict, string> = {
  READY: "No drift: workspace matches the checkpoint.",
  REVIEW_REQUIRED: "[WARN ] src/auth.py: new uncommitted change",
  BLOCKED: "[BLOCK] branch changed: main -> experiment",
};
const band = (f: number, a: number, b: number) => Math.min(tw(f, a, 10, expoOut), 1 - tw(f, b - 12, 12, easeIn));

export const S9Verdicts: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, portrait } = useL();
  const vi = f < 90 ? 0 : f < 180 ? 1 : 2;
  const cur = VS[vi];
  const g = portrait ? arcGeom(0.07 * W, 0.93 * W, 0.66 * H) : arcGeom(0.12 * W, 0.88 * W, 0.87 * H);
  const col = interpolateColors(f, [0, 86, 94, 176, 184], [C.readyD, C.readyD, C.reviewD, C.reviewD, C.blockedD]);
  const glow = interpolateColors(f, [0, 86, 94, 176, 184], ["rgba(5,150,105,0.18)", "rgba(5,150,105,0.18)", "rgba(217,119,6,0.18)", "rgba(217,119,6,0.18)", "rgba(225,29,72,0.2)"]);
  const brk = tw(f, 180, 24, backOut(1.1));
  const [sx, sy] = shake(f, 180, 22, 30, 5);
  const big = pick(300, 210);
  const midX = (g.x0 + g.x1) / 2;
  const wordCenterY = g.deckY - (g.deckY - g.apexY) * (portrait ? 0.42 : 0.44);
  const c = typed(f, "contextbridge resume --check", 0, 70);
  return (
    <Bg>
      <Glow color={glow} x={0.5} y={portrait ? 0.6 : 0.78} r={0.7} />
      <Cam x={sx} y={sy} z={map(f, 0, 240, 1, 1.04)}>
        <Hazard W={W} y={wordCenterY + pick(150, 110)} h={pick(64, 50)} p={band(f, 92, 176)} shift={f * 6} angle={-4} />
        <Hazard W={W} y={g.apexY - pick(40, 30)} h={pick(40, 34)} p={band(f, 96, 176)} shift={-f * 5} angle={3} />
        <Arc
          id="verdict"
          W={W}
          H={H}
          g={g}
          draw={tw(f, 0, 24, easeInOut)}
          deckDraw={tw(f, 0, 20, easeInOut)}
          nodes={tw(f, 4, 16)}
          hangers={tw(f, 10, 30)}
          arch={col}
          sw={pick(18, 16)}
          deckSw={pick(11, 10)}
          nodeR={pick(20, 18)}
          flicker={vi === 1 ? tw(f, 90, 10) : 0}
          breakAmt={brk}
          pulse={vi === 0 ? [(f - 18) / 50, (f - 52) / 50] : []}
          pulseColor={C.readyD}
        />
        {f >= 180 && <Sparks x={midX} y={g.apexY} at={182} color={C.blockedD} n={56} power={pick(1, 0.8)} />}
        {f >= 180 && f < 210 && (
          <div style={{ position: "absolute", left: midX, top: g.apexY, width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: 99, border: `4px solid ${C.blockedD}`, transform: `scale(${1 + tw(f, 180, 30, expoOut) * 7})`, opacity: 1 - tw(f, 180, 30) }} />
        )}
        {/* the verdict word, framed by the arch */}
        {VS.map((x, i) => {
          if (f < x.from || f > x.to + 14) return null;
          const out = i < 2 ? tw(f, x.to, 14, easeIn) : 0;
          const size = x.lines.length > 1 ? big * 0.66 : big;
          const slam = x.v === "BLOCKED" ? tw(f, x.from, 16, expoOut) : 1;
          return (
            <div
              key={x.v}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: wordCenterY - (size * 0.95 * x.lines.length) / 2,
                textAlign: "center",
                ...serifStyle(size, { lineHeight: 0.95, letterSpacing: "-0.03em", color: VERDICT[x.v].onPaper, textShadow: "0 0 28px rgba(236,232,223,0.95), 0 0 6px rgba(236,232,223,0.9)" }),
                opacity: 1 - out,
                transform: `translateY(${-out * 40}px) scale(${1.5 - 0.5 * slam})`,
                filter: slam < 0.97 ? `blur(${(1 - slam) * 12}px)` : undefined,
              }}
            >
              {x.lines.map((ln, li) => (
                <div key={ln} style={{ overflow: "hidden", padding: "0.04em 0.05em 0.12em", margin: "-0.04em -0.05em -0.12em", whiteSpace: "nowrap" }}>
                  {x.v === "BLOCKED"
                    ? ln
                    : Array.from(ln).map((ch, ci) => {
                        const at = x.from + ci * 2 + li * 6;
                        const p = tw(f, at, 22, expoOut);
                        const scr = x.v === "REVIEW_REQUIRED" && f < at + 10 && ch !== "_";
                        return (
                          <span key={ci} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)` }}>
                            {scr ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(hash(ci * 13 + Math.floor(f / 2)) * 26)] : ch}
                          </span>
                        );
                      })}
                </div>
              ))}
            </div>
          );
        })}
        {/* header: command, note, exit code */}
        <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.1 * H, 0.14 * H), textAlign: "center" }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.ink }}>
            <span style={{ color: C.signal }}>$ </span>
            {c.shown}
            {!c.done && <Caret />}
          </div>
          <div key={cur.v} style={{ marginTop: pick(22, 30), display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: tw(f, cur.from + 8, 12) }}>
            <span style={{ fontFamily: F.mono, fontSize: 22, padding: "6px 14px", border: `2px solid ${col}`, borderRadius: 10, color: col }}>exit {VERDICT[cur.v].exit}</span>
            <span style={serifStyle(pick(54, 46), { fontStyle: "italic", color: C.ink, letterSpacing: "-0.02em", lineHeight: 1 })}>{cur.note}</span>
          </div>
          <div style={{ marginTop: 18, fontFamily: F.mono, fontSize: pick(20, 18), color: col, opacity: tw(f, cur.from + 14, 12) }}>{LOG[cur.v]}</div>
        </div>
      </Cam>
      <Flash amount={f >= 180 ? Math.max(0, 1 - (f - 180) / 10) * 0.35 : 0} color={C.blockedD} />
    </Bg>
  );
};

/* ───────────── S10 · One verdict: a slot reel spins up with the riser (0:26–0:28) ───────────── */
export const S10OneVerdict: React.FC = () => {
  const f = useCurrentFrame();
  const { W, pick } = useL();
  const itemH = pick(200, 170);
  const t = f / 60;
  const pos = 0.6 * t + 2.4 * t * t * t;
  const vel = (0.6 + 7.2 * t * t) / 60;
  const items = (["READY", "REVIEW_REQUIRED", "BLOCKED"] as Verdict[]).map((v) => (
    <span key={v} style={serifStyle(pick(v === "REVIEW_REQUIRED" ? 140 : 170, v === "REVIEW_REQUIRED" ? 104 : 150), { color: VERDICT[v].onPaper, letterSpacing: "-0.03em", whiteSpace: "nowrap" })}>
      {v}
    </span>
  ));
  const push = tw(f, 40, 80, easeIn);
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.12)" x={0.5} y={0.5} r={0.6} opacity={0.5 + push} />
      <Cam z={1 + push * 0.2} style={{ filter: f > 108 ? `blur(${map(f, 108, 120, 0, 8)}px)` : undefined }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.ink }}>
          <div style={serifStyle(pick(120, 100), { lineHeight: 1 })}>
            <MaskLine f={f} at={0}>One verdict,</MaskLine>
          </div>
          <div style={{ margin: `${pick(24, 30)}px 0`, borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, opacity: tw(f, 6, 14) }}>
            <Reel items={items} itemH={itemH} pos={pos} width={W} blur={vel * itemH * 0.5} />
          </div>
          <div style={serifStyle(pick(120, 100), { lineHeight: 1 })}>
            <MaskLine f={f} at={8}>
              before a single line <It>changes.</It>
            </MaskLine>
          </div>
          <div style={{ marginTop: 34, fontFamily: F.mono, fontSize: pick(24, 22), letterSpacing: "0.2em", color: C.mute, opacity: tw(f, 24, 16) }}>
            exit <span style={{ color: C.readyD }}>0</span> · exit <span style={{ color: C.reviewD }}>1</span> · exit <span style={{ color: C.blockedD }}>2</span> · --json
          </div>
        </AbsoluteFill>
      </Cam>
      <Flash amount={map(f, 110, 120, 0, 0.92, easeIn)} color="#ffffff" />
    </Bg>
  );
};

/* ───────────── S11 · a giant stamp: knows what is proven and what is only claimed (0:28–0:31.5) ───────────── */
const StampBox: React.FC<{ text: string; color: string; size: number; dashed?: boolean; style?: React.CSSProperties }> = ({ text, color, size, dashed, style }) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: F.mono,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "0.12em",
      color,
      border: `${size * 0.075}px ${dashed ? "dashed" : "solid"} ${color}`,
      borderRadius: size * 0.22,
      padding: `${size * 0.16}px ${size * 0.4}px`,
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </div>
);

export const S11Provenance: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  const slam = tw(f, 0, 20, backOut(1.6));
  const settle = tw(f, 24, 32, easeInOut);
  const [sx, sy] = shake(f, 6, 26, 26, 2);
  const [sx2, sy2] = shake(f, 66, 10, 16, 4);
  const stampSize = pick(200, 132);
  const item1Y = pick(0.44 * H, 0.42 * H), item2Y = pick(0.68 * H, 0.66 * H);
  const left = pick(150, 80);
  // stamp 1 travels from the centre of the frame to beside (16:9) or under (9:16) the first item
  const s1x = lerp(W / 2, pick(W * 0.76, W * 0.66), settle), s1y = lerp(H / 2, pick(item1Y + 40, item1Y + 200), settle);
  const s1s = lerp(1, pick(0.36, 0.42), settle) * (2.4 - 1.4 * slam);
  const strike = tw(f, 184, 16, easeInOut);
  const itemP = (at: number) => tw(f, at, 26, expoOut);
  return (
    <Bg>
      <Glow color="rgba(5,150,105,0.14)" x={0.7} y={0.4} r={0.6} opacity={1 - settle * 0.5} />
      <Cam x={sx + sx2} y={sy + sy2} z={map(f, 0, 210, 1.02, 1)}>
        <div style={{ position: "absolute", left, right: left, top: 0.1 * H, color: C.ink, ...serifStyle(pick(96, 84), { lineHeight: 1.0 }) }}>
          <MaskLine f={f} at={74}>
            Knows what is <It>proven.</It>
          </MaskLine>
          <MaskLine f={f} at={82}>
            And what is only{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              <It>claimed.</It>
              {strike > 0 && <Strike p={strike} thickness={pick(10, 8)} />}
            </span>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left, top: item1Y, opacity: itemP(30), transform: `translateY(${(1 - itemP(30)) * 40}px)` }}>
          <div style={serifStyle(pick(104, 86), { color: C.ink, letterSpacing: "-0.03em" })}>Login endpoint</div>
          <div style={{ fontFamily: F.mono, fontSize: pick(22, 20), color: C.readyD, marginTop: 14 }}>E1 PASSED · exit 0 · fingerprint matches</div>
        </div>
        <div style={{ position: "absolute", left, top: item2Y, opacity: itemP(56), transform: `translateY(${(1 - itemP(56)) * 40}px)` }}>
          <div style={serifStyle(pick(104, 86), { color: "rgba(12,14,19,0.42)", letterSpacing: "-0.03em" })}>Refresh-token tests</div>
          <div style={{ fontFamily: F.mono, fontSize: pick(22, 20), color: C.mute, marginTop: 14 }}>claimed by claude-account-a · no evidence</div>
        </div>
        <div style={{ position: "absolute", left: s1x, top: s1y, transform: `translate(-50%, -50%) rotate(${lerp(-14, -7, slam)}deg) scale(${s1s})`, opacity: tw(f, 0, 4) }}>
          <StampBox text="VERIFIED" color={C.readyD} size={stampSize} style={{ background: "rgba(236,232,223,0.6)" }} />
        </div>
        {f >= 62 && (
          <div style={{ position: "absolute", left: pick(W * 0.76, W * 0.66), top: pick(item2Y + 40, item2Y + 200), transform: `translate(-50%, -50%) rotate(-6deg) scale(${pick(0.36, 0.42) * (2.2 - 1.2 * tw(f, 62, 18, backOut(1.6)))})`, opacity: tw(f, 62, 4) }}>
            <StampBox text="UNVERIFIED" color={C.mute} size={stampSize} dashed />
          </div>
        )}
      </Cam>
      <Flash amount={map(f, 0, 14, 0.8, 0)} color="#ffffff" />
    </Bg>
  );
};
