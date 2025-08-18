import { AiMessage, AiOption, AiRole, CardComposer, VectorMatch } from "$lib/types";
import { Composer, WorkCard } from "$lib/types";
import { extractJSON } from "./stringUtils";
import { getComposerByName } from "./supabase";

const vectorOptimiserPromt = `You are a search query optimizer for a vector database containing only classical music by female composers.
Your task is to rewrite user queries into dense, high-recall search term lists optimized for this domain.

You must:
Identify the core musical topic(s) and intent
Add synonyms, related forms, genres, eras, instrumentation, or styles
Remove filler words and irrelevant phrasing
Focus on musical concepts, not composer gender

Important Rules:
Do not include terms like “female,” “woman,” or “composer” — they are implied by the dataset
Focus instead on forms, instruments, styles, eras, techniques, and emotions
Do not add stylistic, emotional, or historical terms (e.g., “romanticism,” “baroque,” “impressionism”) unless they are explicitly mentioned in the user query
Do not speculate about genre, period, or mood if the user did not mention it
Do not output explanations or punctuation
Do not include duplicate terms
Output the result as a JSON object in the following format:

{
  "query": "term1 term2 term3 term4 ..."
}
Example Input:

"Are there any romantic era violin works by women?"

Example Output:

{
  "query": "romantic era violin sonata concerto chamber 19th century strings"
}
Only output the JSON.
`;

const getVectorQuery = async (messages: AiMessage[]): Promise<string> => {

  const systemMessage: AiMessage = {
    role: AiRole.System,
    content: vectorOptimiserPromt
  }
  const response = await fetch('/api/chat/json', {
    method: 'POST',
    body: JSON.stringify({ messages: [systemMessage, ...messages] })
  });

  const chatResponse = await response.json();

  console.log("resssss", chatResponse);
  const query = chatResponse.query;
  return query;
};
const processVectors = async (vectorResults: any, messages: AiMessage[]): Promise<{ cards: WorkCard[], overview: string }> => {
  const systemMessage: AiMessage = {
    role: AiRole.System,
    content: `You are a classical music programming assistant specialized in female composers.Your task is to analyze a user query and a set of matched documents, then respond with a structured JSON object that includes both the relevant source material and a concise explanation of why each document was selected.
You must always return **up to five documents**. If none are strong matches, return the three **closest possible** based on stylistic, instrumental, or conceptual connections.

Your output must strictly follow the structure below:

{
"overview": "<A brief overview of the selection of works to be shared with the user>",
"matches": [
{
"document_name": "<exact filename of the input document, including .md extension>",
"file_id": "<exact file_id from the supplied information>",
"composer_name": "<name of the composer>",
"work_title": "<title of the work>",
"justification": "<short reason why this document was selected — e.g., similar instrumentation, electronic elements, thematic overlap>",
"content": "<verbatim full content of the selected document>"
}
// Up to 5 entries total
]
}

Guidelines:

1. Always include up to 3 documents, ranked by relevance.
2. If exact matches aren't found, select the best available — explain this in the justification.
3. Do not fabricate content. Only include what is present in the provided documents.
4. Maintain document integrity: content must be copied exactly from the source.
5. The justification must be concise and explain why the document was chosen, even if weakly related.
6. Do not interpret composer biographies unless the query explicitly asks.
7. You may infer relevance based on genre, use of technology, cross-disciplinary experimentation, or thematic affinity (e.g., 'fusion' could include electronic or electroacoustic work).
8. If fewer than three documents were supplied, include as many as are available and note this in the summary.

Your output must always be valid JSON and match this schema exactly.`
  };

  // Ensure all messages are non-callable objects
  const vectorMessage: AiMessage = {
    role: AiRole.User,
    content: JSON.stringify(vectorResults)
  };
  let msgs = [systemMessage, ...messages, vectorMessage];
  console.log('msgs', msgs);
  const schema = {
    type: "object",
    properties:
    {
      "overview": { type: "string" },
      "matches": {
        "type": "array",
        "items": {
          "document_name": { type: "string" },
          "file_id": { type: "string" },
          "composer_name": { type: "string" },
          "work_title": { type: "string" },
          "justification": { type: "string" },
          "content": { type: "string" }
        }
      }
    }
  }
  try {
    const response = await fetch('/api/chat/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, schema: schema })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    let res = await response.json();
    console.log('AI Raw Response:', res);



    const parsed = res;

    let worksArray: WorkCard[] = []

    if (Array.isArray(parsed.matches)) {
      for (const match of parsed.matches) {
        if (!match.composer_name) {
          throw new Error('Match is missing a composer name');
        }
        const composerData = await getComposerByName(match.composer_name);
        console.log("cddddy", composerData)
        if (composerData.works) {
          console.log("cddddx", composerData.works)
          const selectedWork = composerData.works?.find((wrk: any) => {
            console.log("wrk", wrk)
            return wrk.name == match.name
          })
          console.log("----------->", selectedWork)
        } else {
          console.log("no works")
        }



        // console.log("cdddd", composerData.profile_images ? [0])
        if (composerData) {
          const workComposer: CardComposer = {
            name: composerData.Name ?? match.composer_name,
            birthDate: composerData["Date of Birth"],
            deathDate: composerData["Date of Death"] ?? '',
            imageURL: composerData["imageURL"] || 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/b584cc33-cddb-4e8f-fcc3-129e4b25d000/public',
            profileImages: composerData["profile_images"],
            shortDescription: composerData['Short Description'],
            longDescription: composerData['Long Description'],
          }
          const workCard: WorkCard = {
            insight: match.justification,
            work: {
              title: match.work_title ?? "demo title " + composerData.name,
              composer: workComposer
            }
          };
          worksArray.push(workCard);
        } else {
          console.log("composer " + match.composer_name + " not found")
        }

      }
      // If we got bare array, wrap it
    }
    // Validate we got proper WorkCard objects
    const validatedCards = worksArray.map((item: any) => {
      if (!item.work || !item.work.title) {
        throw new Error('Missing required work fields');
      }
      return item as WorkCard;
    });

    return { cards: validatedCards, overview: parsed.overview };
  } catch (err) {
    console.error('Vector processing error:', err);
    // Consider adding retry logic here if appropriate
    return { cards: [], overview: 'I was unable to find any works matching you query, please could you try giving me an alternative.' };
  }
};

export { getVectorQuery, processVectors };
