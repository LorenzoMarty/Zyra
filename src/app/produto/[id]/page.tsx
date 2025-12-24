import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data-source";
import ProductDetail from "@/components/ProductDetail";

export default async function ProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <ProductDetail product={product} />
    </main>
  );
}
