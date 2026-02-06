# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (runs Vite + Wrangler Pages concurrently via `dotenv-cli`)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run Prettier and ESLint checks
- `npm run format` - Format code with Prettier
- `npm run check` - Svelte type checking (`svelte-kit sync && svelte-check`)
- `npm run zod:generate` - Generate Zod types from Airtable schema

There is no test framework configured in this project.

## Architecture Overview

SvelteKit 5 application for classical music discovery, deployed on Cloudflare Pages. Users interact with an AI chat interface to discover composers and musical works. Data is extracted from web sources via AI-powered structured extraction, stored in Supabase (PostgreSQL), and made searchable via vector embeddings.

### Core Stack
- **Frontend**: SvelteKit 5 + TypeScript + TailwindCSS + Flowbite components
- **Deployment**: Cloudflare Pages via `@sveltejs/adapter-cloudflare`
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **AI Providers**: DeepSeek (primary, toggled via `useDeepseek` flag in `src/lib/server/openai.ts`) and OpenAI (alternative)
- **Vector Search**: Cloudflare Vectorize (primary) + Pinecone (alternative)

### Cloudflare Platform Bindings (defined in `wrangler.toml`, typed in `app.d.ts`)
- `AI` - Cloudflare AI Workers (includes AutoRAG)
- `VECTORIZE` - Vector database (index: `opusxx-vectors`)
- `R2` - Object storage bucket (`composer-data`)

## Key Code Patterns

### AI Provider Switching
`src/lib/server/openai.ts` controls the AI backend. The `useDeepseek` flag (currently `true`) switches between DeepSeek (`deepseek-chat` model) and OpenAI. Both use the OpenAI SDK — DeepSeek is accessed by pointing the OpenAI client at `https://api.deepseek.com`. Embeddings always use OpenAI's `text-embedding-3-small`.

### Client-Server AI Pattern
Client-side functions in `src/lib/openai.ts` are thin wrappers that call SvelteKit API routes (`/api/chat/`, `/api/extract/`, etc.), which in turn call server-side functions in `src/lib/server/openai.ts`. This keeps API keys server-side.

### Structured Data Extraction
Server-side extraction functions use Zod schemas with OpenAI's `zodResponseFormat()` for type-safe AI output:
- `extractComposer()` → `ComposerExtractSchema`
- `extractComposerList()` → `ComposerList`
- `extractWorkList()` → `WorkListSchema`

### AI Agent System (`/api/agents/`)
Specialized endpoints that power the chat interaction loop:
- **action-decision** — Determines whether to search or continue conversation
- **query-maker** — Transforms chat context into search queries
- **insight-maker** — Scores work relevance (0-10) against user intent
- **question-maker** — Generates follow-up questions
- **surprise-ninja** — Random/surprise recommendations

### Authentication Flow (`hooks.server.ts`)
Creates a Supabase client per request with `createSupabaseServerClient()`. Exposes `event.locals.supabase`, `event.locals.getSession()`, and `event.locals.getUser()`. Generates a random nonce for CSP headers and replaces `__NONCE__` placeholders in HTML responses.

## Key Directories

- `src/lib/types.ts` — Core domain types (Composer, Work, Genre) and Zod schemas for AI extraction
- `src/lib/databaseTypes.ts` — PostgreSQL schema types with composed relation types
- `src/lib/stores/` — Svelte stores for chat, user, card, modal, error, and loading state
- `src/lib/utils/` — Utility modules (Airtable, Cloudflare AI, composer parsing, string utils, vectors)
- `src/lib/components/` — UI components (Chat*, XX* branded components, cards/, SplitPage, ColourLoader)
- `src/routes/api/` — API routes: `/agents/`, `/chat/`, `/extract/`, `/scrape/`, `/vector/`, `/search/sql/`, `/embeddings/`, `/r2/`, `/base/`

## Styling

TailwindCSS with custom theme in `tailwind.config.ts`:
- Custom fonts: `ff-zwo-web-pro`, `ff-zwo-corr-web-pro` (TypeKit)
- Primary yellow: `#EAC645`
- Accent acid green: `#E5FF00`
- Period-based color palette (Romantic, Classical, Baroque, Contemporary, Modernist) used throughout the UI for visual categorization

## Environment Variables

See `app.d.ts` for typed platform bindings. Required:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase connection
- `OPENAI_API_KEY` — OpenAI (embeddings, alternative chat provider)
- `DEEPSEEK_API_KEY` — DeepSeek (primary chat provider)
- `CF_ACCOUNT_ID`, `CF_AI_TOKEN` — Cloudflare platform services
