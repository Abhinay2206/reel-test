// Design tokens lifted from contextbridge.orvantia.in (app/globals.css), so the reel matches the site.
export const C = {
  paper: "#ece8df",
  paper2: "#e2ddd1",
  ink: "#0c0e13",
  ink2: "#171a22",
  mute: "#585d6a",
  muteD: "#8d93a3",
  line: "rgba(12, 14, 19, 0.14)",
  lineD: "rgba(236, 232, 223, 0.14)",
  signal: "#ff4a1c",
  green: "#12b886",
  amber: "#f5a524",
  red: "#ff4d63",
  blue: "#3a5bff",
  // Darker verdict tones the site uses on paper (hero readout and particle bridge).
  readyD: "#059669",
  reviewD: "#d97706",
  blockedD: "#e11d48",
  // Orvantia credit gradient from the site footer, deepened a step so it holds contrast on paper.
  orvA: "#7b68ff",
  orvB: "#a855f7",
  orvC: "#f26b3a",
  cardLine: "rgba(12, 14, 19, 0.12)",
} as const;

export const F = {
  serif: '"Instrument Serif", "Times New Roman", serif',
  sans: '"Inter Variable", Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, Menlo, monospace',
} as const;

export type Verdict = "READY" | "REVIEW_REQUIRED" | "BLOCKED";

/** Verdict colours: the darker tones the site uses on paper, plus the CLI exit code. */
export const VERDICT: Record<Verdict, { onPaper: string; exit: number }> = {
  READY: { onPaper: C.readyD, exit: 0 },
  REVIEW_REQUIRED: { onPaper: C.reviewD, exit: 1 },
  BLOCKED: { onPaper: C.blockedD, exit: 2 },
};
