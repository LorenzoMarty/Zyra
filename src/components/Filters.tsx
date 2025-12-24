"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, SearchParams } from "@/lib/types";
import { buildQueryString } from "@/lib/utils";

type FiltersProps = {
  categories: Category[];
  initialValues: SearchParams;
  basePath?: string;
};

export default function Filters({
  categories,
  initialValues,
  basePath = "/busca"
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const params = {
      q: String(formData.get("q") || ""),
      category: String(formData.get("category") || ""),
      min: String(formData.get("min") || ""),
      max: String(formData.get("max") || ""),
      condition: String(formData.get("condition") || ""),
      free_shipping: formData.get("free_shipping") ? "1" : "",
      fast_delivery: formData.get("fast_delivery") ? "1" : "",
      rating: String(formData.get("rating") || ""),
      sort: String(formData.get("sort") || "relevance"),
      page: "1"
    };

    router.push(`${basePath}${buildQueryString(params)}`);
    setIsOpen(false);
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="q" value={initialValues.q || ""} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Categoria
        </label>
        <select
          name="category"
          defaultValue={initialValues.category || ""}
          className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Faixa de preço</label>
        <div className="flex gap-2">
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={initialValues.min || ""}
            placeholder="Mín"
            className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
          />
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={initialValues.max || ""}
            placeholder="Máx"
            className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Condição</label>
        <select
          name="condition"
          defaultValue={initialValues.condition || ""}
          className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          <option value="novo">Novo</option>
          <option value="usado">Usado</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Entrega</label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="free_shipping"
            defaultChecked={Boolean(initialValues.freeShipping)}
            className="h-4 w-4 rounded border-cloud"
          />
          Frete grátis
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="fast_delivery"
            defaultChecked={Boolean(initialValues.fastDelivery)}
            className="h-4 w-4 rounded border-cloud"
          />
          Entrega rápida
        </label>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Avaliação mínima</label>
        <select
          name="rating"
          defaultValue={initialValues.rating || ""}
          className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          <option value="4">4 ou mais</option>
          <option value="3">3 ou mais</option>
          <option value="2">2 ou mais</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Ordenação</label>
        <select
          name="sort"
          defaultValue={initialValues.sort || "relevance"}
          className="w-full rounded-xl border border-cloud bg-white px-3 py-2 text-sm"
        >
          <option value="relevance">Mais relevantes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="sold_desc">Mais vendidos</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="w-full rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={() => {
            router.push(`${basePath}${buildQueryString({ q: initialValues.q || "" })}`);
            setIsOpen(false);
          }}
          className="w-full rounded-xl border border-cloud px-4 py-2 text-sm text-slate-600"
        >
          Limpar
        </button>
      </div>
    </form>
  );

  return (
    <>
      <div className="flex items-center justify-between lg:hidden">
        <p className="text-sm text-slate-500">Filtros e ordenação</p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-cloud px-4 py-2 text-sm text-slate-600"
        >
          Abrir filtros
        </button>
      </div>

      <aside className="hidden w-64 flex-shrink-0 rounded-2xl border border-cloud bg-white p-5 shadow-card lg:block">
        {formBody}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 lg:hidden">
          <div className="w-full rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Filtros</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-cloud px-3 py-1 text-sm"
              >
                Fechar
              </button>
            </div>
            {formBody}
          </div>
        </div>
      )}
    </>
  );
}
