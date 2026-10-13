import { ArcGeom } from "../components/Motion";
import { measure } from "./measure";

/** The arc keeps the ContextBridge mark's proportions: in the 76×48 logo the apex rises 23 over a 68 span. */
export const ARC_RATIO = 23 / 68;

export function arcGeom(x0: number, x1: number, deckY: number): ArcGeom {
  return { x0, x1, deckY, apexY: deckY - (x1 - x0) * ARC_RATIO };
}

/** The hero arc used when the bridge first forms (0:08). */
export const heroArc = (W: number, H: number, portrait: boolean) =>
  portrait ? arcGeom(0.1 * W, 0.9 * W, 0.6 * H) : arcGeom(0.15 * W, 0.85 * W, 0.76 * H);

/** "shouldn't." with its full stop drawn as a disc, so the camera can fly into the dot (0:07) and the
 *  dot can become the first node of the bridge (0:08). Shared by both scenes for a seamless match cut. */
export function shouldnt(W: number, H: number, portrait: boolean) {
  const size = portrait ? 300 : 420;
  const font = `italic 400 ${size}px "Instrument Serif"`;
  const ls = -0.03 * size;
  const m = measure("shouldn't", font, ls);
  const r = size * 0.085;
  const gap = size * 0.03;
  const total = m.w + gap + r * 2;
  const x = W / 2 - total / 2;
  const baseline = portrait ? H * 0.6 : H * 0.7;
  return { size, font, ls, x, baseline, dotX: x + m.w + gap + r, dotY: baseline - r, r, zoom: 6.5 };
}

/** Where the arc lands when it becomes the logo mark next to (16:9) or above (9:16) the wordmark. */
export function logoLayout(W: number, H: number, portrait: boolean, size: number, baseline: number) {
  const ls = -0.045 * size;
  const a = measure("Context", `400 ${size}px "Instrument Serif"`, ls).w;
  const b = measure("Bridge", `italic 400 ${size}px "Instrument Serif"`, ls).w;
  const wordW = a + b;
  const markW = portrait ? size * 1.05 : size * 0.95;
  const span = markW * (68 / 76);
  if (portrait) {
    const deckY = baseline - size * 0.98;
    const x0 = W / 2 - span / 2;
    return { wordX: W / 2 - wordW / 2, wordW, mark: arcGeom(x0, x0 + span, deckY), markW };
  }
  const gap = size * 0.2;
  const total = markW + gap + wordW;
  const left = W / 2 - total / 2;
  const x0 = left + markW * (4 / 76);
  return { wordX: left + markW + gap, wordW, mark: arcGeom(x0, x0 + span, baseline - size * 0.1), markW };
}

/** Transform that maps `from` onto `to` (uniform scale), for morphing the big arc into the mark. */
export function arcView(from: ArcGeom, to: ArcGeom, k: number) {
  const s1 = (to.x1 - to.x0) / (from.x1 - from.x0);
  const s = Math.pow(s1, k); // geometric, so the shrink feels like a camera move
  // keep node A moving on a straight line from its start to its target
  const ax = from.x0 + (to.x0 - from.x0) * k, ay = from.deckY + (to.deckY - from.deckY) * k;
  return { s, tx: ax - from.x0 * s, ty: ay - from.deckY * s };
}

/** Distance from the top of a `line-height: 1` box to the text baseline, for placing DOM text on a baseline. */
export function baselineOffset(size: number, font: string) {
  const m = measure("Hxg", font);
  return (size - (m.asc + m.desc)) / 2 + m.asc;
}
