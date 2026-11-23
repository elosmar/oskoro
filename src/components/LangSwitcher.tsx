"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { LANGS, type Lang } from "@/lib/data/schema";
import { ButtonLink } from "@/ui";

/** Swaps the `[lang]` segment and keeps the query string, so the setup survives. */
export function switchLangHref(pathname: string, search: string, target: Lang): string {
  const segments = pathname.split("/");
  segments[1] = target;
  const path = segments.join("/");
  return search ? `${path}?${search}` : path;
}

export function LangSwitcher({ current, label }: { current: Lang; label: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return (
    <nav aria-label={label} className="flex gap-1">
      {LANGS.map((lang) => (
        <ButtonLink
          key={lang}
          href={switchLangHref(pathname, search, lang)}
          hrefLang={lang}
          aria-current={lang === current ? "true" : undefined}
          variant={lang === current ? "primary" : "ghost"}
          size="sm"
        >
          {lang.toUpperCase()}
        </ButtonLink>
      ))}
    </nav>
  );
}
