#!/usr/bin/env python3
"""Builds public/audio/score.flac: the original promo music re-cut to the 59 s timeline, plus sound design.

The music runs at 120 BPM (one bar = 2 s). The 45 s original is extended by repeating its last
break + drop (orig 25.96–39.96 s) once, so every edit lands on a bar line:

    new  0.00–40.00  <- orig  -0.04–39.96   (shifted 40 ms so beats fall on exact half seconds)
    new 40.00–54.00  <- orig  25.96–39.96   (break, riser, drop)
    new 54.00–59.00  <- orig  39.96–44.96   (outro, resolves on C add9)

Sound effects are synthesised (numpy + scipy) and placed on frames taken from the scenes (60 fps).
Usage: python3 scripts/build_score.py [assets/source-music.flac] [public/audio/score.flac]
"""
import subprocess
import sys

import numpy as np
from scipy import signal

SR = 48_000
DUR = 59.0
FPS = 60
rng = np.random.default_rng(20261012)

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets/source-music.flac"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/audio/score.flac"


# ───────────────────────────── helpers ─────────────────────────────
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def t_of(n):
    return np.arange(n) / SR


def env_exp(n, tau, attack=0.002):
    t = t_of(n)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / tau)


def sos(kind, f, order=4):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=4):
    return signal.sosfilt(sos(kind, f, order), x)


def noise(n):
    return rng.standard_normal(n)


def chirp(f0, f1, dur, curve="exp"):
    n = int(dur * SR)
    t = t_of(n)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (t / dur)
    else:
        f = f0 + (f1 - f0) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def sat(x, drive=1.5):
    return np.tanh(drive * x) / np.tanh(drive)


def pan(mono, p):
    """Constant-power pan; p in [-1, 1] (scalar or per-sample array)."""
    p = np.asarray(p, dtype=np.float64)
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def db(x):
    return 10 ** (x / 20)


def swept_noise(dur, f0, f1, q=1.4, envelope=None):
    """Noise through a band-pass whose centre glides from f0 to f1 (STFT spectral shaping)."""
    n = int(dur * SR)
    x = noise(n + 4096)
    f, tt, Z = signal.stft(x, fs=SR, nperseg=1024, noverlap=768)
    centres = f0 * (f1 / f0) ** np.clip(tt / dur, 0, 1)
    logf = np.log2(np.maximum(f, 1))[:, None]
    gain = np.exp(-0.5 * ((logf - np.log2(centres)[None, :]) / (1 / q)) ** 2)
    _, y = signal.istft(Z * gain, fs=SR, nperseg=1024, noverlap=768)
    y = y[:n]
    if envelope is not None:
        y = y * envelope
    return y / (np.max(np.abs(y)) + 1e-9)


def bell(freqs, dur, tau=1.2, partials=((1, 1.0), (2.0, 0.35), (3.01, 0.18), (4.2, 0.08))):
    n = int(dur * SR)
    t = t_of(n)
    y = np.zeros(n)
    for f in freqs:
        for k, a in partials:
            y += a * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau / (0.6 + 0.4 * k)))
    att = np.clip(t / 0.004, 0, 1)
    return y * att / (np.max(np.abs(y)) + 1e-9)


NOTE = {"A3": 220.0, "C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.0, "A4": 440.0, "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99, "A5": 880.0, "C6": 1046.5, "D6": 1174.66, "E6": 1318.5}


# ───────────────────────────── sound library ─────────────────────────────
def impact(size=1.0):
    dur = 1.0 + 1.4 * size
    n = int(dur * SR)
    t = t_of(n)
    f = 32 + (75 * size + 25) * np.exp(-t / 0.07)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.35 + 0.45 * size))
    body = filt(noise(n), "lowpass", 900) * env_exp(n, 0.07)
    click = filt(noise(n), "highpass", 3000) * env_exp(n, 0.006, 0.0005)
    air = filt(noise(n), "bandpass", [4000, 12000], 2) * env_exp(n, 0.35, 0.01) * 0.25 * size
    y = sat(sub * 1.0 + body * 0.55 + click * 0.5 + air, 1.6)
    return pan(y, 0)


def whoosh(dur=0.5, f0=400, f1=3000, p0=0.0, p1=0.0, peak=0.6, reverse=False):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    e = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.6)
    y = swept_noise(dur, f0, f1, 1.2, e)
    if reverse:
        y = y[::-1]
    return pan(y, np.linspace(p0, p1, n))


def riser(dur, f0=300, f1=6000):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    y = swept_noise(dur, f0, f1, 1.0, x**2.6) * 0.8 + chirp(120, 520, dur) * x**3 * 0.25
    return pan(y, 0)


def glitch(dur=0.28):
    n = int(dur * SR)
    y = np.zeros(n)
    pos = 0
    while pos < n:
        g = int(rng.uniform(0.008, 0.035) * SR)
        f = rng.choice([180, 260, 440, 700, 1200, 1900, 3100])
        t = t_of(min(g, n - pos))
        wave = np.sign(np.sin(2 * np.pi * f * t)) * rng.uniform(0.3, 1.0)
        if rng.random() < 0.4:
            wave = noise(len(t)) * 0.8
        y[pos : pos + len(t)] = wave
        pos += g + int(rng.uniform(0, 0.012) * SR)
    hold = 6
    y = np.repeat(y[::hold], hold)[:n]  # sample-rate reduction
    y = np.round(y * 6) / 6  # bit crush
    y = filt(y, "bandpass", [150, 9000], 2)
    return pan(y * np.linspace(1, 0.4, n), rng.uniform(-0.3, 0.3))


def tick(level=1.0, freq=2600, dur=0.03):
    n = int(dur * SR)
    t = t_of(n)
    y = filt(noise(n), "highpass", 2500) * env_exp(n, 0.002, 0.0003) * 0.7 + np.sin(2 * np.pi * freq * t) * env_exp(n, 0.006) * 0.5
    return pan(y * level, rng.uniform(-0.2, 0.2))


def key_tick():
    n = int(0.04 * SR)
    y = filt(noise(n), "bandpass", [1800, 6000], 2) * env_exp(n, 0.006, 0.0005)
    y += filt(noise(n), "lowpass", 400) * env_exp(n, 0.01) * 0.6
    return pan(y * rng.uniform(0.6, 1.0), rng.uniform(-0.25, 0.25))


def pop(f0=700, f1=280, dur=0.09, level=1.0):
    n = int(dur * SR)
    y = chirp(f0, f1, dur) * env_exp(n, dur / 3, 0.001) + filt(noise(n), "highpass", 2000) * env_exp(n, 0.003) * 0.3
    return pan(y * level, 0)


def chime(notes, dur=1.6, tau=0.9, level=1.0, p=0.0):
    return pan(bell([NOTE[k] for k in notes], dur, tau) * level, p)


def knife():
    dur = 0.32
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    y = swept_noise(dur, 2500, 11000, 2.0, np.sin(np.pi * x) ** 1.5)
    ring = np.sin(2 * np.pi * 3150 * t_of(n)) * np.exp(-t_of(n) / 0.12) * 0.25 + np.sin(2 * np.pi * 4730 * t_of(n)) * np.exp(-t_of(n) / 0.08) * 0.15
    return pan(y + ring, np.linspace(-0.6, 0.6, n))


def shutter():
    n = int(0.22 * SR)
    y = np.zeros(n)
    for at, lv in ((0.0, 1.0), (0.045, 0.7)):
        i = int(at * SR)
        m = int(0.012 * SR)
        y[i : i + m] += filt(noise(m), "bandpass", [1200, 5000], 2) * env_exp(m, 0.003, 0.0004) * lv
    y += filt(noise(n), "lowpass", 600) * env_exp(n, 0.03) * 0.4
    return pan(y, 0.1)


def clunk():
    n = int(0.25 * SR)
    t = t_of(n)
    y = np.sin(2 * np.pi * (80 + 70 * np.exp(-t / 0.02)) * t) * env_exp(n, 0.05, 0.001)
    y += filt(noise(n), "bandpass", [1500, 4000], 2) * env_exp(n, 0.004, 0.0004) * 0.6
    y += np.sin(2 * np.pi * 1870 * t) * env_exp(n, 0.04) * 0.12
    return pan(y, 0.15)


def flaps(cells=9, flips=7, stagger_frames=1.5, step_frames=2):
    """Split-flap clatter: one tiny click per flip per cell."""
    dur = ((cells - 1) * stagger_frames + flips * step_frames) / FPS + 0.1
    out = np.zeros((int(dur * SR), 2))
    for c in range(cells):
        for k in range(flips + 1):
            at = max(0.0, (c * stagger_frames + k * step_frames) / FPS + rng.uniform(-0.002, 0.002))
            m = int(0.012 * SR)
            i = int(at * SR)
            click = filt(noise(m), "bandpass", [1400, 3800], 2) * env_exp(m, 0.0025, 0.0003) * rng.uniform(0.4, 0.9)
            if i + m < len(out):
                out[i : i + m] += pan(click, -0.4 + 0.8 * c / max(1, cells - 1))
    return out


def ticks_series(times, level=0.6, freq=2400):
    end = max(times) + 0.05
    out = np.zeros((int(end * SR), 2))
    for i, at in enumerate(times):
        s = tick(level, freq * (1 + 0.15 * (i / max(1, len(times) - 1))))
        j = int(at * SR)
        out[j : j + len(s)] += s[: max(0, len(out) - j)]
    return out


def odometer(dur=0.9, n=22, level=0.4):
    x = np.linspace(0, 1, n)
    times = dur * (1 - (1 - x) ** 2.2)
    return ticks_series(list(times), level, 2000)


def accel_ticks(dur, r0, r1, level=0.45, f=1800):
    times, t = [], 0.0
    while t < dur:
        times.append(t)
        r = r0 + (r1 - r0) * (t / dur) ** 2
        t += 1.0 / r
    return ticks_series(times, level, f)


def warn():
    out = []
    for f in (880, 660):
        n = int(0.11 * SR)
        t = t_of(n)
        sq = signal.square(2 * np.pi * f * t) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5
        out.append(filt(sq, "lowpass", 3000) * np.clip(t / 0.005, 0, 1) * np.exp(-t / 0.08))
        out.append(np.zeros(int(0.03 * SR)))
    return pan(np.concatenate(out), 0)


def snap():
    n = int(1.4 * SR)
    t = t_of(n)
    crack = filt(noise(n), "highpass", 1200) * env_exp(n, 0.012, 0.0003)
    boom = np.sin(2 * np.pi * (38 + 90 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.45)
    buzz = sat(signal.sawtooth(2 * np.pi * 55 * t) * np.exp(-t / 0.25), 3.0) * 0.35
    ring = np.sin(2 * np.pi * 2210 * t) * np.exp(-t / 0.3) * 0.1
    return pan(sat(crack * 0.9 + boom + filt(buzz, "lowpass", 1800) + ring, 1.4), 0)


def sparks(dur=1.0, density=60):
    out = np.zeros((int(dur * SR), 2))
    t = 0.0
    while t < dur:
        t += rng.exponential(1.0 / (density * (1 - t / dur) + 4))
        m = int(0.006 * SR)
        i = int(t * SR)
        if i + m >= len(out):
            break
        c = filt(noise(m), "highpass", 3500) * env_exp(m, 0.0015, 0.0002) * rng.uniform(0.2, 0.8) * (1 - t / dur)
        out[i : i + m] += pan(c, rng.uniform(-0.8, 0.8))
    return out


def stamp(heavy=True):
    n = int(0.9 * SR)
    t = t_of(n)
    thud = np.sin(2 * np.pi * (48 + 70 * np.exp(-t / 0.03)) * t) * np.exp(-t / (0.22 if heavy else 0.1))
    slap = filt(noise(n), "bandpass", [300, 3500], 2) * env_exp(n, 0.03 if heavy else 0.018, 0.0005)
    y = sat(thud * (1.0 if heavy else 0.6) + slap * (0.8 if heavy else 0.6), 1.5)
    return pan(y, 0)


def chatter(dur, d0=10, d1=80, level=0.35):
    out = np.zeros((int(dur * SR), 2))
    t = 0.0
    while t < dur:
        d = d0 + (d1 - d0) * (t / dur) ** 1.5
        t += rng.exponential(1.0 / d)
        m = int(0.01 * SR)
        i = int(t * SR)
        if i + m >= len(out):
            break
        f = rng.choice([1200, 1800, 2600, 3400])
        c = np.sin(2 * np.pi * f * t_of(m)) * env_exp(m, 0.003, 0.0004) * rng.uniform(0.3, 1.0)
        out[i : i + m] += pan(c * level, rng.uniform(-0.7, 0.7))
    return out


def shimmer(dur=1.4, notes=("E5", "G5", "A5", "C6", "D6", "E6"), n=14, level=0.6):
    out = np.zeros((int(dur * SR), 2))
    for k in range(n):
        at = (k / n) * dur * 0.55 + rng.uniform(0, 0.03)
        b = bell([NOTE[rng.choice(notes)]], 0.8, 0.35, ((1, 1.0), (2.0, 0.2))) * (0.5 + 0.5 * rng.random())
        i = int(at * SR)
        seg = pan(b * level, rng.uniform(-0.6, 0.6))
        out[i : i + len(seg)] += seg[: max(0, len(out) - i)]
    return out


def drone(dur):
    n = int(dur * SR)
    t = t_of(n)
    x = np.linspace(0, 1, n)
    e = np.minimum(x / 0.4, 1) * np.minimum((1 - x) / 0.25, 1)
    y = (np.sin(2 * np.pi * 41.2 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + 0.4) + filt(noise(n), "lowpass", 220) * 0.25) * e
    return pan(y, 0)


def tone_sweep(f0, f1, dur, level=0.4):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    y = chirp(f0, f1, dur) * np.sin(np.pi * x) ** 0.8 * level
    return pan(y, np.linspace(-0.5, 0.5, n))


# ───────────────────────────── cue sheet (seconds) ─────────────────────────────
f = lambda frame: frame / FPS  # noqa: E731
CUES = []


def cue(at, snd, gain_db=0.0, send=0.2):
    CUES.append((at, snd, gain_db, send))


# Act I · the problem
cue(0.0, drone(2.3), -13, 0.1)
cue(0.05, accel_ticks(1.55, 7, 26, 0.5, 2000), -17, 0.1)  # context % climbing
cue(f(97), glitch(0.3), -11, 0.25)
cue(f(97), impact(0.45), -10, 0.2)
cue(f(110), glitch(0.18), -15, 0.2)
cue(f(122), whoosh(0.3, 500, 3500, -0.7, 0.0, 0.7), -12, 0.25)  # "New"
cue(f(126), whoosh(0.3, 500, 3500, 0.7, 0.0, 0.7), -12, 0.25)  # "session."
cue(f(146), pop(900, 400, 0.08, 0.7), -16, 0.3)
cue(f(150), glitch(0.32), -11, 0.25)  # No memory.
for at, x in ((30, -0.95), (40, 0.95), (50, -0.92), (60, 0.9), (70, 0.1), (80, -0.15)):
    cue(f(120 + at + 26), whoosh(0.32, 900, 4200, x * 0.4, x, 0.75), -18, 0.3)  # questions fly past
for k, at in enumerate((0, 4, 8, 12, 18)):
    cue(f(240 + at), tick(0.6, 2200 + k * 120), -20, 0.3)
cue(f(270), impact(0.7), -8, 0.25)  # END.
cue(f(300), knife(), -9, 0.35)
cue(f(310), whoosh(0.45, 1800, 300, 0.0, 0.0, 0.3), -13, 0.3)  # halves slide apart
for k, at in enumerate((120, 128, 140)):
    cue(f(240 + at), tick(0.6, 2300 + k * 150), -20, 0.3)
cue(f(420), impact(0.75), -8, 0.25)  # shouldn't.
cue(f(422), glitch(0.26), -12, 0.25)
cue(f(434), riser(0.77, 400, 9000), -13, 0.2)  # fly into the dot

# Act II · the bridge
cue(f(480), impact(1.0), -5, 0.3)
cue(f(480), shimmer(1.6), -17, 0.5)
cue(f(494), tone_sweep(260, 780, 0.6, 0.6), -18, 0.35)  # arc draws
cue(f(526), pop(620, 330, 0.1), -14, 0.3)  # node B
cue(f(524), tone_sweep(500, 1400, 1.0, 0.4), -22, 0.4)  # packet crosses
cue(f(584), chime(["E5", "A5"], 1.4, 0.7), -15, 0.45)  # resumes with context
cue(f(598), whoosh(0.7, 3000, 500, 0.0, -0.3, 0.45), -14, 0.3)  # arc becomes the logo
cue(f(608), shimmer(1.2, n=10), -19, 0.5)
cue(f(658), chatter(0.45, 30, 70, 0.4), -21, 0.2)  # scramble
# How it works
for k in range(14):
    cue(f(726) + k * 0.042, key_tick(), -22, 0.1)  # typing: contextbridge run -- pytest -q
cue(f(760), pop(500, 260, 0.12, 1.0), -12, 0.3)  # badge
cue(f(766), chime(["E5", "A5", "C6"], 1.2, 0.5), -16, 0.4)  # check
cue(f(798), whoosh(0.4, 800, 3000, -0.2, 0.3, 0.5), -18, 0.3)  # E1 flies
cue(f(824), pop(1100, 700, 0.06, 0.8), -17, 0.3)
for b in (120, 240, 360):
    cue(f(720 + b - 14), whoosh(0.45, 300, 2400, 0.0, 0.0, 0.55), -12, 0.25)  # vertical push
for k in range(9):
    cue(f(834) + k * 0.04, key_tick(), -22, 0.1)
cue(f(856), shutter(), -9, 0.3)
cue(f(864), stamp(False), -14, 0.25)  # snapshot lands
for r, at in enumerate((964, 980, 996)):
    cue(f(at), flaps(9, 7), -14, 0.2)
for k in range(13):
    cue(f(1074) + k * 0.04, key_tick(), -22, 0.1)
cue(f(1124), whoosh(0.5, 300, 1600, 0.2, -0.1, 0.4), -14, 0.25)  # barrier lifts
cue(f(1132), chime(["A4", "E5", "A5"], 1.4, 0.6), -14, 0.4)  # READY

# Act III · the gate
cue(f(1200), drone(2.0), -18, 0.2)
cue(f(1212), chatter(0.9, 25, 40, 0.3), -24, 0.1)  # reels spinning
for at in (1230, 1242, 1254, 1266):
    cue(f(at), clunk(), -12, 0.2)
cue(f(1276), chime(["E5", "G5"], 1.0, 0.5), -17, 0.4)  # NO DRIFT
cue(f(1320), chime(["A4", "C5", "E5"], 1.4, 0.8), -12, 0.4)  # READY
cue(f(1320), tone_sweep(300, 700, 0.4, 0.5), -20, 0.3)
cue(f(1338), tone_sweep(400, 1200, 0.85, 0.35), -24, 0.4)  # pulses
cue(f(1372), tone_sweep(400, 1200, 0.85, 0.35), -24, 0.4)
cue(f(1410), warn(), -11, 0.3)  # REVIEW_REQUIRED
cue(f(1410), glitch(0.22), -18, 0.2)
cue(f(1500), snap(), -6, 0.3)  # BLOCKED
cue(f(1502), sparks(1.1, 70), -12, 0.35)
cue(f(1562), accel_ticks(1.85, 6, 55, 0.5, 1500), -17, 0.15)  # reel spins up
cue(f(1680) - 0.5, whoosh(0.5, 600, 6000, 0.0, 0.0, 0.92, reverse=False), -13, 0.2)  # suck into the drop
cue(f(1680), stamp(True), -5, 0.3)  # VERIFIED
cue(f(1680), impact(0.8), -9, 0.3)
cue(f(1742), stamp(False), -11, 0.25)  # UNVERIFIED
cue(f(1754), whoosh(0.3, 700, 2600, -0.3, 0.2, 0.6), -20, 0.3)
cue(f(1864), knife(), -15, 0.3)  # strike-through

# Benchmarks
cue(f(1890), whoosh(0.35, 2400, 500, 0.0, 0.0, 0.4), -16, 0.25)
cue(f(1904), pop(800, 500, 0.07, 0.7), -18, 0.3)  # "not"
for k, at in enumerate((1934, 1942, 1950)):
    cue(f(at), odometer(0.95, 18, 0.45), -21, 0.15)
cue(f(2046), ticks_series([i * 0.0115 for i in range(86)], 0.35, 1900), -21, 0.2)  # ring fills
cue(f(2106), pop(260, 140, 0.16, 1.0), -14, 0.25)  # the one miss
cue(f(2044), odometer(0.9, 16, 0.45), -21, 0.15)
cue(f(2160), whoosh(1.1, 300, 4000, -0.5, 0.5, 0.5), -15, 0.35)  # dots swarm
cue(f(2164), odometer(1.0, 18, 0.45), -21, 0.15)
cue(f(2230), pop(260, 140, 0.16, 1.0), -15, 0.25)
cue(f(2286), tone_sweep(280, 900, 0.9, 0.55), -16, 0.35)  # stopwatch
cue(f(2340), chime(["E5", "A5"], 1.0, 0.5), -17, 0.4)
cue(f(2400), chatter(2.0, 15, 160, 0.38), -16, 0.15)  # wall of git output
cue(f(2400), riser(2.0, 250, 7000), -18, 0.2)
cue(f(2520), impact(1.0), -5, 0.3)  # collapse
cue(f(2520), whoosh(0.4, 6000, 300, 0.0, 0.0, 0.15), -11, 0.25)
cue(f(2526), odometer(0.85, 14, 0.45), -20, 0.15)
for k, at in enumerate((2536, 2542, 2548)):
    cue(f(at), pop(700 - k * 120, 300 - k * 40, 0.08, 0.8), -18, 0.25)
cue(f(2648), tone_sweep(220, 660, 1.1, 0.45), -19, 0.35)  # chart draws
cue(f(2760), whoosh(0.4, 600, 3000, 0.4, -0.4, 0.5), -18, 0.25)
for k in range(8):
    cue(f(2770 + k * 6), whoosh(0.12, 2500, 7000, rng.uniform(-0.7, 0.7), rng.uniform(-0.7, 0.7), 0.5), -24, 0.2)  # redactions
cue(f(2774), odometer(0.8, 12, 0.45), -21, 0.15)
for k, at in enumerate((2880, 2910, 2940, 2970)):
    cue(f(at), pop(420 + k * 40, 180, 0.14, 1.0), -11, 0.25)
    cue(f(at), whoosh(0.18, 3000, 600, 0.0, 0.0, 0.2), -20, 0.2)

# Close
cue(f(3000), whoosh(0.4, 400, 2600, 0.0, 0.0, 0.6), -16, 0.25)
for k in range(25):
    cue(f(3020) + k * (1 / 30), key_tick(), -21, 0.1)
cue(f(3024), tick(0.8, 1500), -18, 0.3)  # flip carousel
cue(f(3086), stamp(False), -16, 0.2)  # enter
cue(f(3092), chime(["C5", "E5", "G5"], 1.2, 0.6), -15, 0.4)
cue(f(3104), tick(0.8, 1500), -18, 0.3)
for k in range(21):
    cue(f(3132) + k * (1 / 30), key_tick(), -21, 0.1)
cue(f(3172), tick(0.8, 1500), -18, 0.3)
cue(f(3184), stamp(False), -16, 0.2)
cue(f(3190), chime(["A4", "C5", "E5", "A5"], 1.4, 0.7), -14, 0.4)  # READY
cue(f(3240), impact(0.85), -7, 0.35)  # end card
cue(f(3244), tone_sweep(260, 780, 0.5, 0.5), -19, 0.35)
cue(f(3272), whoosh(0.7, 3000, 500, 0.0, 0.0, 0.45), -15, 0.3)
cue(f(3292), shimmer(1.4, n=12), -18, 0.5)
for k in range(28):
    cue(f(3344) + k * (1 / 44), key_tick(), -22, 0.1)
cue(f(3360), chime(["C5", "E5", "G5", "D6"], 3.2, 1.6, 1.0), -11, 0.55)  # Orvantia Builds (the outro chord)


# ───────────────────────────── mix ─────────────────────────────
def build():
    n = int(DUR * SR)
    src = load(SRC)
    music = np.zeros((n, 2))

    def place(dst0, s0, s1, fade=0.008):
        # segments overlap by `fade` so neighbouring cuts cross-fade instead of dipping
        dst0, s0, s1 = dst0 - fade / 2, s0 - fade / 2, s1 + fade / 2
        a, b = int(round(s0 * SR)), int(round(s1 * SR))
        seg = src[max(a, 0) : b].copy()
        if a < 0:
            seg = np.concatenate([np.zeros((-a, 2)), seg])
        k = int(fade * SR)
        ramp = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
        seg[:k] *= ramp[:, None]
        seg[-k:] *= ramp[::-1][:, None]
        d = int(round(dst0 * SR))
        if d < 0:
            seg, d = seg[-d:], 0
        m = min(len(seg), n - d)
        music[d : d + m] += seg[:m]

    cut = 0.012  # cut just ahead of each downbeat so the kick transient stays whole
    place(0.0, -0.04, 39.96 - cut)
    place(40.0 - cut, 25.96 - cut, 39.96 - cut)
    place(54.0 - cut, 39.96 - cut, 45.0)
    fade = int(0.35 * SR)
    music[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

    sfx = np.zeros((n, 2))
    send = np.zeros((n, 2))
    duck = np.ones(n)
    for at, snd, g, sd in CUES:
        i = int(round(at * SR))
        if i >= n:
            continue
        m = min(len(snd), n - i)
        x = snd[:m] * db(g)
        sfx[i : i + m] += x
        send[i : i + m] += x * sd
        if g > -9:  # big hits duck the music a touch for punch
            dl = int(0.35 * SR)
            k = min(dl, n - i)
            duck[i : i + k] = np.minimum(duck[i : i + k], 1 - 0.3 * np.exp(-np.arange(k) / (0.12 * SR)))

    # small synthetic hall for the effects bus
    ir_n = int(1.6 * SR)
    t = t_of(ir_n)
    ir = np.stack([noise(ir_n), noise(ir_n)], axis=1) * np.exp(-t / 0.42)[:, None]
    ir[:, 0] = filt(ir[:, 0], "lowpass", 6500)
    ir[:, 1] = filt(ir[:, 1], "lowpass", 6500)
    ir /= np.sqrt((ir**2).sum(axis=0))
    wet = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:n] for c in range(2)], axis=1) * 0.6

    mix = music * db(-1.0) * duck[:, None] + sfx + wet

    # gentle bus compression + limiter
    lvl = np.sqrt(signal.sosfilt(sos("lowpass", 8, 1), np.mean(mix**2, axis=1)) + 1e-12)
    thr = db(-14)
    gain = np.where(lvl > thr, (thr / lvl) ** (1 - 1 / 2.0), 1.0)
    mix *= gain[:, None]
    mix = mix / np.max(np.abs(mix))
    mix = np.tanh(1.4 * mix) / np.tanh(1.4)  # soft clip the last few dB of peaks
    mix = mix / np.max(np.abs(mix)) * db(-1.0)

    rms = 20 * np.log10(np.sqrt(np.mean(mix**2)) + 1e-12)
    print(f"cues: {len(CUES)}  peak: {20*np.log10(np.max(np.abs(mix))):.2f} dBFS  rms: {rms:.1f} dBFS")
    pcm = (mix * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "flac", OUT], input=pcm, check=True)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
