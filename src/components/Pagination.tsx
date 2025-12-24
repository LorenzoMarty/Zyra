import Link from "next/link";
import { buildQueryString } from "@/lib/utils";

export default function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string | number | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const createLink = (pageNumber: number) => {
    return `${basePath}${buildQueryString({ ...params, page: pageNumber })}`;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.min(totalPages, page + 2)
  );

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={createLink(Math.max(1, page - 1))}
        className="rounded-full border border-cloud px-4 py-2 text-sm text-slate-600 hover:border-brand-500"
      >
        Anterior
      </Link>
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={createLink(pageNumber)}
          className={`rounded-full px-4 py-2 text-sm ${
            pageNumber === page
              ? "bg-brand-500 text-white"
              : "border border-cloud text-slate-600 hover:border-brand-500"
          }`}
        >
          {pageNumber}
        </Link>
      ))}
      <Link
        href={createLink(Math.min(totalPages, page + 1))}
        className="rounded-full border border-cloud px-4 py-2 text-sm text-slate-600 hover:border-brand-500"
      >
        Próxima
      </Link>
    </div>
  );
}
