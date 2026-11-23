"use client";

import Link from "next/link";
import { useEffect } from "react";
import { preferredLang } from "@/i18n";

/**
 * Static export has no proxy/middleware, so `/` picks the language on the client.
 */
export default function RootRedirect() {
  useEffect(() => {
    const lang = preferredLang(navigator.languages ?? [navigator.language]);
    window.location.replace(`/${lang}/`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center gap-4 p-4">
      <Link href="/es/" hrefLang="es" className="underline">
        Español
      </Link>
      <Link href="/en/" hrefLang="en" className="underline">
        English
      </Link>
    </main>
  );
}
