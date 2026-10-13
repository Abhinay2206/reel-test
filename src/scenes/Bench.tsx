import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { useL } from "../lib/layout";
import { backOut, easeIn, easeInOut, expoOut, fmt, hash, map, shake, tw } from "../lib/anim";
import { Bg, Flash, Glow } from "../components/Atmos";
import { Count, It, serifStyle } from "../components/Type";
import { Cam } from "../components/Fx";
import { Dial, DotSwarm, Odometer, Strike, TextWall } from "../components/Motion";
import { MaskLine } from "./ActIII";
import { measure, useFontsReady } from "../lib/measure";
import { FORMATS, GROWTH, ORIENT, REPORT, SECRETS } from "../data";

const mono = (size: number, color: string = C.mute, ls = "0.2em"): React.CSSProperties => ({ fontFamily: F.mono, fontSize: size, letterSpacing: ls, color, textTransform: "uppercase" });
const label = (size: number, color: string = C.ink2): React.CSSProperties => ({ fontFamily: F.sans, fontSize: size, lineHeight: 1.35, color, letterSpacing: "-0.01em" });
const fadeUp = (f: number, at: number, d = 26, dist = 18): React.CSSProperties => ({ opacity: tw(f, at, d), transform: `translateY(${(1 - tw(f, at, d)) * dist}px)` });

/** Paper lens: keeps type legible over busy backgrounds without a box. */
const Lens: React.FC<{ x?: number; y?: number; rx?: number; ry?: number; strength?: number }> = ({ x = 50, y = 50, rx = 42, ry = 34, strength = 0.94 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(${rx}% ${ry}% at ${x}% ${y}%, rgba(236,232,223,${strength}) 0%, rgba(236,232,223,${strength * 0.85}) 55%, rgba(236,232,223,0) 100%)` }} />
);

/* ───────────── S12 · claimed. → Measured, not claimed. (0:31.5–0:34) ───────────── */
export const S12BenchTitle: React.FC = () => {
  const f = useCurrentFrame();
  const { H, pick, portrait } = useL();
  useFontsReady();
  const size = pick(230, 160);
  const notW = measure("not ", `italic 400 ${size}px "Instrument Serif"`, -0.045 * size).w;
  const ins = tw(f, 14, 24, easeInOut);
  const strike = 1 - tw(f, 12, 14, easeInOut);
  const stats = [
    { v: "86", l: "labeled scenarios" },
    { v: "800", l: "randomized trials" },
    { v: "1,737,973", l: "lines of real code scanned" },
  ];
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.10)" x={0.8} y={0.15} r={0.55} />
      <Cam z={map(f, 0, 150, 1.0, 1.04)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: pick(0.16 * H, 0.2 * H), textAlign: "center", color: C.ink }}>
          <div style={{ ...mono(20), marginBottom: pick(26, 34), opacity: tw(f, 30, 20) }}>Benchmark report · v{REPORT.version}</div>
          <div style={serifStyle(size, { lineHeight: 0.92, letterSpacing: "-0.045em" })}>
            <MaskLine f={f} at={8}>Measured,</MaskLine>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-block", width: notW * ins, overflow: "hidden", verticalAlign: "bottom", opacity: ins }}>
                <It>not&nbsp;</It>
              </span>
              <span style={{ position: "relative", display: "inline-block" }}>
                <It>claimed.</It>
                {strike > 0.01 && <Strike p={strike} thickness={pick(12, 9)} />}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", justifyContent: "center", alignItems: "center", gap: pick(80, 30), marginTop: pick(70, 80) }}>
            {stats.map((s, i) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <Odometer text={s.v} at={44 + i * 8} dur={60} stagger={3} style={serifStyle(pick(84, 80), { letterSpacing: "-0.03em" })} />
                <div style={{ ...mono(16), marginTop: 10, ...fadeUp(f, 46 + i * 8) }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S13 · 85/86 on a ring of 86 ticks (0:34–0:36) ───────────── */
export const S13Accuracy: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  const R = pick(400, 420);
  const cx = W / 2, cy = pick(H * 0.52, H * 0.5);
  const n = REPORT.scenarios;
  const fill = tw(f, 6, 58, easeInOut) * n;
  const redP = tw(f, 66, 16, backOut(2.5));
  const redAng = ((n - 0.5) / n) * 360 - 90 + f * 0.12;
  const rx = cx + Math.cos((redAng * Math.PI) / 180) * (R + 40), ry = cy + Math.sin((redAng * Math.PI) / 180) * (R + 40);
  return (
    <Bg>
      <Glow color="rgba(5,150,105,0.14)" x={0.5} y={0.5} r={0.55} />
      <Cam z={map(f, 0, 120, 1.05, 1)}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`rotate(${f * 0.12} ${cx} ${cy})`}>
            {Array.from({ length: n }, (_, i) => {
              const a = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
              const on = fill > i;
              const isMiss = i === n - 1;
              const r1 = R - 34, r2 = R + (isMiss ? 22 * redP + 10 : 10);
              const color = !on ? "rgba(12,14,19,0.12)" : isMiss ? (redP > 0 ? C.blockedD : "rgba(12,14,19,0.12)") : C.readyD;
              return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={color} strokeWidth={isMiss ? 9 : 7} strokeLinecap="round" />;
            })}
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - pick(200, 190), textAlign: "center", color: C.ink }}>
          <div style={{ ...mono(18, C.readyD), ...fadeUp(f, 0) }}>Gate accuracy</div>
          <div style={{ marginTop: 6 }}>
            <Odometer text="85" at={4} dur={56} stagger={6} style={serifStyle(pick(290, 270), { letterSpacing: "-0.05em" })} />
            <span style={{ ...serifStyle(pick(120, 110), { color: C.mute, letterSpacing: "-0.03em" }), opacity: tw(f, 20, 16) }}>/86</span>
          </div>
          <div style={{ ...label(28), ...fadeUp(f, 18), marginTop: 6 }}>
            drift scenarios return
            <br />
            the expected verdict
          </div>
        </div>
        <div style={{ position: "absolute", left: rx + 14, top: ry - 40, ...mono(15, C.blockedD, "0.08em"), textTransform: "none", whiteSpace: "nowrap", opacity: tw(f, 72, 14), transform: `translateX(${(1 - tw(f, 72, 20)) * 20}px)` }}>
          1 miss: an unfetched remote, by design
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S14 · 800 dots swarm into a grid; one stays red (0:36–0:38) ───────────── */
export const S14Oracle: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, pad } = useL();
  const cols = pick(40, 25), rows = pick(20, 32);
  const gw = pick(860, W - pad * 2), gh = (gw / cols) * rows;
  const gx = pick(W - pad - gw, pad), gy = pick((H - gh) / 2 + 20, H * 0.4);
  return (
    <Bg>
      <Glow color="rgba(5,150,105,0.12)" x={0.7} y={0.5} r={0.6} />
      <Cam z={map(f, 0, 120, 1, 1.03)}>
        <div style={{ position: "absolute", left: gx, top: gy, width: gw, height: gh }}>
          <DotSwarm cols={cols} rows={rows} w={gw} h={gh} p={map(f, 0, 66, 0, 1)} red={REPORT.fuzzRedTrial} redPop={tw(f, 70, 22)} spreadW={W} spreadH={H} ox={gx} oy={gy} />
        </div>
        <div style={{ position: "absolute", left: pad, top: pick(0.26 * H, 0.1 * H), width: pick(700, W - pad * 2), color: C.ink }}>
          <div style={{ ...mono(18), ...fadeUp(f, 0) }}>Randomized testing</div>
          <div style={{ marginTop: 10 }}>
            <Odometer text="99.9%" at={4} dur={60} stagger={5} style={serifStyle(pick(260, 240), { letterSpacing: "-0.05em" })} />
          </div>
          <div style={{ ...label(32), ...fadeUp(f, 16), maxWidth: 620, marginTop: 6 }}>
            <b style={{ fontWeight: 600, color: C.ink }}>799 of 800</b> random git histories agree with an independent oracle.
          </div>
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S15 · 143 ms on a stopwatch, files streaking past (0:38–0:40) ───────────── */
const FILES = ["src/auth.py", "tests/test_auth.py", "src/api/routes.py", "README.md", "src/queue.py", "pyproject.toml", "src/db/models.py", "docs/guide.md", "src/auth/tokens.py", "scripts/build.sh"];
export const S15Speed: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, pad } = useL();
  const p = tw(f, 6, 54, easeInOut);
  const r = 300;
  return (
    <Bg>
      <Glow color="rgba(58,91,255,0.12)" x={0.7} y={0.5} r={0.6} />
      {/* streaking file names: 10,000 files go by */}
      <AbsoluteFill style={{ overflow: "hidden", opacity: 0.55 }}>
        {Array.from({ length: 22 }, (_, i) => {
          const y = (i + 0.5) * (H / 22);
          const speed = 26 + hash(i * 7) * 40;
          const x = W - ((f * speed + hash(i) * 3000) % (W + 900));
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, ...mono(15, "rgba(12,14,19,0.35)", "0.04em"), textTransform: "none", whiteSpace: "nowrap", filter: "blur(1.2px)" }}>
              {Array.from({ length: 4 }, (_, k) => FILES[Math.floor(hash(i * 13 + k) * FILES.length)]).join("   ")}
            </div>
          );
        })}
      </AbsoluteFill>
      <Lens x={pick(30, 50)} y={pick(48, 26)} rx={pick(36, 60)} ry={pick(50, 26)} />
      <Cam z={map(f, 0, 120, 1.03, 1)}>
        <div style={{ position: "absolute", left: pick(W - pad - r * 2 - 20, W / 2 - r), top: pick(H / 2 - r, H * 0.47), ...fadeUp(f, 0, 20, 30) }}>
          <Dial r={r} p={p} value={REPORT.speedMs} max={200} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.ink }}>
            <div style={serifStyle(150, { letterSpacing: "-0.04em", lineHeight: 0.9 })}>
              <Count to={REPORT.speedMs} at={6} dur={54} />
            </div>
            <div style={mono(20)}>milliseconds</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: pad, top: pick(0.32 * H, 0.12 * H), width: pick(760, W - pad * 2), color: C.ink }}>
          <div style={{ ...mono(18, C.blue), ...fadeUp(f, 0) }}>Speed</div>
          <div style={{ ...serifStyle(pick(118, 104), { lineHeight: 0.98 }), marginTop: 18 }}>
            <MaskLine f={f} at={2}>To check</MaskLine>
            <MaskLine f={f} at={8}>
              <It>10,000 files.</It>
            </MaskLine>
          </div>
          <div style={{ ...label(30), marginTop: 24, ...fadeUp(f, 18) }}>With 500 uncommitted changes.</div>
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S16 · a wall of git output builds with the riser (0:40–0:42) ───────────── */
export const S16TokenQ: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useL();
  const t = f / 60;
  const scroll = 80 * t + 260 * t * t * t;
  const dens = map(f, 0, 110, 0.3, 0.96);
  const [sx, sy] = shake(f, 70, 4 * tw(f, 70, 50), 50, 9);
  const tokens = map(f, 10, 116, 0, ORIENT.dump, (x) => x * x);
  return (
    <Bg>
      <Cam z={map(f, 0, 120, 1, 1.12, easeIn)} x={f > 70 ? sx : 0} y={f > 70 ? sy : 0}>
        <TextWall W={W} H={H} scroll={scroll} density={dens} collapse={0} size={pick(17, 16)} />
        <Lens rx={pick(40, 62)} ry={pick(36, 26)} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.ink }}>
          <div style={serifStyle(pick(110, 92), { lineHeight: 0.98 })}>
            <MaskLine f={f} at={0}>How much must a</MaskLine>
            <MaskLine f={f} at={6}>
              fresh agent <It>read?</It>
            </MaskLine>
          </div>
          <div style={{ marginTop: 30, ...serifStyle(pick(150, 130), { letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: C.mute }) }}>{fmt(tokens)}</div>
          <div style={{ ...mono(18), marginTop: 8 }}>tokens · git status + log + diff</div>
        </AbsoluteFill>
      </Cam>
    </Bg>
  );
};

/* ───────────── S17 · the wall collapses: 17.4× smaller (0:42–0:44, drop) ───────────── */
export const S17Tokens: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, pad } = useL();
  const collapse = tw(f, 0, 12, easeIn);
  const [sx, sy] = shake(f, 4, 22, 28, 6);
  const bars = [
    { k: "git status + log + diff", v: ORIENT.dump, c: "#8d93a3" },
    { k: "full resume", v: ORIENT.full, c: C.signal },
    { k: "resume --check", v: ORIENT.check, c: C.readyD },
  ];
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.14)" x={0.5} y={0.4} r={0.6} />
      {collapse < 1 && <TextWall W={W} H={H} scroll={400} density={0.96} collapse={collapse} size={pick(17, 16)} />}
      <Cam x={sx} y={sy} z={map(f, 0, 120, 1.06, 1, expoOut)}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: pick(0.1 * H, 0.14 * H), textAlign: "center", color: C.ink }}>
          <div style={{ ...mono(18, C.signal), ...fadeUp(f, 4) }}>Token cost · {ORIENT.repo}</div>
          <Odometer text="17.4×" at={6} dur={50} stagger={5} spins={1} style={{ ...serifStyle(pick(340, 270), { letterSpacing: "-0.05em" }), marginTop: 8 }} />
          <div style={serifStyle(pick(96, 80), { lineHeight: 1 })}>
            <MaskLine f={f} at={12}>
              smaller than <It>a git dump.</It>
            </MaskLine>
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: pad, width: W - pad * 2, top: pick(0.68 * H, 0.66 * H) }}>
          {bars.map((b, i) => {
            const p = tw(f, 16 + i * 6, 34, expoOut);
            return (
              <div key={b.k} style={{ marginTop: i ? 22 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", ...mono(17, C.ink2, "0.08em"), textTransform: "none", marginBottom: 8, opacity: tw(f, 16 + i * 6, 14) }}>
                  <span>{b.k}</span>
                  <span style={{ color: b.c === "#8d93a3" ? C.mute : b.c, fontWeight: 600 }}>{fmt(b.v * p)} tokens</span>
                </div>
                <div style={{ height: 14, background: "rgba(12,14,19,0.06)", borderRadius: 7 }}>
                  <div style={{ height: "100%", width: `${Math.max((b.v / ORIENT.dump) * 100 * p, p > 0 ? 0.8 : 0)}%`, background: b.c, borderRadius: 7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Cam>
      <Flash amount={map(f, 0, 14, 0.85, 0)} color="#ffffff" />
    </Bg>
  );
};

/* ───────────── S18 · flat as your project grows: a full-frame chart (0:44–0:46) ───────────── */
export const S18Growth: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick, pad } = useL();
  const L = pad, R = W - pad - pick(190, 150), T = pick(0.4 * H, 0.32 * H), B = pick(0.86 * H, 0.84 * H);
  const lx = (n: number) => L + ((Math.log10(n) - 1) / 2) * (R - L);
  const ly = (v: number) => B - ((Math.log10(v) - 2) / 3) * (B - T);
  const draw = tw(f, 8, 64, easeInOut);
  const series = [
    { k: "raw state.json, no cap", d: GROWTH.raw, c: "#8d93a3", dash: "14 12" },
    { k: "full resume", d: GROWTH.full, c: C.signal },
    { k: "HANDOFF.md", d: GROWTH.handoff, c: C.blue },
    { k: "resume --check", d: GROWTH.check, c: C.readyD },
  ];
  const clipW = L + (R - L) * draw;
  return (
    <Bg>
      <Glow color="rgba(5,150,105,0.12)" x={0.85} y={0.8} r={0.5} />
      <Cam z={map(f, 0, 120, 1.03, 1)}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <clipPath id="growclip">
              <rect x={0} y={0} width={clipW + 20} height={H} />
            </clipPath>
          </defs>
          {[100, 1000, 10000, 100000].map((v) => (
            <g key={v} opacity={tw(f, 0, 20)}>
              <line x1={L} x2={R} y1={ly(v)} y2={ly(v)} stroke="rgba(12,14,19,0.09)" strokeWidth={1.5} />
              <text x={L} y={ly(v) - 10} fontFamily="JetBrains Mono Variable" fontSize={15} fill={C.mute}>
                {fmt(v)}
              </text>
            </g>
          ))}
          {[10, 100, 1000].map((n) => (
            <text key={n} x={lx(n)} y={B + 34} textAnchor="middle" fontFamily="JetBrains Mono Variable" fontSize={16} fill={C.mute} opacity={tw(f, 0, 20)}>
              {fmt(n)} work items
            </text>
          ))}
          <g clipPath="url(#growclip)">
            {series.map((s) => (
              <g key={s.k}>
                <path d={s.d.map((v, i) => `${i ? "L" : "M"}${lx(GROWTH.items[i])},${ly(v)}`).join(" ")} fill="none" stroke={s.c} strokeWidth={pick(6, 5)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dash} />
                {s.d.map((v, i) => (
                  <circle key={i} cx={lx(GROWTH.items[i])} cy={ly(v)} r={pick(8, 7)} fill={s.c} />
                ))}
              </g>
            ))}
          </g>
          {series.map((s, si) => {
            const v = s.d[s.d.length - 1];
            const y = ly(v) + (s.k === "HANDOFF.md" ? 34 : -16);
            return (
              <g key={s.k} opacity={tw(f, 66 + si * 4, 14)}>
                <text x={R + 16} y={y + 6} fontFamily="JetBrains Mono Variable" fontSize={pick(20, 18)} fontWeight={700} fill={s.c}>
                  {fmt(v)}
                </text>
                <text x={R + 16} y={y + 30} fontFamily="JetBrains Mono Variable" fontSize={pick(13, 12)} fill={C.mute}>
                  {s.k}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: pad, top: pick(0.1 * H, 0.1 * H), color: C.ink }}>
          <div style={{ ...mono(18, C.readyD), ...fadeUp(f, 0) }}>Growth with project size</div>
          <div style={{ ...serifStyle(pick(118, 104), { lineHeight: 0.96 }), marginTop: 16 }}>
            <MaskLine f={f} at={2}>Flat as your</MaskLine>
            <MaskLine f={f} at={8}>
              project <It>grows.</It>
            </MaskLine>
          </div>
        </div>
      </Cam>
    </Bg>
  );
};

/* ───────────── S19 · secrets never get written: redaction bars sweep the keys (0:46–0:48) ───────────── */
export const S19Secrets: React.FC = () => {
  const f = useCurrentFrame();
  const { H, pick } = useL();
  const rows = 7;
  return (
    <Bg>
      <Glow color="rgba(255,74,28,0.12)" x={0.5} y={0.5} r={0.6} />
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {Array.from({ length: rows }, (_, r) => {
          const dir = r % 2 ? 1 : -1;
          const y = pick(0.1, 0.08) * H + r * pick(0.12, 0.13) * H;
          const x = dir * (f * (3 + r * 0.6)) - 600 - r * 170;
          return (
            <div key={r} style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap", fontFamily: F.mono, fontSize: pick(34, 30), display: "flex", gap: 60 }}>
              {Array.from({ length: 6 }, (_, k) => {
                const s = SECRETS[(r + k) % SECRETS.length];
                const at = 10 + ((r * 3 + k * 5) % 9) * 6;
                const wipe = tw(f, at, 12, easeInOut);
                return (
                  <span key={k} style={{ color: "rgba(12,14,19,0.2)" }}>
                    {s.label}=
                    <span style={{ position: "relative", color: wipe >= 1 ? "rgba(255,74,28,0.75)" : "rgba(12,14,19,0.36)", fontWeight: wipe >= 1 ? 600 : 400 }}>
                      {wipe >= 1 ? `[REDACTED:${s.tag}]` : s.value}
                      {wipe > 0 && wipe < 1 && <i style={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: `${wipe * 100}%`, background: C.signal, display: "block", borderRadius: 4 }} />}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>
      <Lens rx={pick(44, 70)} ry={pick(50, 30)} strength={0.97} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.ink }}>
        <div style={{ ...mono(18, C.signal), ...fadeUp(f, 0) }}>Secret scanner</div>
        <div style={{ ...serifStyle(pick(112, 96), { lineHeight: 0.98 }), marginTop: 16 }}>
          <MaskLine f={f} at={2}>Secrets never</MaskLine>
          <MaskLine f={f} at={8}>
            get <It>written.</It>
          </MaskLine>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 26 }}>
          <Odometer text={String(REPORT.secretFormats)} at={14} dur={46} stagger={5} style={serifStyle(pick(150, 140), { letterSpacing: "-0.04em" })} />
          <span style={{ ...label(26), textAlign: "left" }}>
            formats, {fmt(REPORT.secretSamples)} fake
            <br />
            secrets each · 99–100% recall
          </span>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: pick(96, 120), overflow: "hidden", opacity: tw(f, 10, 20) * 0.8 }}>
        <div style={{ display: "flex", gap: 34, whiteSpace: "nowrap", transform: `translateX(${-f * 6}px)`, ...mono(17, C.ink2, "0.1em") }}>
          {[...FORMATS, ...FORMATS].map((x, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 34 }}>
              {x}
              <i style={{ width: 7, height: 7, borderRadius: 9, background: C.signal, display: "block" }} />
            </span>
          ))}
        </div>
      </div>
    </Bg>
  );
};

/* ───────────── S20 · four beats: 0 · 0 · 15/15 · 0 (0:48–0:50) ───────────── */
const ZEROS = [
  { v: "0", l: "runtime dependencies", s: "Python standard library and git" },
  { v: "0", l: "network calls", s: "no server · no account · no telemetry" },
  { v: "15/15", l: "test-suite runs passed", s: "on Python 3.11 and 3.14" },
  { v: "0", l: "entries lost", s: "with 8 parallel writers" },
];
export const S20Zero: React.FC = () => {
  const f = useCurrentFrame();
  const { pick } = useL();
  const k = Math.min(3, Math.floor(f / 30));
  const lf = f - k * 30;
  const z = ZEROS[k];
  const pop = tw(lf, 0, 14, backOut(1.8));
  return (
    <Bg color={k % 2 ? C.paper2 : C.paper}>
      <Glow color={k === 2 ? "rgba(5,150,105,0.14)" : "rgba(255,74,28,0.10)"} x={0.5} y={0.5} r={0.55} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.ink }}>
        <div
          style={{
            ...serifStyle(pick(z.v.length > 1 ? 420 : 560, z.v.length > 1 ? 330 : 520), { lineHeight: 0.86, letterSpacing: "-0.06em" }),
            transform: `translateY(${(1 - pop) * 60}px) scale(${0.8 + 0.2 * pop})`,
            opacity: Math.min(1, pop * 2),
            filter: lf < 6 ? `blur(${(6 - lf) * 2}px)` : undefined,
          }}
        >
          {z.v}
        </div>
        <div style={{ ...mono(pick(28, 26), C.ink, "0.24em"), marginTop: pick(10, 20), opacity: tw(lf, 3, 8) }}>{z.l}</div>
        <div style={{ ...mono(17, C.mute, "0.1em"), textTransform: "none", marginTop: 12, opacity: tw(lf, 6, 8) }}>{z.s}</div>
      </AbsoluteFill>
    </Bg>
  );
};
