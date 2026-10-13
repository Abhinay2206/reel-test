import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { hash } from "../lib/anim";

const GRAIN = [0, 1, 2, 3, 4, 5].map((i) => staticFile(`img/grain-${i}.png`));

// Preload the grain tiles once per tab so CSS backgrounds are painted from cache on the first frame.
const grainHandle = delayRender("grain textures");
Promise.all(
  GRAIN.map(
    (src) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.onload = () => res();
        im.onerror = () => res();
        im.src = src;
      }),
  ),
).then(() => continueRender(grainHandle));

/** Film grain: six pre-rendered noise tiles, re-rolled every three frames (20 Hz), blended with `overlay`
 *  so it reads on paper and on ink alike. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 3);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${GRAIN[k % GRAIN.length]})`,
        backgroundSize: "640px 640px",
        backgroundPosition: `${Math.floor(hash(k) * 640)}px ${Math.floor(hash(k + 7919) * 640)}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.16, color = "40,32,20" }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 95% at 50% 46%, rgba(${color},0) 52%, rgba(${color},${strength * 0.55}) 82%, rgba(${color},${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Soft coloured glows that drift slowly (light leaks). Positions are fractions of the frame. */
export const Glow: React.FC<{
  color: string;
  x: number;
  y: number;
  r?: number;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ color, x, y, r = 0.55, opacity = 1, blend = "normal" }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(${r * 100}% ${r * 100}% at ${x * 100}% ${y * 100}%, ${color}, transparent 72%)`,
      opacity,
      mixBlendMode: blend,
      pointerEvents: "none",
    }}
  />
);

export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = C.paper }) =>
  amount <= 0.001 ? null : <AbsoluteFill style={{ background: color, opacity: amount, pointerEvents: "none" }} />;

export const Bg: React.FC<{ dark?: boolean; color?: string; children?: React.ReactNode }> = ({ dark, color, children }) => (
  <AbsoluteFill style={{ background: color ?? (dark ? C.ink : C.paper), overflow: "hidden" }}>{children}</AbsoluteFill>
);
