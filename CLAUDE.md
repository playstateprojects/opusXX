# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with both Vite and Wrangler Pages in parallel
- `npm run build` - Build production version
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run Prettier and ESLint checks
- `npm run format` - Format code with Prettier
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run Svelte type checking in watch mode

### Data Generation
- Database types are defined in `src/lib/databaseTypes.ts` and `src/lib/types.ts`

## Project Architecture

This is a SvelteKit application deployed on Cloudflare Pages with the following key integrations:

### Core Stack
- **Frontend**: SvelteKit 5 with TypeScript
- **Styling**: TailwindCSS with Flowbite components
- **Deployment**: Cloudflare Pages with Wrangler
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Cloudflare Platform Services
- **AI**: Cloudflare AI Workers binding for LLM interactions
- **Vector Storage**: Vectorize for semantic search
- **Object Storage**: R2 bucket for composer data
- **Pages**: Static site hosting with serverless functions

### External APIs
- **OpenAI/DeepSeek**: Chat completions with structured output using Zod schemas

## Key Directories

### `/src/lib/`
- `types.ts` - Core TypeScript interfaces and enums
- `databaseTypes.ts` - PostgreSQL database schema types
- `zodDefinitions.ts` - Zod schemas for structured AI responses
- `openai.ts` - AI chat functions with schema validation
- `supabase.ts` - Supabase client configuration

### `/src/lib/stores/`
Svelte stores for state management:
- `chatStore.ts` - Chat interface state
- `userStore.ts` - User authentication state
- `supabaseStore.ts` - Supabase client store
- `cardStore.ts` - Card display state
- `errorStore.ts` - Error handling
- `loadStore.ts` - Loading states

### `/src/lib/components/`
Reusable Svelte components including:
- Chat interface components (`Chat.svelte`, `ChatBubble.svelte`, etc.)
- UI components with XX branding prefix
- Card components for composer and work display

### `/src/routes/api/`
SvelteKit API routes organized by functionality:
- `/chat/` - AI chat endpoints
- `/vector/` - Vector search operations
- `/scrape/` - Data scraping utilities
- `/r2/` - R2 bucket operations

## Environment Setup

Required environment variables (see `app.d.ts` for platform types):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `CF_ACCOUNT_ID` - Cloudflare account ID
- `CF_AI_TOKEN` - Cloudflare AI token

## Authentication Flow

The application uses Supabase authentication with server-side session handling in `hooks.server.ts`. User state is managed through Svelte stores and passed to all routes via `app.locals`.

## AI Integration Patterns

### Structured Output
The application uses OpenAI's structured output with Zod schemas for consistent data extraction:
- `extractComposer()` - Extract composer biographical data
- `extractComposerList()` - Extract composer links from directory pages
- `extractWorkList()` - Extract musical work metadata

### Chat Interface
Chat functionality supports both standard and JSON responses, with schema validation for structured data requests.

## Vector Search Architecture

The application implements semantic search using:
1. Cloudflare Vectorize for vector storage
2. OpenAI embeddings for text vectorization
3. Custom search endpoints with metadata filtering

## Deployment Notes

- Uses Cloudflare adapter with Pages deployment
- Wrangler configuration in `wrangler.toml` defines bindings for AI, Vectorize, and R2
- CSP configuration allows external fonts and services in `svelte.config.js`