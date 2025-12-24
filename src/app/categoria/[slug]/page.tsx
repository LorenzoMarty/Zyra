import { notFound } from "next/navigation";
import { getCategories, searchProducts } from "@/lib/data-source";
import { normalizeSearchParams } from "@/lib/utils";
import CategoryNav from "@/components/CategoryNav";
import Filters from "@/components/Filters";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);

  if (!category) {
    notFound();
  }

  const parsedParams = normalizeSearchParams(searchParams);
  const mergedParams = { ...parsedParams, category: category.id };
  const { items, total, page, pageSize } = await searchProducts(mergedParams);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-3xl border border-cloud bg-white p-6 shadow-card">
          <h1 className="text-2xl font-semibold text-ink">{category.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {total} produto(s) encontrados. Fonte: Mercado Livre.
          </p>
        </div>
        <CategoryNav categories={categories} />
      </div>
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <Filters
          categories={categories}
          initialValues={mergedParams}
          basePath={`/categoria/${category.slug}`}
        />
        <section className="flex-1 space-y-6">
          <ProductGrid products={items} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath={`/categoria/${category.slug}`}
            params={{
              q: mergedParams.q,
              category: mergedParams.category,
              min: mergedParams.min,
              max: mergedParams.max,
              condition: mergedParams.condition,
              free_shipping: mergedParams.freeShipping ? "1" : undefined,
              fast_delivery: mergedParams.fastDelivery ? "1" : undefined,
              rating: mergedParams.rating,
              sort: mergedParams.sort
            }}
          />
        </section>
      </div>
    </main>
  );
}
