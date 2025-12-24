export const dynamic = "force-dynamic";

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-ink">Política de Privacidade</h1>
      <p className="mt-4 text-sm text-slate-500">
        Respeitamos sua privacidade. Este site armazena histórico de buscas e eventos de navegação
        apenas para melhorar a experiência e medir desempenho.
      </p>
      <div className="mt-8 space-y-4 text-sm text-slate-600">
        <p>
          Dados armazenados localmente: histórico de pesquisa, eventos de clique e itens do carrinho.
        </p>
        <p>
          Esses dados ficam no seu navegador e podem ser usados para análise anônima. Não vendemos
          informações pessoais.
        </p>
        <p>
          Quando você clica em links de afiliado, será direcionado ao Mercado Livre, que possui sua
          própria política de privacidade.
        </p>
      </div>
    </main>
  );
}
