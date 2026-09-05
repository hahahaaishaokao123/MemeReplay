"use client";

import type { Locale } from "@/lib/i18n";

export function LanguageToggle({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return (
    <button className="language-toggle" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label="Switch language">
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
