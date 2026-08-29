"use client";

import { LANGUAGES, setLang, useLang, useT } from "@/lib/i18n";

/** Each language is written in its own script, so a customer recognises theirs
 *  without having to read the other two. */
export function LanguageSwitcher() {
  const lang = useLang();
  const t = useT();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-0.5 rounded-full border-2 border-cream-deep bg-white p-0.5"
    >
      {LANGUAGES.map((language) => {
        const active = language.code === lang;
        return (
          <button
            key={language.code}
            type="button"
            lang={language.code}
            onClick={() => setLang(language.code)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1.5 text-sm font-bold transition sm:px-3 sm:text-base ${
              active ? "bg-leaf text-cream" : "text-bark-soft hover:text-leaf"
            }`}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
