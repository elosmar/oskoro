import type { Metadata } from "next";
import { Suspense } from "react";
import { TableView } from "@/features/table/TableView";
import { getDictionary } from "@/i18n";
import { getData } from "@/lib/data";
import type { Lang } from "@/lib/data/constants";
import { toSymbolLabels } from "@/lib/move-view";
import { toTableData } from "@/lib/table-view";

type Props = PageProps<"/[lang]/mesa">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return { title: getDictionary(lang).table.title };
}

export default async function TablePage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDictionary(lang);
  const bundle = getData(lang);

  return (
    <div className="space-y-3">
      <h1 className="sr-only">{t.table.title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <TableView
          lang={lang}
          data={toTableData(bundle)}
          symbols={toSymbolLabels(bundle)}
          cardLabels={t.card}
          texts={{ ...t.table, start: t.rival.start }}
        />
      </Suspense>
    </div>
  );
}
