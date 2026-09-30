/**
 * The three confetti bursts from the reference script.js, with the palette
 * taken from the site's theme. canvas-confetti is loaded on first use so it
 * never lands in the initial bundle.
 */
export async function fireConfetti(theme: { accent: string; gold: string; bg: string }) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const confetti = (await import("canvas-confetti")).default;
  const colors = [theme.gold, theme.accent, theme.bg, "#FFD700", theme.accent];

  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
  }, 250);
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
  }, 400);
}
