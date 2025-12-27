Hostinger Web App (Express) - Guia rapido
=========================================

Entrada/preset
- Preset: Express
- Arquivo de entrada: server.js (raiz do repo)
- Comando de start: npm start

Endpoints para testar
- GET /               -> resposta texto "API OK"
- GET /health         -> resposta JSON { status: "ok" }
- GET /search?q=iphone -> proxy para Mercado Livre, retorna { ok, q, paging, items }

Como testar local
- npm install
- npm start
- Abra http://localhost:3000/ , /health , /search?q=iphone
- Curl exemplos:
  - curl http://localhost:3000/health
  - curl "http://localhost:3000/search?q=iphone"

CORS
- Permitido: https://pink-vulture-671333.hostingersite.com e http://localhost:3000 (ou requisicoes sem Origin, como curl/postman).

Observacoes
- A API usa fetch nativo (Node 18+/22).
- Para SPA estatico, coloque os arquivos em /public (index.html etc.); rotas nao-API fazem fallback para public/index.html se existir.
- Se a rota /search retornar 403 do Mercado Livre, configure variaveis de ambiente ML_ACCESS_TOKEN (e, opcionalmente, ML_REFRESH_TOKEN/MELI_CLIENT_ID/MELI_CLIENT_SECRET) para autenticar a chamada.
