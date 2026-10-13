// Every number shown in the reel comes from the ContextBridge Benchmark Report (v0.3.3, 2026-10-12).

export const REPORT = {
  version: "0.3.3",
  date: "2026-10-12",
  scenarios: 86,
  scenariosPass: 85,
  fuzzTrials: 800,
  fuzzAgree: 799,
  fuzzRedTrial: 169, // seed 20261012, trial 169 (harness artifact, see report section 2)
  linesScanned: 1_737_973,
  tokensCheckMedian: 65,
  speedMs: 143,
  speedFiles: 10_000,
  speedDirty: 500,
  secretFormats: 31,
  secretSamples: 1_000,
  suiteRuns: 15,
  writersLost: 0,
  writersMax: 8,
  deps: 0,
  networkCalls: 0,
};

/** Figure 3: tokens a fresh agent must read on the Orvantia OS repository (480 tracked files). */
export const ORIENT = { repo: "Orvantia OS", files: 480, check: 30, full: 378, dump: 6_569, ratio: 17.4 };

/** Figure 4: tokens versus work items. The handoff is capped at the newest 25 items per list. */
export const GROWTH = {
  items: [10, 50, 100, 250, 500, 1000],
  raw: [1_053, 4_520, 8_855, 21_853, 43_520, 86_851],
  full: [824, 2_090, 2_930, 2_930, 2_930, 2_931],
  handoff: [529, 1_781, 2_621, 2_621, 2_621, 2_622],
  check: [203, 217, 217, 217, 217, 217],
};

export const SECRETS: { label: string; value: string; tag: string }[] = [
  { label: "AWS_ACCESS_KEY_ID", value: "AKIA••••••••••••3F7Q", tag: "aws-access-key" },
  { label: "GITHUB_TOKEN", value: "ghp_••••••••••••••••••••Zk2", tag: "github-pat" },
  { label: "STRIPE_KEY", value: "sk_live_••••••••••••••••9xQ", tag: "stripe-live" },
  { label: "ANTHROPIC_API_KEY", value: "sk-ant-••••••••••••••••Tq0", tag: "anthropic-sk" },
  { label: "SLACK_BOT_TOKEN", value: "xoxb-••••••••••••••••••c1", tag: "slack-bot" },
];

export const FORMATS = [
  "aws access key", "aws temp key", "github pat", "github oauth", "github fine-grained", "slack bot", "google api", "openai", "anthropic",
  "stripe live", "stripe test", "stripe restricted", "sendgrid", "npm", "twilio", "jwt", "pem rsa", "pem openssh", "gitlab pat", "huggingface",
  "pypi token", "digitalocean", "shopify", "mailchimp", "telegram bot", "azure account key", "db url password", "mongodb srv", "password assign",
  "api key json", "token env",
];
