import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { OrientationSprite } from "@/components/OrientationIcon";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { getDictionary, isLang } from "@/i18n";
import { LANGS } from "@/lib/data/constants";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: `${t.app.name} · ${t.app.subtitle}`, template: `%s · ${t.app.name}` },
    description: t.meta.description,
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <OrientationSprite />
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href={`/${lang}/`} className="text-lg font-bold tracking-tight">
              {t.app.name}
            </Link>
            <Suspense fallback={null}>
              <LangSwitcher current={lang} label={t.lang.label} />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
        <footer className="space-y-1 px-4 py-6 text-center text-xs text-muted">
          <p>{t.footer.unofficial}</p>
          <Link href={`/${lang}/acerca/`} className="underline hover:text-foreground">
            {t.footer.about}
          </Link>
        </footer>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
