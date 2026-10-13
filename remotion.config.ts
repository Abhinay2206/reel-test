import fs from "node:fs";
import { Config } from "@remotion/cli/config";

// Frames are rendered as high-quality JPEGs and encoded to H.264 with a low CRF.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(17);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
Config.setOverwriteOutput(true);

// Use a locally installed Chromium when one is provided (e.g. in CI or a sandbox without network access).
const browser =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  ["/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"].find((p) => fs.existsSync(p));
if (browser) Config.setBrowserExecutable(browser);
