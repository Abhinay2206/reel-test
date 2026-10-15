# ContextBridge promo reel

A 59-second motion piece for [ContextBridge](https://github.com/Abhinay2206/ContextBridge), in two cuts:

| Composition | Size | Use |
| --- | --- | --- |
| `Promo16x9` | 1920 × 1080, 60 fps | site showreel, YouTube, LinkedIn |
| `Promo9x16` | 1080 × 1920, 60 fps | Reels, Shorts, TikTok, mobile site |

Built with [Remotion](https://www.remotion.dev) (React → video). Every frame is a pure function of the frame number, so both cuts render deterministically.

**Rendered files** are in [`renders/`](renders):

| File | What |
| --- | --- |
| `ContextBridge-Promo-16x9.mp4`, `ContextBridge-Promo-9x16.mp4` | masters: H.264 CRF 17, 1080p60, AAC 320k (~48 MB each), for uploading to social platforms |
| `ContextBridge-Promo-16x9-web.mp4`, `ContextBridge-Promo-9x16-web.mp4` | web versions: ~14 MB each, `faststart`, for the site's showreel |
| `poster-16x9.jpg`, `poster-9x16.jpg` | poster frames (the logo reveal at 0:11.8) |
| `cover-16x9.jpg`, `cover-9x16.jpg` | cover images (`npm run cover` re-renders them) |
| `captions.md` | captions for Instagram, LinkedIn and X, with the research behind them |

## Story (beats land on the 120 BPM score)

| Time | Chapter | What happens |
| --- | --- | --- |
| 0:00 | The problem | A session's context window climbs to 100 % over a 3D plane of agent logs, then glitches out. "New session. *No memory.*" Questions fly past the camera. "Your AI coding sessions can END." The word is cut in two. "Your engineering context *shouldn't.*" The camera flies into its full stop. |
| 0:08 | The bridge | That dot becomes Session A. A bold arc (the logo's own proportions) draws to Session B while `state.json`, `E1 PASSED` and `HEAD 580df56` stream across it. The arc shrinks into the mark beside the ContextBridge wordmark. |
| 0:12 | How it works | Four steps on a vertical reel: *Record evidence* (test badge, token into `state.json`), *Save a checkpoint* (camera shutter, pinned snapshot), *Switch anything* (split-flap board), *Resume safely* (a boom barrier lifts on READY). |
| 0:20 | The gate | Slot reels lock checkpoint against workspace. READY, REVIEW_REQUIRED and BLOCKED play out under the arc: it pulses, flickers behind hazard tape, then snaps with sparks. A reel spins up with the riser. |
| 0:28 | Provenance | A VERIFIED stamp slams in on the drop; UNVERIFIED follows. "claimed." is struck through... |
| 0:31 | Benchmarks | ...and becomes "Measured, *not claimed.*" Then the report, one motion idea per beat: 85/86 on a ring of 86 ticks, 800 dots swarming into a grid with one red, 143 ms on a stopwatch, a wall of git output that collapses into **17.4× smaller than a git dump**, a full-frame growth chart, redaction bars over secrets, and four beat-cut numbers: 0 dependencies, 0 network calls, 15/15 runs, 0 entries lost. |
| 0:50 | Get started | `/contextbridge:checkpoint` and `/contextbridge:resume` typed large; a flip carousel shows plugin, skill and CLI. |
| 0:54 | End card | The arc draws once more and becomes the mark above the wordmark; install line, repository, **Orvantia Builds**. |

All figures come from the *ContextBridge Benchmark Report* (v0.3.3, 2026-10-12) and live in `src/data.ts`. Where the report is more cautious than its summary, the reel follows the detail: secret-scanner recall is shown as 99–100 % (one format measured 99 %), and the one gate miss is labelled as a design limit (no network calls).

## Design

Light theme in the [contextbridge.orvantia.in](https://contextbridge.orvantia.in) palette (paper `#ece8df`, ink `#0c0e13`, signal `#ff4a1c`, the site's verdict greens, ambers and reds) and type (Instrument Serif, Inter, JetBrains Mono). The layouts are motion-first rather than copies of site sections: kinetic type, match cuts, odometers, reels and a viewfinder frame (crop marks, chapter label, timecode). Film grain, a warm vignette, soft light blooms and directional motion blur on pushes finish the look.

## Sound

`scripts/build_score.py` re-cuts the original promo music on its bar grid to fit 59 s (the last break and drop repeat once, so every edit lands on a downbeat) and layers synthesised sound design timed to scene frames: impacts on the drops, whooshes on pushes and morphs, stamp hits, reel locks, a shutter click, split-flap clatter, sparks, typing, and chimes in the track's key (A minor, ending on the outro's C add9). The result is `public/audio/score.flac`.

## Develop and render

```bash
npm install
npm run studio                          # live preview at http://localhost:3000
npm run render                          # both cuts into out/
npm run render:16x9                     # or one at a time
npm run render:9x16

pip install numpy scipy                 # only to rebuild the score
npm run score                           # assets/source-music.flac → public/audio/score.flac
```

Renders are H.264 (CRF 17, `slow` preset, BT.709) with 320 kbps AAC. If Chrome cannot be downloaded in your environment, point Remotion at a local Chromium with `REMOTION_BROWSER_EXECUTABLE=/path/to/chrome` (see `remotion.config.ts`).

Review helpers: `node scripts/stills.mjs Promo16x9 out/stills 0.5 480 900 2120` renders individual frames, and `python3 scripts/sheet.py sheet.jpg 4 out/stills/*.jpg` tiles them into a contact sheet.

## Layout

```
src/
  Root.tsx           both compositions
  Promo.tsx          scene sequence, frame overlay, grain, vignette, audio
  timeline.json      scene start/end frames (60 fps)
  data.ts            benchmark numbers
  theme.ts           palette and fonts
  scenes/            ActI (problem), ActII (bridge, how it works), ActIII (gate, provenance), Bench, Close
  components/        Motion (arc, odometer, reels, split-flap, dial, swarm…), Hud, Atmos, Type, Fx, UI
  lib/               easing and timing, layout, text measuring, arc geometry
scripts/             build_score.py, stills.mjs, sheet.py
public/              fonts, grain tiles, Orvantia logo, score
assets/              source music (from the original promo)
renders/             final videos and posters
```

Remotion is free for individuals and companies of up to three people; larger teams need a [company license](https://www.remotion.dev/license).
