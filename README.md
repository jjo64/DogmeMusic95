# LyricsGraph

LyricsGraph es un explorador interactivo de influencias musicales. El usuario ingresa un artista y la aplicación genera y persiste un grafo de influencias y conexiones temáticas utilizando un LLM. El grafo se renderiza en un frontend React usando D3.js.

## Arquitectura

- **Frontend:** React + TypeScript + Vite + Apollo Client + D3.js (framer-motion)
- **Backend:** Node.js + TypeScript + Express + Apollo Server (GraphQL) + Prisma (PostgreSQL)
- **Procesamiento Asíncrono:** RabbitMQ para encolar la generación del grafo con LLM
- **Cache:** Redis para caching de grafos generados
- **LLM:** Anthropic Claude API (claude-3-5-sonnet)

## Estructura del Proyecto (Monorepo)

- `apps/api`: Servidor backend, resolvers de GraphQL y workers de colas.
- `apps/web`: Frontend React interactivo con visualización D3.

## Desarrollo Local

1. Levantar servicios locales:
   ```bash
   docker compose up -d
   ```
2. Instalar dependencias en la raíz:
   ```bash
   npm install
   ```
3. Ejecutar backend y frontend en desarrollo:
   ```bash
   npm run dev:api
   npm run dev:web
   ```
