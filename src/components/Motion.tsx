import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { clamp, easeInOut, expoOut, hash, lerp, rng, tw } from "../lib/anim";

/* ═════════════════════════════ The arc ═════════════════════════════
   The bridge as a bold vector graphic: deck, arch and nodes in the proportions of the ContextBridge
   mark. It can draw on, carry words along the arch, pulse, flicker (REVIEW) and snap in two (BLOCKED).
   `view` maps the arc into the frame, so the same arc can shrink into the logo position. */

export type ArcGeom = { x0: number; x1: number; deckY: number; apexY: number };
export type ArcProps = {
  W: number;
  H: number;
  g: ArcGeom;
  draw?: number;
  deckDraw?: number;
  nodes?: number;
  hangers?: number;
  arch?: string;
  deck?: string;
  node?: string;
  sw?: number;
  deckSw?: number;
  nodeR?: number;
  view?: { s: number; tx: number; ty: number };
  breakAmt?: number;
  flicker?: number;
  pulse?: number[];
  pulseColor?: string;
  words?: { text: string; at: number; color?: string }[];
  wordSize?: number;
  wordColor?: string;
  wordOpacity?: number;
  opacity?: number;
  id: string;
};

const quad = (p0: number[], p1: number[], p2: number[], t: number) => [
  (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0],
  (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1],
];

/** Length of the arch curve in px (sampled), for moving text along it at a constant speed. */
export function arcLength(g: ArcGeom) {
  const P0 = [g.x0, g.deckY], P1 = [(g.x0 + g.x1) / 2, 2 * g.apexY - g.deckY], P2 = [g.x1, g.deckY];
  let l = 0, prev = P0;
  for (let i = 1; i <= 64; i++) {
    const p = quad(P0, P1, P2, i / 64);
    l += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return l;
}

export const Arc: React.FC<ArcProps> = ({
  W,
  H,
  g,
  draw = 1,
  deckDraw = 1,
  nodes = 1,
  hangers = 1,
  arch = C.signal,
  deck = C.ink,
  node = C.ink,
  sw = 14,
  deckSw = 9,
  nodeR = 17,
  view = { s: 1, tx: 0, ty: 0 },
  breakAmt = 0,
  flicker = 0,
  pulse = [],
  pulseColor,
  words = [],
  wordSize = 26,
  wordColor = C.ink,
  wordOpacity = 1,
  opacity = 1,
  id,
}) => {
  const frame = useCurrentFrame();
  const { x0, x1, deckY, apexY } = g;
  const P0 = [x0, deckY], P1 = [(x0 + x1) / 2, 2 * apexY - deckY], P2 = [x1, deckY];
  const M = quad(P0, P1, P2, 0.5);
  const L1 = [(P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2], R1 = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];
  const len = useMemo(() => arcLength(g), [x0, x1, deckY, apexY]); // eslint-disable-line react-hooks/exhaustive-deps
  const deckLen = x1 - x0;
  const archD = `M${P0[0]},${P0[1]} Q${P1[0]},${P1[1]} ${P2[0]},${P2[1]}`;
  const leftD = `M${P0[0]},${P0[1]} Q${L1[0]},${L1[1]} ${M[0]},${M[1]}`;
  const rightD = `M${P2[0]},${P2[1]} Q${R1[0]},${R1[1]} ${M[0]},${M[1]}`;
  const s = view.s;
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const fl = flicker > 0 ? 1 - flicker * (hash(Math.floor(frame / 2) * 13) > 0.6 ? 0.75 : 0.1) : 1;
  const dash = flicker > 0.05 ? `${26} ${10 + 8 * flicker}` : undefined;
  const broken = breakAmt > 0.001;
  const halfLen = len / 2;
  const retract = halfLen * 0.5 * breakAmt;
  const tilt = 9 * breakAmt + Math.sin(Math.min(1, breakAmt) * Math.PI) * 3;
  const hang = Array.from({ length: 11 }, (_, i) => (i + 1) / 12);
  const pc = pulseColor ?? arch;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}>
      <defs>
        <path id={`${id}-p`} d={archD} />
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g transform={`translate(${view.tx},${view.ty}) scale(${s})`}>
        {/* hangers */}
        {hang.map((t, i) => {
          const top = quad(P0, P1, P2, t);
          const vis = clamp(hangers * 12 - i * 0.8) * (broken && t > 0.3 && t < 0.7 ? 1 - breakAmt : 1);
          return vis > 0.01 ? (
            <line key={i} x1={top[0]} x2={top[0]} y1={deckY} y2={lerp(deckY, top[1], vis)} stroke={deck} strokeWidth={2.2} opacity={0.35} style={ns} />
          ) : null;
        })}
        {/* deck */}
        {!broken ? (
          <line x1={x0} y1={deckY} x2={x0 + deckLen * deckDraw} y2={deckY} stroke={deck} strokeWidth={deckSw} strokeLinecap="round" style={ns} />
        ) : (
          <>
            <line x1={x0} y1={deckY} x2={(x0 + x1) / 2 - 8} y2={deckY} stroke={deck} strokeWidth={deckSw} strokeLinecap="round" style={ns} transform={`rotate(${tilt} ${x0} ${deckY})`} />
            <line x1={(x0 + x1) / 2 + 8} y1={deckY} x2={x1} y2={deckY} stroke={deck} strokeWidth={deckSw} strokeLinecap="round" style={ns} transform={`rotate(${-tilt} ${x1} ${deckY})`} />
          </>
        )}
        {/* arch */}
        {!broken ? (
          <path d={archD} fill="none" stroke={arch} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ?? len} strokeDashoffset={dash ? -frame * 3 : len * (1 - draw)} opacity={fl} style={ns} />
        ) : (
          <>
            <path d={leftD} fill="none" stroke={arch} strokeWidth={sw} strokeLinecap="round" strokeDasharray={halfLen} strokeDashoffset={retract} style={ns} transform={`rotate(${tilt * 0.6} ${x0} ${deckY})`} />
            <path d={rightD} fill="none" stroke={arch} strokeWidth={sw} strokeLinecap="round" strokeDasharray={halfLen} strokeDashoffset={retract} style={ns} transform={`rotate(${-tilt * 0.6} ${x1} ${deckY})`} />
          </>
        )}
        {/* words travelling along the arch */}
        {words.map((w, i) =>
          w.at > -0.8 && w.at < 1.1 ? (
            <text key={i} fontFamily={F.mono} fontSize={wordSize / s} fill={w.color ?? wordColor} dy={-sw / s - 12 / s} opacity={wordOpacity} letterSpacing={1 / s}>
              <textPath href={`#${id}-p`} startOffset={`${w.at * 100}%`}>
                {w.text}
              </textPath>
            </text>
          ) : null,
        )}
        {/* pulses */}
        {!broken &&
          pulse.map((pp, k) =>
            pp > -0.05 && pp < 1.05 ? (
              <g key={k}>
                {[0.06, 0.045, 0.03, 0.015, 0].map((d, j) => {
                  const t = clamp(pp - d);
                  const p = quad(P0, P1, P2, t);
                  return <circle key={j} cx={p[0]} cy={p[1]} r={(sw * (0.5 + j * 0.16)) / s} fill={pc} opacity={0.18 + j * 0.2} />;
                })}
                {(() => {
                  const p = quad(P0, P1, P2, clamp(pp));
                  return <circle cx={p[0]} cy={p[1]} r={(sw * 1.6) / s} fill={pc} opacity={0.55} filter={`url(#${id}-glow)`} />;
                })()}
              </g>
            ) : null,
          )}
        {/* nodes */}
        {[x0, x1].map((x, i) => (
          <circle key={i} cx={x} cy={deckY} r={(nodeR * clamp(nodes * 2 - i)) / s} fill={node} />
        ))}
      </g>
    </svg>
  );
};

/* ═════════════════════════════ Odometer ═════════════════════════════ */
export const Odometer: React.FC<{
  text: string;
  at: number;
  dur?: number;
  stagger?: number;
  spins?: number;
  style?: React.CSSProperties;
  cellStyle?: (ch: string, i: number) => React.CSSProperties;
}> = ({ text, at, dur = 54, stagger = 4, spins = 2, style, cellStyle }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const digitsBefore = (i: number) => chars.slice(0, i).filter((c) => /\d/.test(c)).length;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", lineHeight: 1, ...style }}>
      {chars.map((ch, i) => {
        const k = digitsBefore(i);
        const start = at + k * stagger;
        if (!/\d/.test(ch)) {
          const p = tw(frame, at + Math.max(0, k - 1) * stagger, 20);
          return (
            <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 0.3}em)`, ...(cellStyle ? cellStyle(ch, i) : null) }}>
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        const total = spins * 10 + d;
        const p = tw(frame, start, dur, expoOut);
        const idx = p * total;
        const speed = Math.abs(tw(frame + 1, start, dur, expoOut) - p) * total;
        return (
          <span key={i} style={{ display: "inline-block", height: "1.08em", overflow: "hidden", position: "relative", opacity: tw(frame, start - 2, 8), ...(cellStyle ? cellStyle(ch, i) : null) }}>
            <span style={{ display: "block", transform: `translateY(${-idx * 1.08}em)`, filter: speed > 0.2 ? `blur(${Math.min(6, speed * 3)}px)` : undefined }}>
              {Array.from({ length: total + 1 }, (_, n) => (
                <span key={n} style={{ display: "block", height: "1.08em", lineHeight: "1.08em", textAlign: "center" }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/* ═════════════════════════════ Words flying past the camera ═════════════════════════════ */
export const FlyWords: React.FC<{ items: { text: string; at: number; x: number; y: number }[]; W: number; H: number; speed?: number; size?: number; color?: string }> = ({
  items,
  W,
  H,
  speed = 62,
  size = 40,
  color = C.ink,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 50%", overflow: "hidden" }}>
      {items.map((it, i) => {
        const t = frame - it.at;
        if (t < 0) return null;
        const z = -1900 + t * speed;
        if (z > 880) return null;
        const near = clamp((z - 160) / 600);
        const far = clamp((z + 1900) / 1300) * 0.55 + clamp((z + 400) / 500) * 0.45;
        const blur = z > 120 ? (z - 120) / 70 : z < -1200 ? (-1200 - z) / 200 : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W / 2,
              top: H / 2,
              transform: `translate3d(${it.x * W * 0.5}px, ${it.y * H * 0.5}px, ${z}px) translate(-50%, -50%)`,
              fontFamily: F.mono,
              fontSize: size,
              color,
              whiteSpace: "nowrap",
              opacity: far * (1 - near),
              filter: blur > 0.3 ? `blur(${Math.min(blur, 18)}px)` : undefined,
            }}
          >
            {it.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════════════════════ Tilted plane of scrolling code ═════════════════════════════ */
export const CodePlane: React.FC<{ lines: string[]; scroll: number; W: number; H: number; top: number; tilt?: number; size?: number; drop?: number; startX?: number }> = ({
  lines,
  scroll,
  W,
  H,
  top,
  tilt = 62,
  size = 34,
  drop = 0,
  startX = 0.12, // screen-space x of the line starts (the plane overhangs the frame by 0.3W)
}) => {
  const lh = size * 1.7;
  const n = lines.length;
  const first = Math.floor(scroll / lh);
  return (
    <div style={{ position: "absolute", left: -W * 0.3, width: W * 1.6, top, height: H * 1.6, perspective: 1100, perspectiveOrigin: "50% 0%", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateX(${tilt + drop * 25}deg) translateY(${drop * 300}px)`,
          transformOrigin: "50% 0%",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 100%)",
        }}
      >
        {Array.from({ length: 34 }, (_, k) => {
          const li = first + k;
          const text = lines[((li % n) + n) % n];
          const y = li * lh - scroll;
          return (
            <div key={li} style={{ position: "absolute", left: W * (startX + 0.3), top: y, fontFamily: F.mono, fontSize: size, whiteSpace: "pre", color: "rgba(12,14,19,0.62)" }}>
              <CodeTokens text={text} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Colours a code line: ✓/PASSED green, ✕/FAILED red, paths blue, comments muted. */
export const CodeTokens: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) => {
        let color: string | undefined;
        if (/^(✓|PASSED|ok|READY)/.test(p)) color = C.readyD;
        else if (/^(✕|FAILED|BLOCK)/.test(p)) color = C.blockedD;
        else if (/^(WARN|REVIEW)/.test(p)) color = C.reviewD;
        else if (/[/.](py|json|md|ts)$|^src\//.test(p)) color = C.blue;
        else if (/^#/.test(p)) color = C.mute;
        return (
          <span key={i} style={{ color }}>
            {p}
          </span>
        );
      })}
    </>
  );
};

/* ═════════════════════════════ Split-flap board ═════════════════════════════ */
const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·";
export const SplitFlap: React.FC<{ text: string; from?: string; at: number; cell: number; stagger?: number; flips?: number; seed?: number; accent?: string }> = ({
  text,
  from,
  at,
  cell,
  stagger = 2,
  flips = 9,
  seed = 1,
  accent,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const prev = from ? Array.from(from.padEnd(chars.length)) : chars.map(() => " ");
  return (
    <div style={{ display: "flex", gap: cell * 0.1 }}>
      {chars.map((ch, i) => {
        const start = at + i * stagger;
        const steps = Math.floor((frame - start) / 2);
        let shown = prev[i] ?? " ";
        let flipping = false;
        if (frame >= start) {
          if (steps >= flips) shown = ch;
          else {
            flipping = true;
            shown = FLAP[Math.floor(hash(seed * 977 + i * 31 + steps) * FLAP.length)];
          }
        }
        const phase = flipping ? ((frame - start) % 2) / 2 : 1;
        return (
          <div
            key={i}
            style={{
              width: cell,
              height: cell * 1.32,
              borderRadius: cell * 0.12,
              background: C.ink,
              color: shown === ch && !flipping && accent ? accent : C.paper,
              fontFamily: F.mono,
              fontWeight: 600,
              fontSize: cell * 0.82,
              display: "grid",
              placeItems: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 14px 26px -16px rgba(12,14,19,0.6)",
            }}
          >
            <span style={{ transform: `scaleY(${flipping ? 0.55 + 0.45 * phase : 1})` }}>{shown === " " ? "" : shown}</span>
            <i style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1, background: "rgba(236,232,223,0.16)", display: "block" }} />
          </div>
        );
      })}
    </div>
  );
};

/* ═════════════════════════════ Slot reel ═════════════════════════════ */
export const Reel: React.FC<{ items: React.ReactNode[]; itemH: number; pos: number; width: number; blur?: number }> = ({ items, itemH, pos, width, blur = 0 }) => {
  const n = items.length;
  const base = Math.floor(pos);
  return (
    <div style={{ position: "relative", height: itemH, width, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        {[-1, 0, 1].map((o) => {
          const k = base + o;
          const y = (k - pos) * itemH;
          return (
            <div key={k} style={{ position: "absolute", left: 0, right: 0, top: y, height: itemH, display: "flex", alignItems: "center", justifyContent: "center", filter: blur > 0.3 ? `blur(${Math.min(10, blur * 0.4)}px)` : undefined }}>
              {items[((k % n) + n) % n]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═════════════════════════════ Sparks ═════════════════════════════ */
export const Sparks: React.FC<{ x: number; y: number; at: number; color: string; n?: number; power?: number; seed?: number }> = ({ x, y, at, color, n = 46, power = 1, seed = 3 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / 60;
  if (t < 0 || t > 1.6) return null;
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5;
        const v = (260 + r() * 680) * power;
        const life = 0.5 + r() * 1.0;
        if (t > life) {
          r();
          return null;
        }
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.5 * 1500 * t * t;
        const sz = 3 + r() * 6;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: sz, height: sz * (1 + v * 0.002), background: color, borderRadius: 2, opacity: 1 - t / life, transform: `rotate(${(a * 180) / Math.PI + 90}deg)` }} />;
      })}
    </>
  );
};

/* ═════════════════════════════ Strike-through ═════════════════════════════ */
export const Strike: React.FC<{ p: number; color?: string; thickness?: number; style?: React.CSSProperties }> = ({ p, color = C.signal, thickness = 10, style }) => (
  <span
    style={{
      position: "absolute",
      left: "-2%",
      top: "54%",
      height: thickness,
      width: `${104 * p}%`,
      background: color,
      borderRadius: thickness,
      transform: "rotate(-3deg)",
      transformOrigin: "0 50%",
      ...style,
    }}
  />
);

/* ═════════════════════════════ Hazard stripes band ═════════════════════════════ */
export const Hazard: React.FC<{ W: number; y: number; h: number; p: number; shift: number; color?: string; angle?: number }> = ({ W, y, h, p, shift, color = C.reviewD, angle = -8 }) =>
  p <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: -W * 0.1,
        width: W * 1.2,
        top: y,
        height: h * p,
        marginTop: (-h * p) / 2,
        transform: `rotate(${angle}deg)`,
        backgroundImage: `repeating-linear-gradient(135deg, ${color} 0 34px, rgba(236,232,223,0.0) 34px 68px)`,
        backgroundPosition: `${shift}px 0`,
        opacity: 0.38,
      }}
    />
  );

/* ═════════════════════════════ Camera shutter ═════════════════════════════ */
export const Shutter: React.FC<{ at: number; W: number; H: number; color?: string }> = ({ at, W, H, color = C.ink }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 16) return null;
  const close = t < 6 ? tw(t, 0, 6, easeInOut) : 1 - tw(t, 8, 8, easeInOut);
  const h = (H / 2) * close;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: color }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: color }} />
      {t >= 6 && t <= 9 && <AbsoluteFill style={{ background: "#fff", opacity: 0.85 - (t - 6) * 0.25 }} />}
    </AbsoluteFill>
  );
};

/* ═════════════════════════════ Ruler band (benchmark section) ═════════════════════════════ */
export const Ruler: React.FC<{ W: number; y: number; offset: number; opacity?: number }> = ({ W, y, offset, opacity = 1 }) => {
  const step = 20;
  const n = Math.ceil(W / step) + 12;
  const o = ((offset % (step * 5)) + step * 5) % (step * 5);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: y, height: 46, overflow: "hidden", opacity }}>
      {Array.from({ length: n }, (_, i) => {
        const x = i * step - o;
        const idx = Math.round((x + offset) / step);
        const major = idx % 5 === 0;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 0, width: 1.5, height: major ? 22 : 11, background: C.ink, opacity: major ? 0.5 : 0.28 }}>
            {major && idx % 10 === 0 && (
              <span style={{ position: "absolute", top: 26, left: -12, fontFamily: F.mono, fontSize: 12, color: C.mute, letterSpacing: "0.05em" }}>{Math.abs(idx) * 2}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ═════════════════════════════ Dot swarm (canvas) ═════════════════════════════ */
export const DotSwarm: React.FC<{ cols: number; rows: number; w: number; h: number; p: number; red: number; redPop: number; seed?: number; spreadW: number; spreadH: number; ox: number; oy: number }> = ({
  cols,
  rows,
  w,
  h,
  p,
  red,
  redPop,
  seed = 5,
  spreadW,
  spreadH,
  ox,
  oy,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const pts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: cols * rows }, () => ({ sx: (r() * 1.6 - 0.3) * spreadW - ox, sy: (r() * 1.6 - 0.3) * spreadH - oy, d: r() * 0.45, c: r() }));
  }, [cols, rows, seed, spreadW, spreadH, ox, oy]);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.clearRect(0, 0, ref.current!.width, ref.current!.height);
    const cw = w / cols, ch = h / rows, rad = Math.min(cw, ch) * 0.3;
    const pad = 60;
    pts.forEach((q, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const k = clamp((p - q.d) / 0.55);
      const e = 1 - Math.pow(1 - k, 3);
      const tx = c * cw + cw / 2, ty = r * ch + ch / 2;
      const m = 1 - e;
      const cx = (q.sx + tx) / 2 + (q.c - 0.5) * 300, cy = (q.sy + ty) / 2 - 200 * q.c;
      const x = m * m * q.sx + 2 * m * e * cx + e * e * tx;
      const y = m * m * q.sy + 2 * m * e * cy + e * e * ty;
      const isRed = i === red;
      ctx.globalAlpha = 0.25 + 0.75 * e;
      ctx.fillStyle = isRed && e > 0.98 ? C.blockedD : C.readyD;
      const rr = rad * (isRed ? 1 + redPop * 0.9 : 1);
      ctx.beginPath();
      ctx.arc(x + pad, y + pad, rr, 0, Math.PI * 2);
      ctx.fill();
      if (isRed && redPop > 0) {
        ctx.globalAlpha = (1 - redPop) * 0.6;
        ctx.strokeStyle = C.blockedD;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + pad, y + pad, rr + redPop * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={w + 120} height={h + 120} style={{ position: "absolute", left: -60, top: -60, width: w + 120, height: h + 120 }} />;
};

/* ═════════════════════════════ Wall of text (canvas) ═════════════════════════════ */
const WALL_WORDS = ["modified:", "src/auth.py", "commit", "a41c9e2", "Author:", "Date:", "diff --git", "+++", "---", "@@ -12,7 +12,9 @@", "tests/", "1 file changed,", "insertions(+)", "deletions(-)", "HEAD", "main", "rename", "{old → new}", "untracked:", "README.md", "package.json", "|", "++--", "Merge", "refactor tokens", "fix: refresh"];
export const TextWall: React.FC<{ W: number; H: number; scroll: number; density: number; collapse: number; size?: number }> = ({ W, H, scroll, density, collapse, size = 17 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const sy = Math.max(0.002, 1 - collapse);
    ctx.translate(0, H / 2);
    ctx.scale(1, sy);
    ctx.translate(0, -H / 2);
    ctx.font = `${size}px "JetBrains Mono Variable"`;
    const lh = size * 1.55;
    const first = Math.floor(scroll / lh);
    const rows = Math.ceil(H / lh) + 2;
    for (let k = 0; k < rows; k++) {
      const li = first + k;
      const y = li * lh - scroll;
      let x = 20 + hash(li * 3) * 40;
      let w = 0;
      while (x < W) {
        w++;
        const word = WALL_WORDS[Math.floor(hash(li * 131 + w * 17) * WALL_WORDS.length)];
        const show = hash(li * 7 + w * 3) < density;
        if (show) {
          const g = hash(li + w * 5);
          ctx.fillStyle = g < 0.08 ? "rgba(5,150,105,0.55)" : g < 0.14 ? "rgba(225,29,72,0.5)" : "rgba(12,14,19,0.42)";
          ctx.fillText(word, x, y);
        }
        x += ctx.measureText(word).width + size * 1.2;
      }
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />;
};

/* ═════════════════════════════ Stopwatch dial ═════════════════════════════ */
export const Dial: React.FC<{ r: number; p: number; max?: number; value: number; color?: string }> = ({ r, p, max = 200, value, color = C.blue }) => {
  const a0 = -90;
  const sweep = (value / max) * 360 * p;
  const arc = (deg: number) => {
    const rad = ((a0 + deg) * Math.PI) / 180;
    return [r + Math.cos(rad) * (r - 18), r + Math.sin(rad) * (r - 18)];
  };
  const [ex, ey] = arc(sweep);
  const large = sweep > 180 ? 1 : 0;
  return (
    <svg width={r * 2} height={r * 2} style={{ overflow: "visible", display: "block" }}>
      <circle cx={r} cy={r} r={r - 18} fill="none" stroke="rgba(12,14,19,0.1)" strokeWidth={14} />
      {sweep > 0.5 && <path d={`M${r},${18} A${r - 18},${r - 18} 0 ${large} 1 ${ex},${ey}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />}
      {Array.from({ length: 40 }, (_, i) => {
        const deg = (i / 40) * 360;
        const rad = ((a0 + deg) * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = r + 6, r2 = r + (major ? 26 : 16);
        return <line key={i} x1={r + Math.cos(rad) * r1} y1={r + Math.sin(rad) * r1} x2={r + Math.cos(rad) * r2} y2={r + Math.sin(rad) * r2} stroke={C.ink} strokeWidth={major ? 3 : 1.5} opacity={major ? 0.55 : 0.3} />;
      })}
      {sweep > 0.5 && <circle cx={ex} cy={ey} r={17} fill={C.paper} stroke={color} strokeWidth={6} />}
    </svg>
  );
};
