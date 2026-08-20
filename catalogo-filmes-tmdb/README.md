# Catálogo de Filmes - Tom Hanks

Aplicação desenvolvida para a disciplina do professor @siriani.

## Tecnologias
- Backend: Node.js (Express)
- Banco de Dados: MariaDB
- Frontend: React (Vite SPA com design moderno e componentes reutilizáveis)
- Integração: TMDB API

## Como executar

1. Clone o repositório e crie o arquivo `.env` baseado no `.env.example`.
2. Insira sua chave `TMDB_API_KEY` no arquivo `.env`.
3. Suba os containers usando Docker:
   ```bash
   docker-compose up -d --build
   ```
4. Acesse o sistema na porta configurada (padrão `3000`).

## Sobre o isolamento
A aplicação garante que os Favoritos e Comentários de um usuário sejam rigorosamente filtrados em todas as consultas SQL `(WHERE usuario_id = ?)`, impossibilitando o acesso aos dados de outra conta. Toda comunicação externa e de banco acontece exclusivamente do lado do servidor (backend).
