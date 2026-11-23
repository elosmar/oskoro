import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/lib/data/schema";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Lang; // validated by the layout
  const t = getDictionary(lang);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">{t.app.name}</h1>
        <p className="text-sm font-medium text-muted">{t.app.subtitle}</p>
      </div>
      <p className="max-w-md text-balance">{t.home.intro}</p>
      <Link
        href={`/${lang}/elegir/`}
        className="rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground shadow-sm transition active:scale-95"
      >
        {t.home.start}
      </Link>
    </section>
  );
}
