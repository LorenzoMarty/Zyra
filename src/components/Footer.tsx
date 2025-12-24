import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-cloud bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-sm text-slate-600">
          <p>Fonte: Mercado Livre. Você finaliza sua compra no Mercado Livre.</p>
          <p>
            Este site pode receber comissão por links de afiliado sem custo extra para você.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/como-funciona" className="hover:text-brand-700">
            Como funciona
          </Link>
          <Link href="/privacidade" className="hover:text-brand-700">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-brand-700">
            Termos de Uso
          </Link>
        </div>
      </div>
    </footer>
  );
}
