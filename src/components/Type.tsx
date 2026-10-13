import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { ease, hash, tw } from "../lib/anim";

/** RGB-split glitch, a scaled-up version of the site's `.glitch` keyframes. */
export function glitch(frame: number, at: number, dur = 30, amp = 1): React.CSSProperties {
  const t = frame - at;
  if (t < 0 || t > dur) return {};
  const k = Math.pow(1 - t / dur, 1.4) * amp;
  const step = Math.floor(t / 3);
  const r1 = hash(step * 31 + at), r2 = hash(step * 17 + at * 3);
  const dx = (r1 - 0.5) * 22 * k;
  return {
    textShadow: `${10 * k}px 0 rgba(0,229,255,0.9), ${-10 * k}px 0 rgba(255,45,111,0.9)`,
    transform: `translateX(${dx}px) skewX(${(r2 - 0.5) * 16 * k}deg)`,
  };
}

/** Typewriter: reveals `text` from frame `at` at `cps` characters per second (60 fps). */
export function typed(frame: number, text: string, at: number, cps = 38) {
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - at) / 60) * cps)));
  return { shown: text.slice(0, n), done: n >= text.length, started: frame >= at };
}

export const Caret: React.FC<{ color?: string; h?: string; on?: boolean }> = ({ color = "currentColor", h = "1.05em", on = true }) => {
  const frame = useCurrentFrame();
  const vis = on && Math.floor(frame / 16) % 2 === 0;
  return <span style={{ display: "inline-block", width: "0.55em", height: h, background: color, verticalAlign: "-0.17em", marginLeft: 2, opacity: vis ? 1 : 0 }} />;
};

/** Per-character reveal: each glyph rises, de-blurs and fades in with a stagger. */
export const Chars: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties;
  blur?: number;
  rise?: number;
}> = ({ text, at, stagger = 2.2, dur = 40, style, charStyle, blur = 16, rise = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...style }}>
      {Array.from(text).map((ch, i) => {
        const p = tw(frame, at + i * stagger, dur, ease);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              filter: p < 0.999 ? `blur(${(1 - p) * blur}px)` : undefined,
              transform: `translateY(${(1 - p) * rise}em)`,
              ...(charStyle ? charStyle(i) : null),
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Number that counts up with the site's ease. */
export const Count: React.FC<{ to: number; at: number; dur?: number; from?: number; decimals?: number; format?: (n: number) => string }> = ({
  to,
  at,
  dur = 50,
  from = 0,
  decimals = 0,
  format,
}) => {
  const frame = useCurrentFrame();
  const p = tw(frame, at, dur, ease);
  const v = from + (to - from) * p;
  const s = format ? format(v) : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{s}</span>;
};

export const serifStyle = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: F.serif,
  fontWeight: 400,
  fontSize: size,
  lineHeight: 0.9,
  letterSpacing: "-0.04em",
  ...extra,
});

export const It: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.signal, style }) => (
  <span style={{ fontStyle: "italic", color, ...style }}>{children}</span>
);
