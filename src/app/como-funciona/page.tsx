export const dynamic = "force-dynamic";

export default function ComoFuncionaPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-ink">Como funciona</h1>
      <p className="mt-4 text-sm text-slate-500">
        O ZYRA organiza buscas do Mercado Livre e ajuda você a montar um carrinho de intenção.
        O pagamento sempre acontece no Mercado Livre.
      </p>
      <div className="mt-8 space-y-6">
        {[
          {
            title: "Busca inteligente",
            text: "Pesquise por produtos, aplique filtros e encontre ofertas em um único lugar."
          },
          {
            title: "Transparência",
            text: "Cada produto mostra a fonte Mercado Livre e o link oficial para compra."
          },
          {
            title: "Checkout seguro",
            text: "Ao finalizar, você é direcionado ao Mercado Livre para concluir o pagamento."
          },
          {
            title: "Afiliados",
            text: "Podemos receber comissão por links de afiliado sem custo extra para você."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-cloud bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
