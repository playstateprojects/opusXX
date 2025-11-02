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
- `npm run zod:generate` - Generate Zod types from Airtable schema

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
Core library files:
- `types.ts` - TypeScript interfaces, Zod schemas for validation, and API types (composers, works, genres, etc.)
- `databaseTypes.ts` - PostgreSQL database schema types
- `openai.ts` - Client-side AI function wrappers (calls API routes)
- `supabase.ts` - Supabase client configuration
- `assitants.ts` - OpenAI Assistants API integration with thread management
- `scrapingUtils.ts` - Web scraping utilities

### `/src/lib/server/`
Server-only code:
- `openai.ts` - Server-side OpenAI/DeepSeek integration with structured output using Zod schemas

### `/src/lib/stores/`
Svelte stores for state management:
- `chatStore.ts` - Chat interface state
- `userStore.ts` - User authentication state
- `supabaseStore.ts` - Supabase client store
- `cardStore.ts` - Card display state
- `modalStore.ts` - Modal visibility state
- `errorStore.ts` - Error handling
- `loadStore.ts` - Loading states

### `/src/lib/components/`
Reusable Svelte components:
- Chat interface: `Chat.svelte`, `ChatBubble.svelte`, `ChatInput.svelte`, `ChatOption.svelte`, `ChatLoading.svelte`
- Branding components: `XXButton.svelte`, `XXHeader.svelte`, `XXFooter.svelte`, `XXModal.svelte`
- Card components: `cards/XXComposerCard.svelte`, `cards/XXWorkCard.svelte`, `cards/XXComposerDetail.svelte`, `cards/XXWorkDetail.svelte`
- UI utilities: `ColourLoader.svelte`, `AnimatedPageTransition.svelte`

### `/src/routes/api/`
SvelteKit API routes organized by functionality:
- `/agents/` - AI agent endpoints (insight-maker, query-maker, question-maker, action-decision)
- `/chat/` - AI chat endpoints (standard, JSON, Cloudflare AI)
- `/extract/` - Data extraction endpoints (composer, composer-list, work-list)
- `/scrape/` - Web scraping utilities
- `/vector/` - Vector search operations (Vectorize and Pinecone)
- `/embeddings/` - OpenAI embeddings generation
- `/r2/` - R2 bucket operations
- `/base/` - Base data endpoints

## Environment Setup

Required environment variables (see `app.d.ts` for platform types):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `CF_ACCOUNT_ID` - Cloudflare account ID
- `CF_AI_TOKEN` - Cloudflare AI token

## AI Integration Architecture

### Dual Provider Setup
The application supports switching between OpenAI and DeepSeek via the `useDeepseek` flag in `src/lib/server/openai.ts`:
- When `useDeepseek = false`: Uses OpenAI with `gpt-4` model
- When `useDeepseek = true`: Uses DeepSeek API with `deepseek-chat` model

### Structured Data Extraction
Server-side functions in `src/lib/server/openai.ts` use Zod schemas with OpenAI's structured output:
- `extractComposer()` - Extract composer biographical data using `ComposerExtractSchema`
- `extractComposerList()` - Extract composer links from directory pages using `ComposerList` schema
- `extractWorkList()` - Extract musical work metadata using `WorkListSchema`

### AI Agent System
The `/api/agents/` endpoints implement specialized AI agents:
- **insight-maker**: Analyzes musical works against user intentions, returns relevance scores (0-10)
- **query-maker**: Transforms chat context into structured search queries
- **question-maker**: Generates follow-up questions based on conversation context
- **action-decision**: Determines whether to search or continue conversation

### Chat Modes
- Standard chat: `/api/chat/` - Regular conversational responses
- JSON chat: `/api/chat/json/` - Structured JSON responses
- Cloudflare AI: `/api/chat/cf/` - Uses Cloudflare Workers AI binding

### OpenAI Assistants Integration
The `assitants.ts` module provides thread-based conversation management:
- `createThread()` - Initialize conversation threads
- `addMessage()` - Add messages to threads
- `runAssistant()` - Execute assistant with custom instructions
- `waitForRun()` - Poll for completion with timeout
- `getMessages()` - Retrieve thread messages

## Vector Search Architecture

The application implements dual vector search:
1. **Cloudflare Vectorize** (primary) - Platform-integrated vector storage via `VECTORIZE` binding
2. **Pinecone** (alternative) - External vector database via `/api/vector/search/pinecone/`

Embeddings are generated via OpenAI's `text-embedding-3-small` model through `/api/embeddings/`.

## Authentication Flow

Server-side authentication in `hooks.server.ts`:
- Creates Supabase client for each request with `createSupabaseServerClient()`
- Exposes `event.locals.supabase`, `event.locals.getSession()`, and `event.locals.getUser()`
- Nonce generation for CSP headers
- Session data passed to routes via `app.locals`

## Platform Bindings

Cloudflare Workers bindings defined in `wrangler.toml` and typed in `app.d.ts`:
- `AI` - Cloudflare AI Workers for LLM inference
- `VECTORIZE` - Vector database binding (index: `opusxx-vectors`)
- `R2` - Object storage bucket (`composer-data`)

## Deployment

- Uses `@sveltejs/adapter-cloudflare` for Cloudflare Pages
- Development requires both Vite and Wrangler running concurrently
- Environment variables loaded via `dotenv-cli` in dev mode
- CSP allows TypeKit fonts, Google Fonts, and Cloudflare Image Delivery