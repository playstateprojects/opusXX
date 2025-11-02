# OpusXX Technical Overview

## Executive Summary

OpusXX is a SvelteKit-based platform for discovering classical music through AI-powered semantic search and conversational interfaces. The system leverages modern LLM technology, vector databases, and sophisticated data processing pipelines to make classical music repertoire more accessible.

## Core Technologies

### Multi-Model LLM Architecture

The platform implements a **flexible LLM provider system** supporting both OpenAI and DeepSeek models with runtime switching capability:

- **Primary Provider**: DeepSeek (`deepseek-chat`) - selected for optimal cost-to-performance ratio
- **Alternative Provider**: OpenAI (GPT-4) - available for comparison and fallback
- **Structured Output**: Leverages Zod schema validation with OpenAI's structured output API for reliable data extraction
- **Model Switching**: Simple flag-based configuration in `src/lib/server/openai.ts` enables instant provider changes without code refactoring

This architecture provides cost optimization while maintaining quality and allows rapid adaptation to emerging LLM providers.

### Agentic AI System

The platform implements a **specialized agent architecture** with purpose-built AI agents coordinating to deliver intelligent user experiences:

**Agent Endpoints** (`/api/agents/`):
- **Insight Maker**: Analyzes musical works against user intentions, assigning relevance scores (0-10) to prioritize recommendations
- **Query Maker**: Transforms natural language conversations into optimized vector search queries
- **Question Maker**: Generates contextually relevant follow-up questions to guide exploration
- **Action Decision**: Determines whether to execute vector search or continue conversation based on user intent

Each agent operates independently with specialized prompts and response schemas, enabling modular improvements and testing.

### RAG (Retrieval-Augmented Generation) Implementation

The system combines vector search with LLM generation for accurate, grounded responses:

**Vector Search Layer**:
- **Primary**: Cloudflare Vectorize (platform-integrated, low-latency)
- **Secondary**: Pinecone vector database (external, scalable)
- **Embeddings**: OpenAI `text-embedding-3-small` model for semantic vectorization

**RAG Workflow**:
1. User query → Query Maker agent extracts search intent
2. Action Decision agent determines if vector search is needed
3. Query vectorized and searched across Pinecone/Vectorize indices
4. Retrieved contexts (composer/work metadata) passed to LLM
5. Insight Maker agent generates relevance-scored recommendations
6. Response grounded in actual database content, avoiding hallucination

### Pinecone Vector Database

**Dual vector storage strategy**:
- **Cloudflare Vectorize**: Primary for speed and integration with Cloudflare Pages deployment
- **Pinecone**: Secondary for advanced filtering, namespacing, and scalability

Vector indices store embeddings of:
- Composer biographies and metadata
- Musical work descriptions and instrumentation
- Genre and period classifications

Metadata filtering enables precise searches (e.g., "find Romantic-era string quartets by female composers").

## Data Processing Pipeline

### Automated Data Ingestion

**Web Scraping & Extraction** (`/api/scrape/`, `/api/extract/`):
- Cheerio-based HTML parsing for music databases and directories
- LLM-powered structured extraction using Zod schemas:
  - `extractComposer()` - Biographical data, dates, locations
  - `extractComposerList()` - Directory page link extraction
  - `extractWorkList()` - Catalog metadata (instrumentation, duration, genre)

**Data Validation & Storage**:
- Supabase PostgreSQL database with typed schema (`databaseTypes.ts`)
- Zod schema validation ensures data integrity
- R2 object storage (Cloudflare) for raw scraped content and documents

**Workflow Automation**:
- Airtable integration with type generation (`npm run zod:generate`)
- Batch processing of composer directories
- Automated vectorization and index updates

### Data Quality & Enrichment

- LLM-based data cleaning and normalization
- Genre/period classification using controlled vocabularies (defined in `types.ts`)
- Cross-referencing with multiple sources
- Image processing and CDN upload (Cloudflare Image Delivery)

## Technical Stack Summary

**Frontend**: SvelteKit 5, TypeScript, TailwindCSS
**Backend**: SvelteKit API routes, Cloudflare Workers
**Database**: Supabase (PostgreSQL)
**Vector Storage**: Pinecone + Cloudflare Vectorize
**Object Storage**: Cloudflare R2
**AI/LLM**: DeepSeek (primary), OpenAI (secondary)
**Embeddings**: OpenAI text-embedding-3-small
**Authentication**: Supabase Auth
**Deployment**: Cloudflare Pages

## Competitive Advantages

1. **Cost Efficiency**: DeepSeek integration reduces LLM costs by ~90% vs GPT-4 while maintaining quality
2. **Multi-Provider Flexibility**: Instant switching between LLM providers protects against vendor lock-in and price changes
3. **Agent Architecture**: Modular design enables independent optimization of each AI component
4. **Dual Vector Storage**: Cloudflare Vectorize for speed, Pinecone for scale and advanced features
5. **Automated Data Pipeline**: Reduces manual curation effort through LLM-powered extraction and validation
6. **Structured Output**: Zod schemas ensure reliable data extraction from unstructured sources

## Scalability Considerations

- Cloudflare Pages edge deployment ensures global low-latency access
- Pinecone vector database scales horizontally for growing catalog
- Agent-based architecture allows independent scaling of compute-intensive AI operations
- R2 object storage provides unlimited capacity for raw data archival
- Supabase PostgreSQL offers read replicas and connection pooling for database scaling
