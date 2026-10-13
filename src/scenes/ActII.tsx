import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { useL } from "../lib/layout";
import { backOut, easeInOut, expoOut, hash, lerp, map, tw } from "../lib/anim";
import { Bg, Flash, Glow } from "../components/Atmos";
import { Caret, Chars, It, serifStyle, typed } from "../components/Type";
import { BlurX, Cam } from "../components/Fx";
import { Arc, Shutter, SplitFlap, arcLength } from "../components/Motion";
import { arcView, baselineOffset, heroArc, logoLayout, shouldnt } from "../lib/geo";
import { useFontsReady } from "../lib/measure";

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";
/** Text that resolves from random glyphs, left to right. */
export const Scramble: React.FC<{ text: string; at: number; speed?: number; style?: React.CSSProperties }> = ({ text, at, speed = 1.6, style }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {Array.from(text).map((ch, i) => {
        const settle = at + i * speed + 8;
        if (f < at + i * speed * 0.5) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
        if (f >= settle || ch === " " || ch === "·") return <span key={i}>{ch}</span>;
        return (
          <span key={i} style={{ opacity: 0.6 }}>
            {SCRAMBLE[Math.floor(hash(i * 97 + Math.floor(f / 2) * 13) * SCRAMBLE.length)]}
          </span>
        );
      })}
    </span>
  );
};

const STREAM = ["state.json", "E1 PASSED", "HEAD 580df56", "HANDOFF.md"];

/* ───────────── S5 · the dot becomes a bridge, the bridge becomes the logo (0:08–0:12) ───────────── */
export const S5Bridge: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, portrait, pick } = useL();
  useFontsReady();
  const sh = shouldnt(W, H, portrait);
  const g = heroArc(W, H, portrait);
  const size = pick(210, 150);
  const baseline = 0.46 * H;
  const logo = logoLayout(W, H, portrait, size, baseline);

  const dk = tw(f, 0, 22, easeInOut);
  const dotR = lerp(sh.r * sh.zoom, 18, dk);
  const dotX = lerp(sh.dotX, g.x0, dk), dotY = lerp(sh.dotY, g.deckY, dk);
  const popB = tw(f, 46, 18, backOut(2.6));
  const mk = tw(f, 118, 42, easeInOut);
  const view = arcView(g, logo.mark, mk);
  const markScale = (logo.mark.x1 - logo.mark.x0) / 68;
  const wordsOut = 1 - tw(f, 108, 12);
  const labels = tw(f, 26, 24) * (1 - tw(f, 108, 12));
  const arrived = f >= 104;
  const off = baselineOffset(size, `400 ${size}px "Instrument Serif"`);
  const tag = pick(74, 60);
  // context streams along the arch at a constant speed, each word spaced by its own length
  const wordSize = pick(30, 24);
  const len = arcLength(g);
  const speed = pick(34, 22);
  let t0 = 38;
  const words = STREAM.map((text) => {
    const start = t0;
    t0 += (text.length * 0.6 * wordSize + 90) / speed;
    return { text, at: ((f - start) * speed) / len };
  });
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.12)" x={0.5} y={0.74} r={0.65} />
      <Glow color="rgba(108,150,255,0.18)" x={0.08} y={0.06} r={0.45} />
      <Cam z={map(f, 0, 240, 1.03, 1)}>
        <Arc
          id="hero"
          W={W}
          H={H}
          g={g}
          draw={tw(f, 14, 34, easeInOut)}
          deckDraw={tw(f, 10, 32, easeInOut)}
          nodes={dk < 1 ? 0 : 0.5 + 0.5 * popB}
          hangers={tw(f, 34, 30) * (1 - mk)}
          sw={lerp(16, 4.5 * markScale, mk)}
          deckSw={lerp(10, 4 * markScale, mk)}
          nodeR={lerp(18, 5 * markScale, mk)}
          node={interpolateColors(mk, [0, 0.6, 1], [C.signal, C.signal, C.ink])}
          deck={C.ink}
          view={view}
          pulse={f >= 44 && f < 112 ? [(f - 44) / 62] : []}
          words={words}
          wordOpacity={wordsOut}
          wordSize={wordSize}
        />
        {dk < 1 && (
          <div style={{ position: "absolute", left: dotX - dotR, top: dotY - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: C.signal }} />
        )}
        {[
          { x: g.x0, a: "Session A", b: "limit reached", c: C.mute },
          { x: g.x1, a: "Session B", b: arrived ? "resumes with context" : "starts empty", c: arrived ? C.signal : C.mute },
        ].map((n, i) => (
          <div key={i} style={{ position: "absolute", left: n.x, top: g.deckY + 44, transform: "translateX(-50%)", textAlign: "center", opacity: labels * (i === 1 ? popB : 1), whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: F.mono, fontSize: pick(20, 18), letterSpacing: "0.28em", textTransform: "uppercase", color: C.ink }}>{n.a}</div>
            <div style={{ fontFamily: F.mono, fontSize: pick(17, 16), color: n.c, marginTop: 8 }}>{n.b}</div>
          </div>
        ))}
        {/* wordmark */}
        {f >= 142 && (
          <div style={{ position: "absolute", left: logo.wordX, top: baseline - off, ...serifStyle(size, { lineHeight: 1, letterSpacing: "-0.045em", whiteSpace: "nowrap", color: C.ink }) }}>
            <Chars text="Context" at={146} stagger={2} dur={36} blur={16} rise={0.35} />
            <Chars text="Bridge" at={146 + 7 * 2} stagger={2} dur={36} blur={16} rise={0.35} style={{ fontStyle: "italic", color: C.signal }} />
          </div>
        )}
        {f >= 150 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: baseline + pick(46, 52), textAlign: "center", ...serifStyle(tag, { lineHeight: 1.05, letterSpacing: "-0.03em", color: C.ink }) }}>
            {"Context outlives the session.".split(" ").map((w, i) => {
              const p = tw(f, 160 + i * 5, 26, expoOut);
              return (
                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.04em 0.06em 0.14em", margin: "-0.04em 0 -0.14em" }}>
                  <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, ...(w === "outlives" ? { fontStyle: "italic", color: C.signal } : null) }}>{w}&nbsp;</span>
                </span>
              );
            })}
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: baseline + pick(46, 52) + tag * 1.3, textAlign: "center", fontFamily: F.mono, fontSize: pick(20, 18), letterSpacing: "0.42em", color: C.mute }}>
          <Scramble text="VERIFIED · PORTABLE · PRIVATE" at={184} />
        </div>
      </Cam>
      <Flash amount={map(f, 0, 18, 0.55, 0)} color="#ffffff" />
    </Bg>
  );
};

/* ───────────── S7 · How it works: four kinetic steps on a vertical reel (0:12–0:20) ───────────── */
type StepProps = { lf: number; W: number; H: number; portrait: boolean };

const StepTitle: React.FC<{ lf: number; n: string; a: string; b: string; size: number }> = ({ lf, n, a, b, size }) => {
  const p1 = tw(lf, 2, 26, expoOut), p2 = tw(lf, 8, 26, expoOut);
  return (
    <div style={{ color: C.ink }}>
      <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.3em", color: C.signal, opacity: tw(lf, 0, 16), marginBottom: 20 }}>
        {n} <span style={{ color: C.mute }}>/ 04</span>
      </div>
      <div style={serifStyle(size, { lineHeight: 0.9, letterSpacing: "-0.045em" })}>
        <div style={{ overflow: "hidden", padding: "0.04em 0 0.14em", margin: "-0.04em 0 -0.14em" }}>
          <div style={{ transform: `translateY(${(1 - p1) * 110}%)` }}>{a}</div>
        </div>
        <div style={{ overflow: "hidden", padding: "0.04em 0.05em 0.16em", margin: "-0.04em -0.05em -0.16em" }}>
          <div style={{ transform: `translateY(${(1 - p2) * 110}%)` }}>
            <It>{b}</It>
          </div>
        </div>
      </div>
    </div>
  );
};

const cmd = (lf: number, text: string, at: number, size: number, cps = 52) => {
  const t = typed(lf, text, at, cps);
  return (
    <div style={{ fontFamily: F.mono, fontSize: size, color: C.ink, whiteSpace: "nowrap", opacity: t.started ? 1 : 0 }}>
      <span style={{ color: C.signal }}>$ </span>
      {t.shown}
      {!t.done && <Caret />}
    </div>
  );
};

const RecordViz: React.FC<StepProps> = ({ lf, portrait }) => {
  const pop = tw(lf, 40, 26, backOut(2));
  const check = tw(lf, 46, 18, easeInOut);
  const fly = tw(lf, 78, 26, easeInOut);
  const D = portrait ? 220 : 240;
  const gapX = portrait ? 380 : 420;
  return (
    <div style={{ position: "relative", width: gapX + 200, height: D + 220 }}>
      <div style={{ position: "absolute", left: 0, top: 0 }}>{cmd(lf, "contextbridge run -- pytest -q", 6, portrait ? 28 : 30)}</div>
      <div style={{ position: "absolute", left: 0, top: 90, width: D, height: D, borderRadius: "50%", border: `10px solid ${C.readyD}`, transform: `scale(${pop})`, display: "grid", placeItems: "center", background: "rgba(5,150,105,0.06)" }}>
        <svg width={D * 0.5} height={D * 0.5} viewBox="0 0 100 100">
          <path d="M20 54 L42 74 L82 30" fill="none" stroke={C.readyD} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={100} strokeDashoffset={100 * (1 - check)} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, top: 110 + D, width: D, textAlign: "center", opacity: tw(lf, 52, 14) }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em", color: C.readyD }}>PASSED</div>
        <div style={{ fontFamily: F.mono, fontSize: 19, color: C.mute, marginTop: 6 }}>exit 0 · 3.4s</div>
      </div>
      {/* dotted path, travelling token, file */}
      <div style={{ position: "absolute", left: D + 30, top: 90 + D / 2, width: gapX - D - 40, height: 3, backgroundImage: `linear-gradient(90deg, ${C.mute} 50%, transparent 50%)`, backgroundSize: "14px 3px", opacity: 0.5 * tw(lf, 70, 10) }} />
      {lf >= 74 && (
        <div
          style={{
            position: "absolute",
            left: lerp(D * 0.5 - 40, gapX + 36, fly),
            top: 90 + D / 2 - 26 - Math.sin(fly * Math.PI) * 70,
            padding: "10px 16px",
            borderRadius: 12,
            background: C.ink,
            color: C.paper,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 24,
            opacity: 1 - tw(lf, 102, 6),
            transform: `scale(${1 - fly * 0.35})`,
          }}
        >
          E1
        </div>
      )}
      <div style={{ position: "absolute", left: gapX, top: 90 + D / 2 - 70, width: 120, height: 150, opacity: tw(lf, 64, 14), transform: `scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(lf - 104) / 8)})` }}>
        <svg width={120} height={150} viewBox="0 0 120 150">
          <path d="M8 4 H82 L114 36 V146 H8 Z" fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M82 4 V36 H114" fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          {[60, 80, 100, 120].map((y, i) => (
            <line key={y} x1={24} x2={i === 3 ? 70 : 96} y1={y} y2={y} stroke={i === 1 && lf > 104 ? C.readyD : "rgba(12,14,19,0.3)"} strokeWidth={6} strokeLinecap="round" />
          ))}
        </svg>
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.ink2, textAlign: "center", marginTop: 10 }}>state.json</div>
      </div>
    </div>
  );
};

const SaveViz: React.FC<StepProps> = ({ lf, portrait }) => {
  const drop = tw(lf, 34, 34, backOut(1.4));
  const rows: [string, string][] = [
    ["branch", "main"],
    ["HEAD", "580df56"],
    ["files", "34 hashed"],
    ["tests", "E1 PASSED"],
  ];
  const w = portrait ? 620 : 600;
  return (
    <div style={{ position: "relative", width: w, height: 470 }}>
      <div style={{ position: "absolute", left: 0, top: 0 }}>{cmd(lf, "contextbridge save", 4, 30)}</div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 90,
          width: w - 40,
          padding: "46px 42px 34px",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 40px 70px -30px rgba(38,48,92,0.45), 0 2px 0 rgba(12,14,19,0.05)",
          transform: `translateY(${(1 - drop) * -260}px) rotate(${lerp(-14, -3, drop)}deg)`,
          opacity: tw(lf, 34, 6),
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: -14, width: 30, height: 30, marginLeft: -15, borderRadius: 99, background: C.signal, boxShadow: "0 6px 12px rgba(255,74,28,0.4)" }} />
        <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.3em", color: C.mute, marginBottom: 18 }}>CHECKPOINT · 09:41:07</div>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 30, padding: "10px 0", borderTop: `1px dashed ${C.cardLine}`, opacity: tw(lf, 50 + i * 7, 12) }}>
            <span style={{ color: C.mute }}>{k}</span>
            <span style={{ color: i === 3 ? C.readyD : C.ink }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SwitchViz: React.FC<StepProps> = ({ lf, portrait }) => {
  const cell = portrait ? 66 : 58;
  const rows = [
    { from: "SESSION A", to: "SESSION B", at: 14 },
    { from: "ACCOUNT 1", to: "ACCOUNT 2", at: 30 },
    { from: "CLAUDE   ", to: "ANY AGENT", at: 46 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: cell * 0.3, alignItems: "flex-start" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ opacity: tw(lf, i * 4, 12) }}>
          <SplitFlap text={r.to} from={r.from} at={r.at} cell={cell} stagger={1.5} flips={7} seed={i + 3} accent={i === 2 ? C.signal : undefined} />
        </div>
      ))}
      <div style={{ fontFamily: F.mono, fontSize: 20, color: C.mute, marginTop: 14, letterSpacing: "0.04em", opacity: tw(lf, 64, 16) }}>
        the handoff travels with the repo: <span style={{ color: C.ink }}>contextbridge/</span>
      </div>
    </div>
  );
};

const ResumeViz: React.FC<StepProps> = ({ lf, portrait }) => {
  const open = tw(lf, 54, 30, backOut(1.6));
  const ready = tw(lf, 62, 20, expoOut);
  const arm = 360;
  const pivotY = 450;
  return (
    <div style={{ position: "relative", width: 640, height: 660 }}>
      <div style={{ position: "absolute", left: 0, top: 0 }}>{cmd(lf, "contextbridge resume --check", 4, portrait ? 28 : 30)}</div>
      <div style={{ position: "absolute", left: 40, top: pivotY, width: 44, height: 200, borderRadius: 10, background: C.ink }} />
      <div
        style={{
          position: "absolute",
          left: 62,
          top: pivotY,
          width: arm,
          height: 38,
          marginTop: -19,
          borderRadius: 19,
          backgroundImage: `repeating-linear-gradient(135deg, ${C.signal} 0 34px, #fff 34px 68px)`,
          border: `3px solid ${C.ink}`,
          transformOrigin: "0% 50%",
          transform: `rotate(${-80 * open}deg)`,
          boxShadow: "0 20px 30px -18px rgba(12,14,19,0.5)",
        }}
      />
      <div style={{ position: "absolute", left: 40, top: pivotY - 22, width: 44, height: 44, borderRadius: 99, background: C.ink }} />
      <div style={{ position: "absolute", left: 210, top: 300, opacity: ready, transform: `translateY(${(1 - ready) * 30}px)` }}>
        <div style={serifStyle(portrait ? 150 : 160, { color: C.readyD, lineHeight: 0.9, letterSpacing: "-0.04em" })}>READY</div>
        <div style={{ fontFamily: F.mono, fontSize: 22, color: C.mute, marginTop: 8 }}>exit 0 · no drift</div>
      </div>
    </div>
  );
};

const STEPS = [
  { n: "01", a: "Record", b: "evidence.", Viz: RecordViz },
  { n: "02", a: "Save a", b: "checkpoint.", Viz: SaveViz },
  { n: "03", a: "Switch", b: "anything.", Viz: SwitchViz },
  { n: "04", a: "Resume", b: "safely.", Viz: ResumeViz },
];

export const S7How: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, portrait, pick } = useL();
  const bounds = [120, 240, 360];
  const posAt = (fr: number) => bounds.reduce((acc, b) => acc + tw(fr, b - 14, 26, easeInOut), 0);
  const pos = posAt(f);
  const vel = Math.abs(pos - posAt(f - 1)) * H;
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.10)" x={0.85} y={0.2} r={0.55} />
      <Glow color="rgba(108,150,255,0.14)" x={0.05} y={0.9} r={0.5} />
      <BlurX amount={Math.min(40, Math.max(0, vel - 24) * 0.25)} id="how-push" vertical>
        {STEPS.map((S, i) => {
          const y = (i - pos) * H;
          if (Math.abs(y) > H * 1.05) return null;
          const lf = Math.max(0, f - (i === 0 ? 0 : bounds[i - 1] - 10));
          return (
            <AbsoluteFill key={S.n} style={{ transform: `translateY(${y}px)` }}>
              <div style={{ position: "absolute", left: pick(150, 90), top: pick(0.3 * H, 0.12 * H) }}>
                <StepTitle lf={lf} n={S.n} a={S.a} b={S.b} size={pick(210, 190)} />
              </div>
              <div style={{ position: "absolute", left: pick(0.5 * W, 0), top: pick(0, 0.44 * H), width: pick(0.5 * W, W), height: pick(H, 0.5 * H), display: "flex", alignItems: "center", justifyContent: pick("flex-start", "center") }}>
                <div style={{ transform: `scale(${pick(1.22, 1.12)})`, transformOrigin: pick("0% 50%", "50% 50%") }}>
                  <S.Viz lf={lf} W={W} H={H} portrait={portrait} />
                </div>
              </div>
            </AbsoluteFill>
          );
        })}
      </BlurX>
      {/* the checkpoint is taken like a photo */}
      <Shutter at={bounds[0] - 10 + 26} W={W} H={H} />
    </Bg>
  );
};
