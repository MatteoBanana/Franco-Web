# FRANCO Web — Frontend Next.js 15

Frontend della piattaforma FRANCO. Connesso all'API Laravel su SiteGround.

## Setup locale

```bash
npm install
cp .env.local.example .env.local
# configura NEXT_PUBLIC_API_URL con l'URL dell'API Laravel
npm run dev
# http://localhost:3000
```

## Variabili ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base API Laravel (es. https://matteor80.sg-host.com/api) |
| `NEXT_PUBLIC_MAPS_KEY` | Google Maps API Key |

## Deploy

```bash
npm run build
# cartella .next/ pronta per Vercel o hosting statico
```

## Struttura

```
src/
  app/          # Route e layout Next.js App Router
  components/   # Componenti riutilizzabili
  lib/          # Client API, utility
```
