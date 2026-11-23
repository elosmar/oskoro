"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LANGS, type Lang } from "@/lib/data/schema";

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
    <nav aria-label={label} className="flex gap-1 text-sm font-medium">
      {LANGS.map((lang) => (
        <Link
          key={lang}
          href={switchLangHref(pathname, search, lang)}
          hrefLang={lang}
          aria-current={lang === current ? "true" : undefined}
          className={
            lang === current
              ? "rounded-md bg-accent px-2 py-1 text-accent-foreground"
              : "rounded-md px-2 py-1 text-muted hover:text-foreground"
          }
        >
          {lang.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
