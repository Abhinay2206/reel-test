#!/usr/bin/env python3
"""Synthesises the roast's spoken dialogue (Telugu, espeak-ng) and writes src/roast/timeline.json.

Each line is voiced by a character (narrator, hero, bus driver, friend, maps) and scheduled inside its scene;
scene lengths follow the speech. Needs `espeak-ng` (apt install espeak-ng) and ffmpeg.
Usage: python3 scripts/build_roast_voice.py"""
import json
import math
import subprocess
from pathlib import Path

FPS = 30
OUT = Path("public/audio/voice")
VOICES = {  # espeak voice, speed (wpm), pitch (0-99), extra ffmpeg filter
    "n": ("te", 235, 45, "highpass=f=110,acompressor=threshold=-18dB:ratio=3"),
    "h": ("te", 250, 62, "highpass=f=140,acompressor=threshold=-18dB:ratio=3"),
    "b": ("te+m3", 200, 12, "lowpass=f=3200,acompressor=threshold=-18dB:ratio=3"),
    "f": ("te", 260, 52, "highpass=f=120,acompressor=threshold=-18dB:ratio=3"),
    "m": ("te+f3", 230, 78, "highpass=f=200,aecho=0.8:0.6:40:0.35"),
}
# scene, minimum frames, [(id, voice, Telugu text)]
SCENES = [
    ("intro", 150, [("n1", "n", "ఇతడే మన హీరో... ఎర్రి హుక్ జీవన్"), ("n2", "n", "ఎంట్రీ మ్యూజిక్ ఆన్. ఎంట్రీ స్పీడ్ నలభై"), ("f1", "f", "మామా, సైకిల్ కూడా ఓవర్ టేక్ చేసింది రా")]),
    ("v1", 150, [("h1", "h", "తగ్గేదే లే!"), ("h2", "h", "స్పీడ్ తగ్గించాను లే"), ("h3", "h", "నా కారుకు బ్రేక్ పెడల్ అంటే చాలా ఇష్టం")]),
    ("v2", 90, [("b1", "b", "సారీ అన్నా, హడావిడి ఉంది"), ("h4", "h", "పర్వాలేదు తమ్ముడు, నాకు ఈఎంఐ ఉంది")]),
    ("v3", 120, [("n3", "n", "కట్టప్ప బాహుబలిని ఎందుకు చంపాడు?"), ("n4", "n", "ఇంకో ఐదు నిమిషాలు రా అన్నాడు కాబట్టి")]),
    ("v4", 120, [("m1", "m", "ఎడమవైపు తిరగండి"), ("h5", "h", "ఆగు, మెంటల్లీ రెడీ అవ్వాలి"), ("f2", "f", "మామా, చేరాక కాల్ చెయ్, మేము ఎప్పుడో చేరాం")]),
    ("board", 150, [("n5", "n", "చివరి స్థానం... కానీ మస్తు షేడ్స్ ఉన్నాయ్ రా")]),
    ("replay", 120, [("h6", "h", "ఏం జరిగింది రా ఇప్పుడు?")]),
    ("lake", 150, [("f3", "f", "రా బ్రో, స్పీడ్ బోట్ ఎక్కుదాం"), ("h7", "h", "నేను నలభైకి ఎక్కువ ఎక్కను"), ("n6", "n", "ఫోటో నూరు లైకులు. డ్రైవింగ్ నూరు హారన్లు")]),
    ("card", 120, [("n7", "n", "స్పీడ్ నలభై. మిగతావన్నీ నూరు. పాస్... బొటాబొటీగా")]),
]
LEAD, GAP, TAIL = 0.25, 0.15, 0.45


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True, check=True).stdout)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    t = 0
    scenes, lines = {}, {}
    for name, minf, items in SCENES:
        cur = LEAD
        for lid, v, text in items:
            voice, spd, pit, flt = VOICES[v]
            raw = OUT / f"{lid}.raw.wav"
            subprocess.run(["espeak-ng", "-v", voice, "-s", str(spd), "-p", str(pit), "-g", "2", "-w", str(raw), text], check=True)
            wav = OUT / f"{lid}.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"{flt},volume=3dB", "-ar", "48000", "-ac", "1", str(wav)], check=True)
            raw.unlink()
            d = dur(wav)
            lines[lid] = {"start": round((t / FPS) + cur, 3), "dur": round(d, 3), "voice": v}
            cur += d + GAP
        frames = max(minf, math.ceil((cur - GAP + TAIL) * FPS))
        scenes[name] = [t, t + frames]
        t += frames
    tl = {"fps": FPS, "frames": t, "scenes": scenes, "lines": lines}
    Path("src/roast/timeline.json").write_text(json.dumps(tl, indent=1))
    print("frames", t, f"({t/FPS:.1f}s)")
    for k, v in scenes.items():
        print(k, v, f"{(v[1]-v[0])/FPS:.1f}s")


if __name__ == "__main__":
    main()
