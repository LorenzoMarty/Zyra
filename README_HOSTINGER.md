Hostinger Web App (Express) - Guia rapido
=========================================

Entrada/preset
- Preset: Express
- Arquivo de entrada: server.js (raiz do repo)
- Comando de start: npm start

Endpoints para testar
- GET /           -> resposta texto "API OK"
- GET /health     -> resposta JSON { ok: true }
- GET /search?q=iphone -> proxy para Mercado Livre, retorna { ok, q, paging, items }

Como testar local
- npm install
- npm start
- Abra http://localhost:3000/ , /health , /search?q=iphone

Obs.: A API usa fetch nativo (Node 18+/22) e CORS liberado apenas para https://zyra-drab.vercel.app e http://localhost:3000 (ou requisicoes sem Origin, como curl/postman).
