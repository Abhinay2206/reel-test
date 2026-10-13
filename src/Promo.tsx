import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { C } from "./theme";
import TL from "./timeline.json";
import { Grain, Vignette } from "./components/Atmos";
import { Hud } from "./components/Hud";
import { S1Fill, S2Blank, S3Kinetic } from "./scenes/ActI";
import { S5Bridge, S7How } from "./scenes/ActII";
import { S8Reality, S9Verdicts, S10OneVerdict, S11Provenance } from "./scenes/ActIII";
import { S12BenchTitle, S13Accuracy, S14Oracle, S15Speed, S16TokenQ, S17Tokens, S18Growth, S19Secrets, S20Zero } from "./scenes/Bench";
import { S21Works, S22End } from "./scenes/Close";

type SceneKey = keyof typeof TL.scenes;

const SCENES: Record<SceneKey, React.FC> = {
  terminal: S1Fill,
  noMemory: S2Blank,
  statement: S3Kinetic,
  bridge: S5Bridge,
  how: S7How,
  reality: S8Reality,
  verdicts: S9Verdicts,
  oneVerdict: S10OneVerdict,
  provenance: S11Provenance,
  benchTitle: S12BenchTitle,
  accuracy: S13Accuracy,
  oracle: S14Oracle,
  speed: S15Speed,
  tokenQ: S16TokenQ,
  tokens: S17Tokens,
  growth: S18Growth,
  secrets: S19Secrets,
  zero: S20Zero,
  works: S21Works,
  end: S22End,
};

export const Promo: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {(Object.keys(TL.scenes) as SceneKey[]).map((key) => {
        const Comp = SCENES[key];
        const [a, b] = TL.scenes[key];
        return (
          <Sequence key={key} from={a} durationInFrames={b - a} name={key} premountFor={30}>
            <Comp />
          </Sequence>
        );
      })}
      <Hud />
      <Vignette />
      <Grain opacity={0.12} />
      {withAudio && <Html5Audio src={staticFile("audio/score.flac")} />}
    </AbsoluteFill>
  );
};
