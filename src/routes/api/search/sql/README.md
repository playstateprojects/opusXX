# SQL Search API

Filter-based search endpoint for musical works using structured PostgreSQL queries.

## Endpoint

`POST /api/search/sql`

## When to Use

Use SQL search when the user query contains **structured filters**:
- Period (Baroque, Romantic, etc.)
- Genre (Chamber music, Opera, etc.)
- Subgenre (Quartet, Symphony, etc.)
- Composer name
- Instrument(s)

**Example queries best suited for SQL search:**
- "Romantic period chamber music"
- "String quartets by Beethoven"
- "Baroque violin concertos"
- "20th century piano sonatas"

## Request Format

```typescript
{
  "filters": {
    "composer"?: string,      // e.g., "Clara Schumann", "Debussy"
    "period"?: string,        // e.g., "Romantic", "Baroque"
    "genre"?: string,         // e.g., "Chamber music", "Opera"
    "subgenre"?: string,      // e.g., "Quartet", "Symphony"
    "instrument"?: string | string[]  // e.g., "piano", ["violin", "cello"]
  },
  "limit"?: number,   // default: 20
  "offset"?: number   // default: 0
}
```

## Response Format

```typescript
{
  "works": WorkWithRelations[],  // Array of works with joined composer/genre data
  "total": number,                // Total count of matching works
  "filters_applied": ActionDecisionFilters  // Echo of filters used
}
```

## Usage Example

### From Chat Flow

1. User message: "Show me Romantic period chamber music"
2. Action-decision agent returns:
   ```json
   {
     "action": "search",
     "filters": {
       "period": "Romantic",
       "genre": "Chamber music"
     }
   }
   ```
3. Call SQL search API:
   ```typescript
   const response = await fetch('/api/search/sql', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       filters: {
         period: "Romantic",
         genre: "Chamber music"
       },
       limit: 10
     })
   });

   const data = await response.json();
   // data.works contains matching works with full composer/genre details
   ```

### Direct API Call

```typescript
// Search for Debussy piano works
const response = await fetch('/api/search/sql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: {
      composer: "Debussy",
      instrument: "piano"
    },
    limit: 20
  })
});

const { works, total } = await response.json();
console.log(`Found ${total} works by Debussy for piano`);
```

## Implementation Details

### Query Logic

1. **Period**: Case-insensitive partial match on `works.period`
2. **Composer**: Looks up composer by name, then filters works by composer ID(s)
3. **Genre**: Looks up genre by exact name, filters by `works.genre_id`
4. **Subgenre**: Looks up subgenre by exact name, filters by `works.subgenre_id`
5. **Instrument**: OR search across `works.instrumentation` and `works.scoring` columns

### Joined Data

Each work includes:
- Full composer details (name, dates, nationality, period, descriptions)
- Genre details (name, slug)
- Subgenre details (name, slug)

### Performance Considerations

- Genre and subgenre lookups are single-row queries with exact matches (fast)
- Composer lookup uses ILIKE for partial matching (supports "Debussy" → "Claude Debussy")
- Instrument search uses ILIKE with OR conditions across two text columns
- Results are paginated (default 20 per page)
- Total count is included for pagination UI

## Error Handling

Returns HTTP 500 with error details if:
- Database client unavailable
- Query execution fails
- Invalid request format

## SQL vs Vector Search Decision

**Use SQL search when:**
- Query contains explicit filters (period, genre, composer, etc.)
- User wants exact/categorical matching
- Example: "Baroque violin concertos"

**Use Vector search when:**
- Query is semantic/descriptive without clear filters
- User describes mood, character, or vague concepts
- Example: "Something peaceful and contemplative that feels like autumn"

The action-decision agent should determine which search type to use based on the user's message.
