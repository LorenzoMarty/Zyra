# ML Proxy

Backend simples em Node.js + Express para proxy da busca do Mercado Livre, evitando 403 na Vercel.

## Rodar local
```bash
cd ml-proxy
npm install
PORT=3001 npm start
```
Endpoint: `http://localhost:3001/search?q=iphone`

## Deploy no Render
1. Crie um Web Service apontando para esta pasta `ml-proxy`.
2. Runtime: Node 18+.
3. Command: `npm start`
4. Defina as variáveis:
   - `PORT` (Render fornece automaticamente, apenas herde)
   - `ALLOWED_ORIGINS` (se precisar liberar domínios além de `https://zyra-drab.vercel.app`, `https://zyra-lorenzomarty-9203s-projects.vercel.app`, `http://localhost:3000`)

## Configuração do frontend
Defina `NEXT_PUBLIC_PROXY_BASE_URL` com a URL pública do serviço (ex: `https://seu-servico.onrender.com`).
