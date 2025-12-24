"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductCarousel({
  images,
  alt
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-mist text-sm text-slate-500">
        Sem imagens disponíveis
      </div>
    );
  }

  const current = images[index] || images[0];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-mist">
        <Image
          src={current}
          alt={alt}
          width={800}
          height={600}
          className="h-64 w-full object-cover"
        />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={() =>
                setIndex((prev) => (prev - 1 + images.length) % images.length)
              }
              className="rounded-full bg-white/80 px-3 py-2 text-sm text-slate-700 shadow"
            >
              &larr;
            </button>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={() => setIndex((prev) => (prev + 1) % images.length)}
              className="rounded-full bg-white/80 px-3 py-2 text-sm text-slate-700 shadow"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, idx) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(idx)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border ${
                idx === index ? "border-brand-500" : "border-cloud"
              }`}
            >
              <Image
                src={image}
                alt={alt}
                width={160}
                height={120}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
