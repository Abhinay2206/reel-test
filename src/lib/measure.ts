import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { fontsReady } from "../fonts";

let loaded = false;
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, { w: number; asc: number; desc: number }>();

/** Holds the frame until the brand fonts are loaded, so text can be measured with real metrics. */
export function useFontsReady() {
  const [ready, setReady] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender("fonts for text measurement")));
  useEffect(() => {
    if (ready) return;
    fontsReady.then(() => {
      loaded = true;
      setReady(true);
      if (handle !== null) continueRender(handle);
    });
  }, [ready, handle]);
  return ready;
}

/** Width and vertical metrics of a string in a CSS font, e.g. `italic 400 420px "Instrument Serif"`. */
export function measure(text: string, font: string, letterSpacing = 0) {
  const key = `${font}|${letterSpacing}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = font;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
  const m = ctx.measureText(text);
  const r = { w: m.width, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  if (loaded) cache.set(key, r);
  return r;
}
