/**
 * Readability measurement for the editorial gates.
 *
 * Flesch Reading Ease is `206.835 - 1.015*ASL - 84.6*ASW`, where ASL is words
 * per sentence and ASW is syllables per word. The syllable term dominates and
 * is set by vocabulary, not sentence craft: above about 1.70 syllables per
 * word the formula cannot reach 70 at any sentence length. Technical prose
 * that keeps its terminology sits at roughly 1.68-1.85, which is why the
 * gates are tiered rather than a single number.
 *
 * Gates (see reportArticle):
 *   standfirst >= 70, faq answers >= 70, opening paragraph >= 65,
 *   body >= 55, average sentence <= 15 words, no sentence > 35 words.
 *
 * Code, ASCII diagrams and SVG are excluded from every measurement — they
 * contain no readable sentences and would otherwise distort the result.
 */

/* ------------------------------------------------------------------ */
/* Syllables                                                           */
/* ------------------------------------------------------------------ */

/**
 * Vowel-group counting with corrections for the suffixes that dominate
 * technical English. Measured at 90% exact agreement against a hand-checked
 * word list, with a slight bias toward over-counting — so a reported score
 * runs a little low, which is the safe direction for a quality gate.
 */
const ADD_SYLLABLE = [/ia/, /riet/, /dien/, /iu/, /[aeiou]{3}/, /uo/, /[^gq]ua/, /ien(?!ce)/];
const SUB_SYLLABLE = [/cial/, /tia/, /cious/, /giu/, /sia$/, /[^aeiou]ely$/];

export function syllables(word: string): number {
  const raw = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!raw) return 0;
  if (raw.length <= 3) return 1;
  const trimmed = raw.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  let count = (trimmed.match(/[aeiouy]{1,2}/g) ?? []).length;
  for (const rule of ADD_SYLLABLE) if (rule.test(raw)) count += 1;
  for (const rule of SUB_SYLLABLE) if (rule.test(raw)) count -= 1;
  return Math.max(1, count);
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/**
 * Inline markup carries no syllables; links count as their label only.
 *
 * Inline code is dropped rather than unwrapped, for the same reason code
 * blocks are excluded entirely: an identifier such as
 * `microsoft.directory/deviceLocalCredentials/standard/read` is one
 * whitespace-delimited token carrying a dozen syllables, and counting it as an
 * English word measures nothing. It is not read aloud as prose. The
 * surrounding sentence is still measured, so the prose around an identifier
 * has to stand on its own — which is the property the gate is meant to check.
 */
export function stripMarkup(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, "")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sentence split guarding the abbreviations, initials and version numbers
 * that would otherwise register as sentence ends and inflate the score.
 */
export function sentences(text: string): string[] {
  return text
    .replace(/\b(e\.g|i\.e|etc|vs|Mr|Mrs|Dr|Inc|Ltd|Co|No|Fig|approx|Sr|Jr|St)\./gi, "$1<D>")
    .replace(/\b([A-Z])\./g, "$1<D>")
    .replace(/(\d)\.(\d)/g, "$1<D>$2")
    .split(/[.!?]+(?=\s|$)/)
    .map((s) => s.replace(/<D>/g, ".").trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

export function words(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ""))
    .filter(Boolean);
}

export interface Readability {
  words: number;
  sentences: number;
  /** Average sentence length, in words. */
  asl: number;
  /** Average syllables per word. */
  asw: number;
  flesch: number;
  fkGrade: number;
  longestSentence: number;
}

export function measure(text: string): Readability {
  const clean = stripMarkup(text);
  const sents = sentences(clean);
  const ws = words(clean);
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  const W = ws.length || 1;
  const S = sents.length || 1;
  const asl = W / S;
  const asw = syl / W;
  return {
    words: ws.length,
    sentences: sents.length,
    asl,
    asw,
    flesch: 206.835 - 1.015 * asl - 84.6 * asw,
    fkGrade: 0.39 * asl + 11.8 * asw - 15.59,
    longestSentence: sents.reduce((m, s) => Math.max(m, words(s).length), 0),
  };
}
