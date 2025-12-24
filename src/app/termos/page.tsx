export const dynamic = "force-dynamic";

export default function TermosPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-ink">Termos de Uso</h1>
      <p className="mt-4 text-sm text-slate-500">
        O ZYRA é uma plataforma de organização de busca. Não somos responsáveis pela venda,
        entrega ou pagamento dos produtos exibidos.
      </p>
      <div className="mt-8 space-y-4 text-sm text-slate-600">
        <p>
          Ao utilizar este site, você concorda que o checkout é realizado no Mercado Livre e que
          os dados de pagamento não são coletados aqui.
        </p>
        <p>
          Valores, disponibilidade e condições podem variar no Mercado Livre. Sempre verifique as
          informações na página oficial do produto.
        </p>
        <p>
          Podemos alterar estes termos a qualquer momento para manter a conformidade e a qualidade
          do serviço.
        </p>
      </div>
    </main>
  );
}
