import type { Product } from "@/content/types";
import { reviewStatusLabel } from "@/lib/content";

/**
 * Product presentation for reviews, comparisons and buying guides.
 * Only renders products that are not development samples.
 */
export function ProductCard({ product }: { product: Product }) {
  if (product.sample) return null;

  return (
    <article className="border border-border">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border bg-surface px-5 py-4">
        <div>
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
          <h3 className="font-serif text-lg font-bold">{product.name}</h3>
        </div>
        <div className="text-right">
          {product.price && <p className="text-sm font-semibold">{product.price}</p>}
          {product.priceCheckedAt && (
            <p className="text-xs text-muted-foreground">Price checked {product.priceCheckedAt}</p>
          )}
        </div>
      </header>

      <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
        <div>
          <h4 className="eyebrow mb-2 text-muted-foreground">Specifications</h4>
          <dl className="space-y-1.5 text-sm">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="eyebrow mb-2 text-muted-foreground">Strengths</h4>
            <ul className="list-disc space-y-1 pl-5">
              {product.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-2 text-muted-foreground">Weaknesses</h4>
            <ul className="list-disc space-y-1 pl-5">
              {product.cons.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="grid gap-4 border-t border-border px-5 py-4 text-sm sm:grid-cols-2">
        <p>
          <span className="eyebrow block text-muted-foreground">Best for</span>
          {product.bestFor}
        </p>
        <p>
          <span className="eyebrow block text-muted-foreground">Not for</span>
          {product.notFor}
        </p>
        <p className="eyebrow text-muted-foreground sm:col-span-2">
          Basis of assessment: {reviewStatusLabel[product.reviewStatus]}
        </p>
      </footer>
    </article>
  );
}

/** Reusable comparison matrix used by comparison and buying-guide articles. */
export function ComparisonTable({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: { label: string; values: string[] }[];
  caption?: string;
}) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-strong">
              <th scope="col" className="eyebrow px-4 py-3 text-muted-foreground">
                Criterion
              </th>
              {columns.map((column) => (
                <th key={column} scope="col" className="eyebrow px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={i} className="px-4 py-3 text-muted-foreground">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
