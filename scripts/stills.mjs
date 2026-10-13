// Render a set of frames as stills for quick review, bundling once.
// usage: node scripts/stills.mjs <CompositionId> <outDir> <scale> <frame> [frame...]
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [, , id, outDir, scaleArg, ...frames] = process.argv;
const browserExecutable =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  ["/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"].find((p) => fs.existsSync(p)) ??
  null;
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance });
for (const f of frames) {
  const output = path.join(outDir, `${id}_${String(f).padStart(4, "0")}.jpg`);
  await renderStill({ composition, serveUrl, output, frame: Number(f), imageFormat: "jpeg", jpegQuality: 88, scale: Number(scaleArg), puppeteerInstance });
  console.log(output);
}
await puppeteerInstance.close({ silent: true });
