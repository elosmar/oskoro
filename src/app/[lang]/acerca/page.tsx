import type { Metadata } from "next";
import { RichTemplate } from "@/components/RichTemplate";
import { getDictionary } from "@/i18n";
import { getData } from "@/lib/data";
import type { Lang } from "@/lib/data/constants";

type Props = PageProps<"/[lang]/acerca">;

const LICENSE_URL = "https://creativecommons.org/licenses/by-nc/4.0/";
const SOURCE_URL = "https://github.com/elosmar/oskoro";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).about.title };
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline">
      {children}
    </a>
  );
}

/** Attribution required by CC BY-NC 4.0 plus the unofficial-project notice. */
export default async function AboutPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang).about;
  const { source } = getData(lang);

  return (
    <article className="space-y-6 leading-relaxed">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p>{t.intro}</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t.disclaimerTitle}</h2>
        <ul className="list-disc space-y-1 pl-5">
          {t.disclaimer.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t.creditsTitle}</h2>
        <p>
          <RichTemplate
            template={t.dataCredit}
            slots={{
              plakorodb: <ExternalLink href={`${source.repo}/tree/${source.commit}`}>PlakoroDB</ExternalLink>,
              license: <ExternalLink href={LICENSE_URL}>{source.license}</ExternalLink>,
            }}
          />
        </p>
        <p>
          <RichTemplate
            template={t.codeCredit}
            slots={{ source: <ExternalLink href={SOURCE_URL}>{t.sourceLink}</ExternalLink> }}
          />
        </p>
        <p className="text-sm text-muted">{t.fanNames}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t.privacyTitle}</h2>
        <p>{t.privacy}</p>
      </section>
    </article>
  );
}
