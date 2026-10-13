import { Easing, interpolate } from "remotion";

// The site's signature curve: cubic-bezier(0.16, 1, 0.3, 1).
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.83, 0, 0.17, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const backOut = (s = 1.7) => (t: number) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 between `start` and `start + dur` frames, eased. */
export function tw(frame: number, start: number, dur: number, easing: (t: number) => number = ease) {
  if (dur <= 0) return frame >= start ? 1 : 0;
  return interpolate(frame, [start, start + dur], [0, 1], { ...clampOpts, easing });
}

/** Linear map with clamping. */
export function map(v: number, inA: number, inB: number, outA: number, outB: number, easing?: (t: number) => number) {
  return interpolate(v, [inA, inB], [outA, outB], { ...clampOpts, easing });
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Small, fast, deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic hash of an integer to [0, 1). */
export function hash(n: number) {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** A decaying shake: returns [x, y] offsets in px for an impact at `at`. */
export function shake(frame: number, at: number, amp = 14, dur = 22, seed = 1) {
  const t = frame - at;
  if (t < 0 || t > dur) return [0, 0] as const;
  const k = Math.pow(1 - t / dur, 2);
  return [Math.sin(t * 2.7 + seed) * amp * k, Math.cos(t * 3.3 + seed * 2) * amp * 0.7 * k] as const;
}

/** Envelope that rises over `a` frames, holds, then falls over `b` frames before `end`. */
export function env(frame: number, start: number, end: number, a = 12, b = 12, easing: (t: number) => number = ease) {
  return Math.min(tw(frame, start, a, easing), 1 - tw(frame, end - b, b, easeIn));
}

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
