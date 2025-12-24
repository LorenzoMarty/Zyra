import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categoria/${category.slug}`}
          className="rounded-full border border-cloud bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
