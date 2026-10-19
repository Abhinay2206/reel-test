#!/usr/bin/env python3
"""Builds public/audio/roast.flac for the roast cut: a bouncy synthesised backing loop plus cartoon sound effects.
Reuses the synth helpers from build_score.py. Cue times are frames at 30 fps (see src/roast/Roast.tsx).
Usage: python3 scripts/build_roast_score.py"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal

sys.path.insert(0, str(Path(__file__).parent))
sys.argv = [sys.argv[0]]
import build_score as B  # noqa: E402

SR, FPS = B.SR, 30
rng = np.random.default_rng(1019)
f = lambda fr: fr / FPS  # noqa: E731
import json  # noqa: E402

TL = json.load(open("src/roast/timeline.json"))
DUR = TL["frames"] / FPS
N = int(DUR * SR)


def saw_note(freq, dur, tau, vib=0.0, cutoff=3000, bend=0.0):
    n = int(dur * SR)
    t = B.t_of(n)
    fr = freq * (1 + bend * np.exp(-t / 0.12)) * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    y = signal.sawtooth(ph) * 0.6 + np.sin(ph) * 0.4
    y = B.filt(y, "lowpass", cutoff, 2)
    return y * np.clip(t / 0.01, 0, 1) * np.exp(-t / tau)


def boing(level=1.0):
    n = int(0.7 * SR)
    t = B.t_of(n)
    fr = 180 + 380 * np.exp(-t / 0.18) * (1 + 0.5 * np.sin(2 * np.pi * 9 * t))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.28) + 0.3 * np.sin(2 * np.pi * np.cumsum(fr * 2) / SR) * np.exp(-t / 0.15)
    return B.pan(y * level, 0)


def record_scratch():
    n = int(0.55 * SR)
    t = B.t_of(n)
    x = B.noise(n)
    sweep = B.filt(x, "bandpass", [600, 5000], 2) * np.exp(-t / 0.18)
    fr = 900 * np.exp(-t / 0.09) + 80
    tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.12)
    return B.pan(B.sat(sweep * 0.8 + tone * 0.5, 2.0), 0)


def horn(freqs, dur, level=1.0, scoop=0.06):
    n = int(dur * SR)
    t = B.t_of(n)
    y = np.zeros(n)
    for fq in freqs:
        for d in (0.994, 1.0, 1.006):
            fr = fq * d * (1 - scoop * np.exp(-t / 0.05))
            y += signal.square(2 * np.pi * np.cumsum(fr) / SR) * 0.3 + signal.sawtooth(2 * np.pi * np.cumsum(fr) / SR) * 0.3
    y = B.filt(y, "lowpass", 3800, 2) * np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return B.pan(B.sat(y / (len(freqs) * 3) * 2.2, 1.5) * level, 0)


def bus_horn():
    a = horn([392, 494], 0.32)
    b = horn([330, 415], 0.55)
    gap = np.zeros((int(0.06 * SR), 2))
    return np.concatenate([a, gap, b])


def airhorn():
    return np.concatenate([horn([466, 587, 698], 0.28, 1.0, 0.03), np.zeros((int(0.05 * SR), 2)), horn([466, 587, 698], 0.28, 1.0, 0.0), np.zeros((int(0.05 * SR), 2)), horn([466, 587, 698], 0.7, 1.0, 0.0)])


def rimshot():
    n = int(0.9 * SR)
    out = np.zeros((n, 2))
    def hit(at, kind):
        i = int(at * SR)
        m = n - i
        t = B.t_of(m)
        if kind == "snare":
            y = B.filt(B.noise(m), "bandpass", [1500, 7000], 2) * np.exp(-t / 0.07) + np.sin(2 * np.pi * (190 + 90 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.08)
        elif kind == "tom":
            y = np.sin(2 * np.pi * (110 + 80 * np.exp(-t / 0.04)) * t) * np.exp(-t / 0.18)
        else:
            y = B.filt(B.noise(m), "highpass", 6000) * np.exp(-t / 0.35) * 0.6
        out[i:] += B.pan(y, 0)
    hit(0.0, "snare"); hit(0.14, "tom"); hit(0.28, "cymbal"); hit(0.28, "snare")
    return out


def sad_trombone():
    notes = [(233.1, 0.45), (220.0, 0.45), (207.7, 0.45), (196.0, 1.1)]
    segs = []
    for k, (fq, d) in enumerate(notes):
        s = saw_note(fq, d, 0.5, vib=0.02 if k == 3 else 0.0, cutoff=1400, bend=-0.03)
        if k == 3:
            t = B.t_of(len(s))
            s = saw_note(fq * (1 - 0.06 * (t[:1] * 0 + 1)), d, 0.9, vib=0.03, cutoff=1200)
        segs.append(s)
    y = np.concatenate([s * (0.9 if i < 3 else 1.0) for i, s in enumerate(segs)])
    return B.pan(B.sat(y * 0.9, 1.4), 0)


def tada():
    out = np.zeros((int(1.6 * SR), 2))
    for k, fq in enumerate((523.25, 659.25, 783.99, 1046.5)):
        y = saw_note(fq, 1.2, 0.5, cutoff=3500) * (0.5 if k < 3 else 0.7)
        i = int((0.0 if k == 0 else 0.12 * k) * SR)
        out[i : i + len(y)] += B.pan(y, -0.3 + 0.2 * k)[: len(out) - i]
    return out


def vine_boom():
    n = int(1.4 * SR)
    t = B.t_of(n)
    y = np.sin(2 * np.pi * (45 + 60 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.6) + B.filt(B.noise(n), "lowpass", 600) * np.exp(-t / 0.08) * 0.5
    return B.pan(B.sat(y * 1.2, 1.8), 0)


def rewind():
    dur = 0.6
    n = int(dur * SR)
    t = B.t_of(n)
    fr = 200 + 2600 * (t / dur) ** 2
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.3 + B.filt(B.noise(n), "bandpass", [800, 6000], 2) * 0.6
    return B.pan(y * np.sin(np.pi * t / dur) ** 0.7, 0)


# ───────────── backing loop: 112 BPM, C - Am - F - G, pizzicato bass + marimba-ish plucks + shaker ─────────────
def backing():
    bpm = 112
    beat = 60 / bpm
    out = np.zeros((N, 2))
    chords = [("C", 130.81, [261.63, 329.63, 392.0]), ("Am", 110.0, [220.0, 261.63, 329.63]), ("F", 87.31, [174.61, 261.63, 349.23]), ("G", 98.0, [196.0, 293.66, 392.0])]
    def add(sig, at, g):
        i = int(at * SR)
        if i >= N:
            return
        m = min(len(sig), N - i)
        out[i : i + m] += sig[:m] * g
    nb = int(DUR / beat)
    for b in range(nb):
        _, root, tones = chords[(b // 4) % 4]
        t0 = b * beat
        pl = B.pan(saw_note(root * 2, 0.35, 0.09, cutoff=900), -0.1)  # bouncy bass
        add(pl, t0, 0.5 if b % 2 == 0 else 0.3)
        up = [tones[(b + k) % 3] for k in range(2)]
        for k, fq in enumerate(up):  # marimba-ish plucks on the off-beats
            s = np.sin(2 * np.pi * fq * 2 * B.t_of(int(0.25 * SR))) * np.exp(-B.t_of(int(0.25 * SR)) / 0.07)
            add(B.pan(s, 0.35 if k else -0.35), t0 + beat * (0.5 + 0.25 * k), 0.16)
        sh = B.filt(B.noise(int(0.06 * SR)), "highpass", 6500) * B.env_exp(int(0.06 * SR), 0.02, 0.001)
        add(B.pan(sh, 0.2), t0 + beat * 0.5, 0.12)
        add(B.pan(sh, -0.2), t0, 0.07)
    fade = int(0.8 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return out


SC = TL["scenes"]
S = lambda scene, local=0: SC[scene][0] + local  # noqa: E731  (frame of a scene-local offset)
L = lambda lid, off=0: TL["lines"][lid]["start"] * FPS + off  # noqa: E731  (frame of a spoken line)
CUES = []
def cue(fr, snd, g=0.0):
    CUES.append((f(fr), snd, g))

cue(3, boing(), -8)
cue(L("n2", -4), record_scratch(), -9)
cue(L("n2", 8), B.pop(900, 400, 0.08), -12); cue(L("f1", 6), B.pop(700, 300, 0.08), -12)
cue(L("f1", 40), rimshot(), -12)
cue(S("v1"), B.whoosh(0.3, 600, 4000, -0.5, 0.5, 0.6), -14)
cue(L("h1", 2), B.pop(1200, 800, 0.07, 1.0), -9); cue(L("h1", 2), B.tick(1.0, 2400), -10)
cue(L("h1", 12), B.pop(500, 260, 0.1), -11); cue(L("h3", 10), B.pop(650, 320, 0.09), -11)
cue(S("v2"), B.whoosh(0.3, 500, 3500, 0.6, -0.4, 0.5), -14)
cue(L("b1", -8), bus_horn(), -10); cue(L("b1", 10), B.impact(0.5), -12)
cue(L("h4", 50), rimshot(), -13)
cue(S("v3"), B.whoosh(0.3, 500, 3500, -0.6, 0.6, 0.5), -14)
cue(L("n4", 50), vine_boom(), -12)
cue(S("v4"), B.whoosh(0.3, 500, 3500, 0.6, -0.6, 0.5), -14)
cue(L("f2", 6), bus_horn(), -11); cue(L("f2", 7), vine_boom(), -12)
cue(S("board"), B.whoosh(0.35, 500, 3000, 0.0, 0.0, 0.5), -14)
for k, off in enumerate((14, 32, 50, 68)):
    cue(S("board", off), B.tick(1.0, 1800 + 150 * k, 0.04), -9)
cue(L("n5", 6), sad_trombone(), -9); cue(L("n5", 75), rimshot(), -11)
cue(S("replay"), rewind(), -9); cue(L("h6", 50), B.whoosh(0.4, 3000, 400, 0.0, 0.0, 0.4), -16)
cue(S("lake", 2), boing(), -8); cue(L("n6", 8), B.pop(500, 260, 0.1), -10)
for k, off in enumerate((8, 17, 26, 35)):
    cue(S("card", off), B.pop(900 - 80 * k, 450, 0.07), -11)
cue(L("n7", 55), B.impact(0.7), -9); cue(L("n7", 55), airhorn(), -11); cue(L("n7", 95), rimshot(), -11)


def voice_track():
    out = np.zeros((N, 2))
    for lid, info in TL["lines"].items():
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"public/audio/voice/{lid}.wav", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.float32)
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
        i = int(info["start"] * SR)
        m = min(len(x), N - i)
        out[i : i + m] += B.pan(x[:m], {"n": 0.0, "h": -0.15, "b": 0.2, "f": 0.15, "m": 0.25}[info["voice"]])
    return out


def main():
    voice = voice_track()
    # the backing loop and effects duck while someone is speaking
    env = np.sqrt(signal.sosfilt(B.sos("lowpass", 6, 1), np.mean(voice**2, axis=1)) + 1e-12)
    duck = 1 - 0.65 * np.clip(env / 0.12, 0, 1)
    mix = backing() * B.db(-12) * duck[:, None]
    for at, snd, g in CUES:
        i = int(round(at * SR))
        m = min(len(snd), N - i)
        if m > 0:
            mix[i : i + m] += snd[:m] * B.db(g) * (0.55 + 0.45 * duck[i : i + m, None])
    mix += voice * B.db(1.5)
    mix /= np.max(np.abs(mix))
    mix = np.tanh(2.4 * mix) / np.tanh(2.4)
    mix = mix / np.max(np.abs(mix)) * B.db(-1.0)
    print(f"cues: {len(CUES)} rms: {20*np.log10(np.sqrt(np.mean(mix**2))):.1f} dBFS")
    pcm = (mix * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "flac", "public/audio/roast.flac"], input=pcm, check=True)
    print("wrote public/audio/roast.flac")


if __name__ == "__main__":
    main()
