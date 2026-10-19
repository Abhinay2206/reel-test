import React from "react";
import { Composition, Still } from "remotion";
import "./fonts";
import { Promo } from "./Promo";
import { Cover } from "./Cover";
import { Roast, ROAST_FPS, ROAST_FRAMES } from "./roast/Roast";
import TL from "./timeline.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo16x9" component={Promo} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1920} height={1080} />
    <Composition id="Promo9x16" component={Promo} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    <Composition id="Roast9x16" component={Roast} durationInFrames={ROAST_FRAMES} fps={ROAST_FPS} width={1080} height={1920} />
    <Still id="Cover9x16" component={Cover} width={1080} height={1920} />
    <Still id="Cover16x9" component={Cover} width={1920} height={1080} />
  </>
);
