import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-hosted copies of the site's fonts (Instrument Serif, Inter Variable, JetBrains Mono Variable).
// loadFont() holds rendering until each face is ready, so no frame is drawn with a fallback font.
export const fontsReady = Promise.all([
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Regular.woff2"), weight: "400", style: "normal" }),
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic" }),
  loadFont({ family: "Inter Variable", url: staticFile("fonts/InterVariable.woff2"), weight: "100 900", style: "normal" }),


  loadFont({ family: "JetBrains Mono Variable", url: staticFile("fonts/JetBrainsMonoVariable.woff2"), weight: "100 800", style: "normal" }),
]);
