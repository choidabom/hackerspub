// deno-fmt-ignore
export const POSSIBLE_LOCALES = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av",
  "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo",
  "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv",
  "cy", "da", "de", "de-AT", "de-CH", "de-DE", "dv", "dz", "ee",
  "el", "en", "en-AU", "en-CA", "en-GB", "en-IN", "en-US", "eo",
  "es", "es-AR", "es-ES", "es-MX", "et", "eu", "fa", "ff", "fi",
  "fj", "fo", "fr", "fr-CA", "fr-FR", "fy", "ga", "gd", "gl",
  "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu",
  "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is",
  "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl",
  "km", "kn", "ko", "ko-CN", "ko-KP", "ko-KR", "kr", "ks", "ku",
  "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt",
  "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms",
  "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no",
  "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi",
  "pl", "ps", "pt", "pt-BR", "pt-PT", "qu", "rm", "rn", "ro",
  "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl",
  "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw",
  "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr",
  "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi",
  "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zh-CN",
  "zh-HK", "zh-MO", "zh-TW", "zu",
] as const;

/**
 * @deprecated Use `Intl.Locale` instead.
 */
export type Locale = typeof POSSIBLE_LOCALES[number];

/**
 * @deprecated Use `Intl.Locale` instead.
 */
export function isLocale(value: string): value is Locale {
  return POSSIBLE_LOCALES.includes(value as Locale);
}

/**
 * Normalizes a locale code to a standard format.
 *
 * @example
 * ```ts
 * normalizeLocale("en"); // "en"
 * normalizeLocale("EN-us"); // "en-US"
 * normalizeLocale("ko_KR"); // "ko-KR"
 * normalizeLocale("zh-Hans"); // "zh-CN"
 * normalizeLocale("zh-Hant"); // "zh-TW"
 * normalizeLocale("og"); // undefined
 * ```
 *
 * @param value The locale code to normalize.
 * @returns The normalized locale code if valid, otherwise undefined.
 * @deprecated Use `Intl.Locale.prototype.maximize()` instead.
 */
export function normalizeLocale(value: string): Locale | undefined {
  let normalized = value.toLowerCase().replaceAll("_", "-");
  if (normalized === "zh-hans") {
    normalized = "zh-cn";
  } else if (normalized === "zh-hant") {
    normalized = "zh-tw";
  } else if (normalized.includes("-")) {
    const [lang, region] = normalized.split("-");
    normalized = `${lang}-${region.toUpperCase()}`;
  }
  return isLocale(normalized) ? normalized : undefined;
}

/**
 * Finds the nearest locale from a list of available locales.
 *
 * @example
 * ```ts
 * const availableLocales = ["en-US", "ko", "zh-HK"];
 * findNearestLocale("en", availableLanguages); // "en-US"
 * findNearestLocale("ko-KR", availableLanguages); // "ko"
 * findNearestLocale("zh", availableLanguages); // "zh-HK"
 * findNearestLocale("zh-CN", availableLanguages); // "zh-HK"
 * findNearestLocale("fr", availableLanguages); // undefined
 * ```
 * @param locale The locale to find the nearest match for.
 * @param availableLocales The list of available locales to search in.
 * @returns The nearest locale if found, otherwise `undefined`.
 * @deprecated Use `negotiateLocale()` instead.
 */
export function findNearestLocale(
  locale: string,
  availableLocales: Locale[],
): Locale | undefined {
  const lowerCaseLanguage = locale.toLowerCase();

  // Check for exact match first (case-insensitive)
  const exactMatch = availableLocales.find(
    (lang) => lang.toLowerCase() === lowerCaseLanguage,
  );
  if (exactMatch) {
    return exactMatch;
  }

  const languageParts = lowerCaseLanguage.split("-");
  const languageWithoutRegion = languageParts[0];

  // Find all available locales that start with the base locale (case-insensitive)
  const matchingBaseLanguages = availableLocales.filter((lang) => {
    const lowerCaseLang = lang.toLowerCase();
    return lowerCaseLang.startsWith(`${languageWithoutRegion}-`) ||
      lowerCaseLang === languageWithoutRegion;
  });

  if (matchingBaseLanguages.length > 0) {
    // Prefer exact base locale match if available (case-insensitive)
    const exactBaseMatch = availableLocales.find(
      (lang) => lang.toLowerCase() === languageWithoutRegion,
    );
    if (exactBaseMatch) {
      return exactBaseMatch;
    }
    // Otherwise, return the first available locale with any region
    return matchingBaseLanguages[0];
  }

  return undefined;
}

/**
 * Negotiates the best locale from available locales based on wanted locale(s).
 *
 * Matching priority:
 * 1. Exact match (baseName)
 * 2. Language + script match (e.g., zh-Hant for Traditional Chinese)
 * 3. Language-only match
 *
 * @example
 * ```ts
 * const available = [new Intl.Locale("en-US"), new Intl.Locale("ko-KR"), new Intl.Locale("zh-CN")];
 *
 * // Single locale negotiation
 * negotiateLocale(new Intl.Locale("en"), available); // Returns Intl.Locale("en-US")
 * negotiateLocale(new Intl.Locale("ko-KR"), available); // Returns Intl.Locale("ko-KR")
 * negotiateLocale(new Intl.Locale("ja"), available); // Returns undefined
 *
 * // Multiple locale negotiation (priority order)
 * negotiateLocale([new Intl.Locale("ja"), new Intl.Locale("ko")], available); // Returns Intl.Locale("ko-KR")
 * negotiateLocale([new Intl.Locale("fr"), new Intl.Locale("de")], available); // Returns undefined
 *
 * // Script-based matching for Chinese
 * const chineseLocales = [new Intl.Locale("zh-CN"), new Intl.Locale("zh-TW")];
 * negotiateLocale(new Intl.Locale("zh-HK"), chineseLocales); // Returns zh-TW (both Traditional)
 * negotiateLocale(new Intl.Locale("zh-SG"), chineseLocales); // Returns zh-CN (both Simplified)
 * ```
 *
 * @param wantedLocale The desired locale to find a match for.
 * @param availableLocales The list of available locales to choose from.
 * @returns The best matching locale, or undefined if no match is found.
 */
export function negotiateLocale(
  wantedLocale: Intl.Locale | string,
  availableLocales: readonly (Intl.Locale | string)[],
): Intl.Locale | undefined;

/**
 * Negotiates the best locale from available locales based on wanted locale(s).
 *
 * @param wantedLocales The desired locales in priority order to find a match for.
 * @param availableLocales The list of available locales to choose from.
 * @returns The best matching locale, or undefined if no match is found.
 */
export function negotiateLocale(
  wantedLocales: readonly (Intl.Locale | string)[],
  availableLocales: readonly (Intl.Locale | string)[],
): Intl.Locale | undefined;

export function negotiateLocale(
  wantedLocales: Intl.Locale | string | readonly (Intl.Locale | string)[],
  availableLocales: readonly (Intl.Locale | string)[],
): Intl.Locale | undefined {
  if (availableLocales.length === 0) {
    return undefined;
  }

  const wantedArray = Array.isArray(wantedLocales)
    ? wantedLocales.map((l) => typeof l === "string" ? new Intl.Locale(l) : l)
    : [
      typeof wantedLocales === "string"
        ? new Intl.Locale(wantedLocales)
        : wantedLocales,
    ];

  const availableLocalesNormalized = availableLocales.map((l) =>
    typeof l === "string" ? new Intl.Locale(l) : l
  );
  const availablesWithMaximized = availableLocalesNormalized.map((raw) => ({
    raw,
    max: raw.maximize(),
  }));

  for (const wanted of wantedArray) {
    const wantedMaximized = wanted.maximize();

    // First try exact match
    for (const a of availablesWithMaximized) {
      if (wantedMaximized.baseName === a.max.baseName) {
        return a.raw;
      }
    }

    // Then try language + script match (e.g., zh-Hant)
    for (const a of availablesWithMaximized) {
      if (
        wantedMaximized.language === a.max.language &&
        wantedMaximized.script === a.max.script
      ) {
        return a.raw;
      }
    }

    // Finally try language-only match
    for (const a of availablesWithMaximized) {
      if (wantedMaximized.language === a.max.language) {
        return a.raw;
      }
    }
  }

  return undefined;
}
