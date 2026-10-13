import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { useL } from "../lib/layout";
import { backOut, ease, easeIn, easeInOut, env, expoOut, map, shake, tw } from "../lib/anim";
import { Bg, Glow } from "../components/Atmos";
import { Caret, Chars, It, glitch, serifStyle } from "../components/Type";
import { Cam, SlideBlur, Slices } from "../components/Fx";
import { CodePlane, FlyWords } from "../components/Motion";
import { shouldnt } from "../lib/geo";
import { useFontsReady } from "../lib/measure";

const LOG = [
  "# session A · implement refresh-token rotation",
  "edit    src/auth/tokens.py",
  "add     rotate_refresh_token()",
  "run     pytest -q",
  "✓ 12 passed in 3.4s",
  "decide  rotate on every refresh",
  "edit    src/auth/session.py",
  "note    old token stays valid for 30s",
  "run     pytest tests/test_auth.py",
  "✕ 1 failed  test_expiry",
  "fix     clock skew in expiry check",
  "✓ 13 passed",
  "read    src/auth/middleware.py",
  "todo    refresh-token tests",
  "edit    README.md",
  "run     pytest -q",
  "✓ 13 passed in 3.6s",
  "decide  store hash, never the token",
];

/* ───────────── S1 · the context window fills up (0:00–0:02) ───────────── */
export const S1Fill: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  const pct = map(f, 0, 96, 71, 100, (t) => t * 0.55 + t * t * 0.45);
  const full = f >= 96;
  const col = interpolateColors(pct, [71, 90, 97, 100], [C.ink, C.ink, C.reviewD, C.blockedD]);
  const scroll = f * 5 + f * f * 0.05;
  const drop = tw(f, 102, 18, easeIn);
  const glitchAmt = full ? Math.max(env(f, 97, 106, 1, 6), env(f, 109, 120, 2, 4) * 0.8) : 0;
  const [sx, sy] = shake(f, 97, 12, 20, 3);
  const meterY = pick(0.54 * H, 0.5 * H);
  const big = pick(400, 320);
  return (
    <Bg>
      <Glow color="rgba(108,150,255,0.22)" x={0.12} y={0.1} r={0.55} />
      <Glow color="rgba(225,29,72,0.16)" x={0.5} y={0.5} r={0.7} opacity={tw(f, 94, 14)} />
      <Slices amount={glitchAmt} seed={2}>
        <Cam z={map(f, 0, 120, 1.0, 1.07)} x={sx} y={sy}>
          <CodePlane lines={LOG} scroll={scroll} W={W} H={H} top={meterY + 20} size={pick(34, 26)} drop={drop} startX={pick(0.22, 0.28)} />
          <div style={{ position: "absolute", left: 0, right: 0, top: meterY - big * 1.02 - 40, textAlign: "center", color: col }}>
            <div style={{ fontFamily: F.mono, fontSize: pick(20, 20), letterSpacing: "0.32em", textTransform: "uppercase", color: C.mute, opacity: tw(f, 0, 20) }}>
              Context window · session A
            </div>
            <div style={{ ...serifStyle(big, { lineHeight: 1, letterSpacing: "-0.05em" }), fontVariantNumeric: "tabular-nums", marginTop: 6, transform: `scale(${1 + (full ? 0.04 * (1 - tw(f, 96, 14)) : 0)})` }}>
              {Math.floor(pct)}
              <span style={{ fontStyle: "italic", fontSize: "0.6em" }}>%</span>
            </div>
          </div>
          {/* edge-to-edge meter */}
          <div style={{ position: "absolute", left: 0, width: W, top: meterY, height: 10, background: "rgba(12,14,19,0.08)" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: col }} />
          </div>
          {full && (
            <div style={{ position: "absolute", left: 0, right: 0, top: meterY + 30, textAlign: "center", fontFamily: F.mono, fontWeight: 600, fontSize: pick(26, 24), letterSpacing: "0.4em", color: C.blockedD, opacity: tw(f, 98, 4) }}>
              LIMIT REACHED · SESSION ENDED
            </div>
          )}
        </Cam>
      </Slices>
    </Bg>
  );
};

/* ───────────── S2 · New session. No memory. (0:02–0:04) ───────────── */
const QUESTIONS = [
  { text: "what's already done?", at: 30, x: -0.95, y: -0.8 },
  { text: "which tests passed?", at: 40, x: 0.95, y: -0.72 },
  { text: "why this approach?", at: 50, x: -0.92, y: 0.8 },
  { text: "what's next?", at: 60, x: 0.9, y: 0.82 },
  { text: "where was I?", at: 70, x: 0.1, y: -1.05 },
  { text: "is it safe to edit?", at: 80, x: -0.15, y: 1.05 },
];

export const S2Blank: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  const size = pick(250, 168);
  const pIn = (at: number) => tw(f, at, 26, expoOut);
  const vel = (at: number) => Math.abs(tw(f + 1, at, 26, expoOut) - tw(f, at, 26, expoOut));
  const out = tw(f, 106, 14, easeIn);
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.10)" x={0.5} y={0.95} r={0.6} />
      <FlyWords items={QUESTIONS} W={W} H={H} size={pick(46, 40)} color={C.mute} />
      {f < 8 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 60, color: C.ink }}>
          <Caret />
        </AbsoluteFill>
      )}
      <Cam z={1 + out * 0.35} style={{ opacity: 1 - out, filter: out > 0 ? `blur(${out * 10}px)` : undefined }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.ink }}>
          <div style={serifStyle(size, { lineHeight: 1, whiteSpace: "nowrap" })}>
            <SlideBlur id="s2-new" dx={(1 - pIn(4)) * -W * 0.7} blur={vel(4) * W * 0.25}>
              New
            </SlideBlur>{" "}
            <SlideBlur id="s2-session" dx={(1 - pIn(8)) * W * 0.7} blur={vel(8) * W * 0.25}>
              session.
            </SlideBlur>
          </div>
          <div style={{ ...serifStyle(size, { lineHeight: 1.04, whiteSpace: "nowrap" }), ...glitch(f, 30, 34, 1.3), ...glitch(f, 78, 14, 0.8) }}>
            <It>
              <Chars text="No memory." at={26} stagger={2} dur={26} blur={22} rise={-0.6} />
            </It>
          </div>
        </AbsoluteFill>
      </Cam>
    </Bg>
  );
};

/* ───────────── S3 · sessions can END. context shouldn't. (0:04–0:08) ───────────── */
export const S3Kinetic: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, portrait } = useL();
  useFontsReady();
  const small = pick(118, 96);
  const huge = pick(560, 400);

  // part 1: "Your AI coding sessions can" then END. sliced in two
  const lift = tw(f, 30, 26, ease);
  const endIn = tw(f, 30, 22, backOut(1.3));
  const knife = tw(f, 60, 10, easeInOut);
  const split = tw(f, 70, 34, easeIn);
  const part1Out = tw(f, 104, 14);

  // part 2: "Your engineering context" then shouldn't + the dot we fly into
  const sh = shouldnt(W, H, portrait);
  const slam = tw(f, 180, 18, expoOut);
  const lift2 = tw(f, 180, 24, ease);
  const zoom = tw(f, 194, 46, (t) => t * t * t);
  const z = Math.pow(sh.zoom, zoom);
  const dimRest = tw(f, 204, 20);

  const word = (w: string, at: number, extra?: React.CSSProperties) => {
    const p = tw(f, at, 22, expoOut);
    return (
      <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.04em 0.14em", margin: "-0.06em -0.04em -0.14em" }}>
        <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, ...extra }}>{w}</span>
      </span>
    );
  };
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.12)" x={0.5} y={0.82} r={0.6} opacity={tw(f, 170, 30)} />
      {f < 122 && (
        <AbsoluteFill style={{ opacity: 1 - part1Out }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.3 * H, 0.32 * H) - lift * pick(0.17 * H, 0.14 * H), textAlign: "center", color: C.ink, transform: `scale(${1 - lift * 0.3})`, ...serifStyle(small, { lineHeight: 1.02 }) }}>
            <div>
              {word("Your", 0)} {word("AI", 4)} {word("coding", 8)}
              {portrait ? <br /> : " "}
              {word("sessions", 12)} {word("can", 18, { fontStyle: "italic" })}
            </div>
          </div>
          {f >= 30 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.36 * H, 0.38 * H), height: huge, textAlign: "center" }}>
              {[0, 1].map((half) => (
                <div
                  key={half}
                  style={{
                    position: "absolute",
                    inset: 0,
                    ...serifStyle(huge, { lineHeight: 1, letterSpacing: "-0.05em", color: C.ink }),
                    clipPath: half === 0 ? "inset(0 0 46% 0)" : "inset(54% 0 0 0)",
                    transform: `translate(${(half ? 1 : -1) * split * W * 0.22}px, ${(half ? 1 : -1) * split * 60}px) rotate(${(half ? 1 : -1) * split * 4}deg) scale(${1.25 - 0.25 * endIn})`,
                    opacity: Math.min(1, endIn * 1.5) * (1 - split),
                    filter: endIn < 0.98 ? `blur(${(1 - endIn) * 14}px)` : undefined,
                  }}
                >
                  END.
                </div>
              ))}
              {knife > 0 && split < 1 && (
                <div style={{ position: "absolute", left: W * 0.08, top: huge * 0.5 - 4, height: 8, width: W * 0.84 * knife, background: C.signal, borderRadius: 8, opacity: 1 - split, boxShadow: "0 0 30px rgba(255,74,28,0.6)" }} />
              )}
            </div>
          )}
        </AbsoluteFill>
      )}
      {f >= 118 && (
        <Cam z={z} origin={`${sh.dotX}px ${sh.dotY}px`}>
          <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.36 * H, 0.38 * H) - lift2 * pick(0.12 * H, 0.1 * H), textAlign: "center", color: C.ink, opacity: 1 - dimRest, ...serifStyle(small, { lineHeight: 1.02 }) }}>
            {word("Your", 120)} {word("engineering", 128)}
            {portrait ? <br /> : " "}
            {word("context", 140)}
          </div>
          {f >= 180 && (
            <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <g opacity={Math.min(1, slam * 1.4)} transform={`translate(${sh.dotX} ${sh.dotY}) scale(${1.3 - 0.3 * slam}) translate(${-sh.dotX} ${-sh.dotY})`}>
                {(() => {
                  // SVG text ignores text-shadow, so the RGB split is drawn as two offset copies
                  const gl = Math.max(0, 1 - (f - 182) / 26) * (f >= 182 ? 1 : 0);
                  const jx = gl > 0 ? (Math.sin(f * 2.7) * 14 + 6) * gl : 0;
                  const t = (fill: string, dx: number, op: number) => (
                    <text x={sh.x + dx} y={sh.baseline} fontFamily="Instrument Serif" fontStyle="italic" fontSize={sh.size} letterSpacing={sh.ls} fill={fill} opacity={op}>
                      shouldn&apos;t
                    </text>
                  );
                  return (
                    <>
                      {gl > 0 && t("rgba(0,229,255,0.85)", jx + 12 * gl, 1 - dimRest)}
                      {gl > 0 && t("rgba(255,45,111,0.85)", jx - 12 * gl, 1 - dimRest)}
                      {t(C.signal, jx, 1 - dimRest * 0.9)}
                    </>
                  );
                })()}
                <circle cx={sh.dotX} cy={sh.dotY} r={sh.r} fill={C.signal} />
              </g>
            </svg>
          )}
        </Cam>
      )}
    </Bg>
  );
};
