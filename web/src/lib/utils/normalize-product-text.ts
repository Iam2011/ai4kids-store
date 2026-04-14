const TOKEN_CORRECTIONS: Record<string, string> = {
  dargon: "Dragon",
  monstar: "Monster",
  boi: "Boy",
};

const PRESERVE_UPPERCASE = new Set([
  "rc",
  "uno",
  "diy",
  "led",
  "usb",
  "gps",
  "4k",
  "3d",
]);

const MINOR_WORDS = new Set(["and", "or", "for", "with", "of", "the", "to", "in", "on"]);

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const normalizeWord = (word: string, index: number) => {
  const match = word.match(/^([^A-Za-z0-9]*)([A-Za-z0-9&+-]+)([^A-Za-z0-9]*)$/);
  if (!match) return word;

  const [, prefix, core, suffix] = match;
  const lowerCore = core.toLowerCase();
  const upperCore = core.toUpperCase();
  let next = core;

  if (TOKEN_CORRECTIONS[lowerCore]) {
    next = TOKEN_CORRECTIONS[lowerCore];
  } else if (PRESERVE_UPPERCASE.has(lowerCore)) {
    next = upperCore;
  } else if (/[0-9]/.test(core) || (/^[A-Z0-9-]+$/.test(core) && core.length <= 8)) {
    next = upperCore;
  } else if (core.includes("&")) {
    next = core
      .split("&")
      .map((part) => {
        const lowerPart = part.toLowerCase();
        return TOKEN_CORRECTIONS[lowerPart] || capitalize(lowerPart);
      })
      .join("&");
  } else if (index > 0 && MINOR_WORDS.has(lowerCore)) {
    next = lowerCore;
  } else {
    next = capitalize(lowerCore);
  }

  return `${prefix}${next}${suffix}`;
};

export const formatProductName = (value: string) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  return normalized
    .split(/\s+/)
    .map((word, index) => normalizeWord(word, index))
    .join(" ");
};
