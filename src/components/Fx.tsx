import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { hash } from "../lib/anim";

/** Horizontal slice displacement + RGB fringing, for glitch hits. `amount` 0…1. */
export const Slices: React.FC<{ amount: number; seed?: number; children: React.ReactNode; bands?: number; maxShift?: number }> = ({
  amount,
  seed = 1,
  children,
  bands = 6,
  maxShift = 90,
}) => {
  const frame = useCurrentFrame();
  if (amount <= 0.02) return <AbsoluteFill>{children}</AbsoluteFill>;
  const k = Math.floor(frame / 2) + seed * 101;
  const list = Array.from({ length: bands }, (_, b) => {
    const top = hash(k * 13 + b * 7) * 92;
    const h = 1.5 + hash(k * 29 + b) * 9;
    const dx = (hash(k * 7 + b * 3) - 0.5) * 2 * maxShift * amount;
    return { top, h, dx, tint: b % 2 === 0 ? "rgba(0,229,255,0.75)" : "rgba(255,45,111,0.75)" };
  });
  const split = 9 * amount;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `drop-shadow(${split}px 0 0 rgba(255,45,111,0.55)) drop-shadow(${-split}px 0 0 rgba(0,229,255,0.55))` }}>{children}</AbsoluteFill>
      {list.map((s, i) => (
        <AbsoluteFill
          key={i}
          style={{
            clipPath: `inset(${s.top}% 0 ${Math.max(0, 100 - s.top - s.h)}% 0)`,
            transform: `translateX(${s.dx}px)`,
            filter: `drop-shadow(${s.dx > 0 ? 6 : -6}px 0 0 ${s.tint})`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Directional motion blur through an SVG filter; cheap enough for whip pans and pushes. */
export const BlurX: React.FC<{ amount: number; id: string; children: React.ReactNode; style?: React.CSSProperties; vertical?: boolean }> = ({ amount, id, children, style, vertical }) => (
  <AbsoluteFill style={style}>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={vertical ? `0 ${Math.max(0, amount)}` : `${Math.max(0, amount)} 0`} />
      </filter>
    </svg>
    <AbsoluteFill style={{ filter: amount > 0.4 ? `url(#${id})` : undefined }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

/** Inline element with directional blur, for single words that slide in. */
export const SlideBlur: React.FC<{ dx?: number; dy?: number; blur: number; id: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ dx = 0, dy = 0, blur, id, children, style }) => (
  <span style={{ display: "inline-block", transform: `translate(${dx}px, ${dy}px)`, filter: blur > 0.4 ? `url(#${id})` : undefined, ...style }}>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={Math.abs(dx) >= Math.abs(dy) ? `${blur} 0` : `0 ${blur}`} />
      </filter>
    </svg>
    {children}
  </span>
);

/** Camera wrapper: push-in, drift, roll and (optional) perspective for 3D children. */
export const Cam: React.FC<{
  z?: number;
  x?: number;
  y?: number;
  rot?: number;
  children: React.ReactNode;
  origin?: string;
  perspective?: number;
  style?: React.CSSProperties;
}> = ({ z = 1, x = 0, y = 0, rot = 0, children, origin = "50% 50%", perspective, style }) => (
  <AbsoluteFill
    style={{
      transform: `translate(${x}px, ${y}px) scale(${z}) rotate(${rot}deg)`,
      transformOrigin: origin,
      perspective,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);
