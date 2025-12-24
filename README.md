# ZYRA

Site de busca e filtros para produtos do Mercado Livre, com foco em performance, SEO e transparência.

## Requisitos

- Node.js 18+
- npm ou pnpm/yarn

## Instalação

```bash
npm install
```

## Rodar localmente

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_DATA_MODE=real
NEXT_PUBLIC_AFFILIATE_ID=SEU_ID
NEXT_PUBLIC_AFFILIATE_SOURCE=SEU_SOURCE
ML_ACCESS_TOKEN=
```

- `NEXT_PUBLIC_DATA_MODE`:
  - `mock`: usa os dados locais em `src/data/mock`.
  - `real`: consulta a API pública do Mercado Livre quando disponível.
  - padrão: `real` quando a variável não é informada.
- `NEXT_PUBLIC_AFFILIATE_ID` e `NEXT_PUBLIC_AFFILIATE_SOURCE`: parâmetros de afiliado usados na geração de links.
- `ML_ACCESS_TOKEN`: token OAuth opcional do Mercado Livre para evitar bloqueios (403).

## Trocar mock <-> real

- Use `NEXT_PUBLIC_DATA_MODE=mock` para trabalhar offline ou com dados simulados.
- Use `NEXT_PUBLIC_DATA_MODE=real` para consultar `https://api.mercadolibre.com`.

A camada de dados está em `src/lib/data-source.ts` e pode ser estendida para integrar feeds ou APIs oficiais.

## Testes

```bash
npm run test
```

Testes básicos cobrem:
- Geração de `affiliate_link`.
- Reducer do carrinho.

## Estrutura

- `src/app`: rotas do App Router.
- `src/components`: componentes reutilizáveis.
- `src/lib`: camada de dados, utilitários, analytics, cart.
- `src/data/mock`: dados simulados.

## Transparência

- Produtos exibidos são do Mercado Livre.
- O checkout acontece no Mercado Livre.
- Este site pode receber comissão por links de afiliado sem custo extra para você.

## Observações

- O clique no card do produto abre um Quick View no site.
- O redirecionamento para o Mercado Livre acontece apenas no checkout.
