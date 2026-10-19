import React from "react";
import { AbsoluteFill, Html5Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { backOut, clamp, easeIn, easeInOut, expoOut, hash, lerp, map, shake, tw } from "../lib/anim";
import { Grain } from "../components/Atmos";

/* A friendly roast in meme style: 1080x1920 at 30 fps, 39 s.
   All captions are original Telugu lines (with a small English gloss) that nod to common Telugu meme
   formats. Names are never used, so the same cut works for any friend: edit TEXT below to personalise. */

export const ROAST_FPS = 30;
const FONT_EN = '"Inter Variable", system-ui, sans-serif';
const Y = "#ffd400", PINK = "#ff3d71", INK = "#15151a", MINT = "#27d3a2", BLUE = "#3a5bff";

export const SCENES = {
  intro: [0, 150],
  v1: [150, 255],
  v2: [255, 330],
  v3: [330, 420],
  v4: [420, 510],
  board: [510, 660],
  replay: [660, 780],
  lake: [780, 930],
  card: [930, 1050],
} as const;
export const ROAST_FRAMES = 1050;

const outline = (px: number, c = "#000") => [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].map(([x, y]) => `${x * px}px ${y * px}px 0 ${c}`).join(",");

/** Halftone-dot backdrop in a flat colour. */
const Backdrop: React.FC<{ color: string; dots?: string; shift?: number }> = ({ color, dots = "rgba(0,0,0,0.13)", shift = 0 }) => (
  <AbsoluteFill style={{ background: color, backgroundImage: `radial-gradient(${dots} 4px, transparent 5px)`, backgroundSize: "34px 34px", backgroundPosition: `${shift}px ${shift * 0.6}px` }} />
);

/** Two-line meme caption (Telugu + English gloss). `at`/`out` are local frames. */
const Caption: React.FC<{ te: string; at?: number; out?: number; y?: number; size?: number; tint?: string }> = ({ te, at = 0, out, y = 290, size = 64, tint = Y }) => {
  const f = useCurrentFrame();
  const p = tw(f, at, 14, backOut(2.2));
  const o = out == null ? 1 : 1 - tw(f, out, 8);
  if (f < at || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", opacity: o, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -4}deg)` }}>
      <div style={{ fontFamily: FONT_EN, fontWeight: 900, fontSize: size * 1.28, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", textShadow: `${outline(5)}, 0 8px 0 #000` }}>{te}</div>
    </div>
  );
};

/** Framed media card. */
const Card: React.FC<{ w: number; h: number; top: number; tilt?: number; enter?: number; children: React.ReactNode; shakeAt?: number }> = ({ w, h, top, tilt = -2, enter = 0, children, shakeAt }) => {
  const f = useCurrentFrame();
  const p = tw(f, enter, 18, backOut(1.5));
  const [sx, sy] = shakeAt == null ? [0, 0] : shake(f, shakeAt, 16, 14, 3);
  return (
    <div style={{ position: "absolute", left: (1080 - w) / 2 + sx, top: top + sy + (1 - p) * 900, width: w, height: h, transform: `rotate(${tilt * p + (1 - p) * 6}deg)`, background: "#fff", padding: 14, borderRadius: 26, boxShadow: "0 40px 0 -10px rgba(0,0,0,0.18), 0 30px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 14, background: "#000" }}>{children}</div>
    </div>
  );
};

const Sticker: React.FC<{ at: number; out?: number; x: number; y: number; rot?: number; bg?: string; fg?: string; children: React.ReactNode; size?: number }> = ({ at, out, x, y, rot = -6, bg = PINK, fg = "#fff", children, size = 40 }) => {
  const f = useCurrentFrame();
  const p = tw(f, at, 12, backOut(3));
  const o = out == null ? 1 : 1 - tw(f, out, 6);
  if (f < at || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${p})`, opacity: o, background: bg, color: fg, border: "5px solid #000", borderRadius: 18, padding: "10px 22px", fontFamily: FONT_EN, fontWeight: 800, fontSize: size, lineHeight: 1.3, textAlign: "center", boxShadow: "6px 8px 0 #000", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const a = Math.max(0, 1 - (f - at) / 6) * (f >= at ? 1 : 0);
  return a > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: a * 0.8 }} /> : null;
};

/* ───────────── scenes ───────────── */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop color={Y} shift={f * 0.5} />
      <Card w={880} h={1042} top={500} enter={0} tilt={-2}>
        <Img src={staticFile("roast/photo1.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${map(f, 0, 150, 1.0, 1.14)})`, transformOrigin: "52% 55%" }} />
      </Card>
      <Caption te="Meet our hero: Erri Hook Jeevan" at={4} out={66} size={64} />
      <Caption te="Hero entry music: ON. Hero entry speed: 40." at={72} size={56} />
      <Sticker at={90} x={780} y={560} bg={MINT} fg={INK} rot={7}>MASS!</Sticker>
      <Sticker at={110} x={300} y={1420} bg="#fff" fg={INK} rot={-5} size={34}>Aura: 100%</Sticker>
    </AbsoluteFill>
  );
};

const Drive: React.FC<{ from: number; dur: number; rate?: number; zoom?: [number, number, number, number]; children?: React.ReactNode; bg: string; shakeAt?: number }> = ({ from, dur, rate = 1, zoom, children, bg, shakeAt }) => {
  const f = useCurrentFrame();
  let z = 1, ox = 50, oy = 50;
  if (zoom) {
    const [a, b, s, fy] = zoom;
    z = 1 + (s - 1) * Math.min(tw(f, a, 8, expoOut), 1 - tw(f, b, 10, easeInOut));
    ox = 40; oy = fy;
  }
  return (
    <AbsoluteFill>
      <Backdrop color={bg} shift={f * 0.6} />
      <Card w={900} h={997} top={505} tilt={-1.5} enter={0} shakeAt={shakeAt}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }}>
          <OffthreadVideo src={staticFile("roast/drive.mp4")} trimBefore={from} trimAfter={from + Math.round(dur * rate)} playbackRate={rate} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {children}
      </Card>
    </AbsoluteFill>
  );
};

const V1: React.FC = () => {
  const f = useCurrentFrame();
  const ring = tw(f, 22, 10, backOut(2));
  return (
    <>
      <Drive from={0} dur={105} bg={BLUE} zoom={[22, 70, 2.3, 80]}>
        {f >= 22 && f < 76 && <div style={{ position: "absolute", left: "17%", top: "69%", width: "46%", height: "21%", border: `8px solid ${PINK}`, borderRadius: 30, transform: `scale(${ring})`, boxShadow: "0 0 0 6px #000" }} />}
      </Drive>
      <Caption te="Pushpa: 'Thaggede le!'  Him: 'Speed thagginchanu le.'" at={6} out={96} size={50} />
      <Sticker at={30} out={76} x={760} y={1310} bg={PINK} rot={-5} size={46}>MIND BLOCK!</Sticker>
      <Sticker at={80} x={330} y={1300} bg="#fff" fg={INK} rot={5} size={34}>Paapam ra babu</Sticker>
      <Flash at={22} />
    </>
  );
};
const V2: React.FC = () => (
  <>
    <Drive from={105} dur={75} bg={PINK} shakeAt={14} />
    <Caption te="RTC bus: 'Sorry anna, hurry undhi.'  Hero: 'Parledu thammudu, naaku EMI undhi.'" at={4} size={42} />
    <Sticker at={10} x={300} y={1180} bg={Y} fg={INK} rot={-7} size={40}>ANNA!</Sticker>
    <Flash at={12} />
  </>
);
const V3: React.FC = () => (
  <>
    <Drive from={180} dur={90} bg={MINT} />
    <Caption te="Why did Kattappa kill Baahubali? Because he said 'inka 5 minutes ra, vasthunna.'" at={4} size={42} />
    <Sticker at={30} x={540} y={760} bg={Y} fg={INK} rot={4} size={36}>Kattappa be like...</Sticker>
  </>
);
const V4: React.FC = () => (
  <>
    <Drive from={270} dur={90} bg={Y} />
    <Caption te="Maps: 'Turn left.'  Him: 'Wait, mentally ready avvali.'" at={4} size={48} />
    <Sticker at={46} x={540} y={1180} bg={PINK} rot={-4} size={40}>ETA: next birthday</Sticker>
    <Flash at={46} />
  </>
);

const Board: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, number, string][] = [
    ["Bus", 70, PINK],
    ["Train", 60, BLUE],
    ["Auto", 50, MINT],
    ["Our hero", 40, Y],
  ];
  return (
    <AbsoluteFill>
      <Backdrop color={INK} dots="rgba(255,255,255,0.07)" shift={f * 0.4} />
      <Caption te="Highway race results (source: vibes)" at={0} size={68} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 560 }}>
        {rows.map(([n, v, c], i) => {
          const p = tw(f, 14 + i * 18, 40, expoOut);
          return (
            <div key={n} style={{ marginBottom: 46 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_EN, fontWeight: 800, fontSize: 46, color: "#fff", marginBottom: 10 }}>
                <span>{i === 0 ? "1. " : i === 3 ? "4. " : `${i + 1}. `}{n}</span>
                <span style={{ color: c }}>{Math.round(v * p)} km/h</span>
              </div>
              <div style={{ height: 52, background: "rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", border: "3px solid #000" }}>
                <div style={{ width: `${(v / 70) * 100 * p}%`, height: "100%", background: c }} />
              </div>
            </div>
          );
        })}
      </div>
      <Sticker at={92} x={540} y={1330} bg={PINK} rot={-4} size={44}>Last place... but Mastu shades unnay ra!</Sticker>
    </AbsoluteFill>
  );
};

const Replay: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 12) % 2 === 0;
  return (
    <>
      <Drive from={105} dur={120} rate={0.5} bg={INK} />
      <Caption te="Instant replay.  Hero: 'Em jarigindi ra ippudu?'" at={4} size={52} />
      <Sticker at={0} x={300} y={540} bg="#fff" fg={INK} rot={-3} size={38}>
        <span style={{ color: PINK, opacity: blink ? 1 : 0.2 }}>● </span>INSTANT REPLAY 0.5×
      </Sticker>
      <Flash at={0} />
    </>
  );
};

const Lake: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop color={MINT} shift={-f * 0.5} />
      <Card w={840} h={1057} top={500} enter={0} tilt={2}>
        <Img src={staticFile("roast/photo2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${map(f, 0, 150, 1.0, 1.12)})`, transformOrigin: "45% 45%" }} />
      </Card>
      <Caption te="Friends: 'Ra bro, speed boat ekkudam.'  Him: 'Nenu 40 ki ekkuva ekkanu.'" at={4} out={72} size={44} />
      <Caption te="Photo: 100 likes. Driving: 100 horn honks." at={78} size={48} />
      <Sticker at={96} x={820} y={620} bg={Y} fg={INK} rot={8} size={34}>Aura +1000</Sticker>
    </AbsoluteFill>
  );
};

const Report: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, string, string][] = [
    ["Driving speed", "40/100", PINK],
    ["Patience", "100/100", MINT],
    ["Excuses", "100/100", MINT],
    ["Late to meetups", "100/100", MINT],
  ];
  const stamp = tw(f, 74, 14, backOut(2.4));
  return (
    <AbsoluteFill>
      <Backdrop color={PINK} shift={f * 0.6} />
      <Caption te="Report card" at={0} size={78} y={290} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, background: "#fff", border: "6px solid #000", borderRadius: 26, padding: "40px 44px", boxShadow: "12px 14px 0 #000" }}>
        {rows.map(([n, v, c], i) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: FONT_EN, fontWeight: 800, fontSize: 46, color: INK, padding: "20px 0", borderBottom: i < rows.length - 1 ? "3px dashed rgba(0,0,0,0.25)" : undefined, opacity: tw(f, 10 + i * 10, 10), transform: `translateX(${(1 - tw(f, 10 + i * 10, 14, expoOut)) * 80}px)` }}>
            <span>{n}</span>
            <span style={{ color: c, fontFamily: FONT_EN, fontWeight: 900, fontSize: 52 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 540, top: 1260, transform: `translate(-50%, -50%) rotate(${-14 + 8 * stamp}deg) scale(${2.4 - 1.4 * stamp})`, opacity: tw(f, 74, 4), border: "10px solid #fff", borderRadius: 24, padding: "10px 36px", fontFamily: FONT_EN, fontWeight: 800, fontSize: 64, color: "#fff", textShadow: outline(4), background: "rgba(0,0,0,0.25)", textAlign: "center", lineHeight: 1.3 }}>
        PASSED!
        <div style={{ fontSize: 34 }}>(barely)</div>
      </div>
    </AbsoluteFill>
  );
};

const MAP: Record<keyof typeof SCENES, React.FC> = { intro: Intro, v1: V1, v2: V2, v3: V3, v4: V4, board: Board, replay: Replay, lake: Lake, card: Report };

export const Roast: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: INK }}>
    {(Object.keys(SCENES) as (keyof typeof SCENES)[]).map((k) => {
      const [a, b] = SCENES[k];
      const C = MAP[k];
      return (
        <Sequence key={k} from={a} durationInFrames={b - a} name={k} premountFor={20}>
          <C />
        </Sequence>
      );
    })}
    <Grain opacity={0.08} />
    {withAudio && <Html5Audio src={staticFile("audio/roast.flac")} />}
  </AbsoluteFill>
);
