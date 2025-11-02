# Search Integration: SQL vs Vector Search

## Overview

The system now intelligently routes search queries to either **SQL search** (structured filters) or **Vector search** (semantic/descriptive) based on the user's intent.

## Architecture

### Decision Flow

```
User Message
    ↓
Action-Decision Agent
    ↓
┌───────────────┬────────────────┬─────────────┐
│  sql_search   │ vector_search  │  continue   │
└───────┬───────┴────────┬───────┴──────┬──────┘
        ↓                ↓              ↓
   SQL Query      Vector Search    Follow-up
   (Filters)      (Semantic)       Question
```

## Implementation Details

### 1. Action Decision Agent ([action-decision/+server.ts](src/routes/api/agents/action-decision/+server.ts))

**Returns:**
- `sql_search` - When structured filters are present (period, genre, composer, etc.)
- `vector_search` - When query is semantic/mood-based
- `continue` - When conversational, not a search

**Example Decision Logic:**
- "Romantic period chamber music" → `sql_search` + filters
- "Something peaceful and contemplative" → `vector_search`
- "Who was Debussy?" → `continue`

### 2. SQL Search API ([/api/search/sql/+server.ts](src/routes/api/search/sql/+server.ts))

**Accepts:** `ActionDecisionFilters`
```typescript
{
  composer?: string,
  period?: string,
  genre?: string,
  subgenre?: string,
  instrument?: string | string[]
}
```

**Returns:** Works with full composer/genre/subgenre details

**Query Strategy:**
- Looks up foreign keys for composer/genre/subgenre
- Text search (ILIKE) for period and instruments
- Joins all related data in one query
- Supports pagination (default 20 results)

### 3. Chat Component ([Chat.svelte](src/lib/components/Chat.svelte))

**New Functions:**
- `performSqlSearch(filters, intent?)` - Executes SQL search with filters
- `performVectorSearch(intent?)` - Executes vector search workflow

**Updated Flow:**
1. User submits message or selects option
2. Call action-decision agent
3. Route to appropriate search function based on action
4. Generate insights for results
5. Ask follow-up question

## Updated Types ([types.ts](src/lib/types.ts))

```typescript
export interface ActionDecisionFilters {
    composer?: string;
    period?: string;
    genre?: string;
    subgenre?: string;
    instrument?: string | string[];
}

export interface ActionDecisionResponse {
    action: 'sql_search' | 'vector_search' | 'continue';
    reason?: string;
    filters?: ActionDecisionFilters;
}
```

## Usage Examples

### SQL Search Examples

**User:** "Romantic period chamber music"
```json
{
  "action": "sql_search",
  "filters": {
    "period": "Romantic",
    "genre": "Chamber music"
  }
}
```

**User:** "String quartets by Beethoven"
```json
{
  "action": "sql_search",
  "filters": {
    "composer": "Ludwig van Beethoven",
    "genre": "Chamber music",
    "subgenre": "Quartet"
  }
}
```

**User:** "Debussy piano works"
```json
{
  "action": "sql_search",
  "filters": {
    "composer": "Claude Debussy",
    "instrument": "piano"
  }
}
```

### Vector Search Examples

**User:** "Something peaceful and contemplative"
```json
{
  "action": "vector_search"
}
```

**User:** "Music that feels like autumn rain"
```json
{
  "action": "vector_search"
}
```

### Continue Examples

**User:** "Who was Clara Schumann?"
```json
{
  "action": "continue"
}
```

## Key Features

### 1. Intelligent Routing
- AI agent decides between SQL and vector search
- Prefers SQL when structured filters are available
- Falls back to vector for semantic queries

### 2. Filter Extraction
- Automatically extracts implicit filters
- Maps colloquial terms to enum values
- Validates against Zod schemas

### 3. Enum Validation
- Period, genre, and subgenre validated against defined enums
- Invalid values logged and removed
- Ensures only valid database values are queried

### 4. Performance Optimization
- SQL search uses indexed foreign keys
- Single query with joins for related data
- Pagination support for large result sets

## Benefits

1. **Faster Structured Queries:** SQL search is instant for categorical filters
2. **Better Relevance:** Uses appropriate search method based on query type
3. **Type Safety:** Full TypeScript types with enum validation
4. **Flexibility:** Supports both exact matching and semantic search

## Testing

Try these test queries in the chat interface:

**SQL Search:**
- "Show me Baroque violin concertos"
- "20th century symphonies"
- "Chamber music for flute and harp"
- "Works by Fanny Mendelssohn"

**Vector Search:**
- "Something uplifting and energetic"
- "Melancholic piano pieces"
- "Music for a rainy afternoon"

**Continue:**
- "Tell me about the Romantic period"
- "What is a string quartet?"
- "Who was this composer?"

## Next Steps

Potential enhancements:
1. **Hybrid Search:** Combine SQL filters with vector similarity
2. **Search History:** Track which search type performs better
3. **Filter UI:** Show applied filters to users
4. **Analytics:** Log SQL vs Vector usage patterns
5. **Caching:** Cache common SQL queries for instant results
