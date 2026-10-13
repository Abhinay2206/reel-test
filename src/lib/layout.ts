import { useVideoConfig } from "remotion";

/** Layout helpers shared by both aspect ratios. Both compositions are 1080 px on their short side. */
export function useL() {
  const { width: W, height: H } = useVideoConfig();
  const portrait = H > W;
  const pad = portrait ? 76 : 110;
  /** pick(landscapeValue, portraitValue) */
  const pick = <T,>(land: T, port: T): T => (portrait ? port : land);
  return { W, H, portrait, pad, pick };
}
