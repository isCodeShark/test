import { Cormorant_Garamond, Fleur_De_Leah, Great_Vibes, Pinyon_Script } from "next/font/google";

/**
 * The four families the reference invitation actually uses. Exposed as CSS
 * variables on <html> so the template works on the public page and inside
 * the editor preview alike.
 */
export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const fleurDeLeah = Fleur_De_Leah({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fleur-de-leah",
  display: "swap",
});

export const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pinyon-script",
  display: "swap",
});

export const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

export const fontVariables = [
  greatVibes.variable,
  fleurDeLeah.variable,
  pinyonScript.variable,
  cormorantGaramond.variable,
].join(" ");
