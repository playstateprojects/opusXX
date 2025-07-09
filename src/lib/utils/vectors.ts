import { AiMessage, AiOption, AiRole, VectorMatch } from "$lib/types";
import { WorkCard } from "$lib/zodDefinitions";
import { getComposerByName } from "./airtable";

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

  console.log("resssss", chatResponse.content);
  const query = JSON.parse(chatResponse.content).query;
  return query;
};
const processVectors = async (vectorResults: any, messages: AiMessage[]): Promise<WorkCard[]> => {
  const systemMessage: AiMessage = {
    role: AiRole.System,
    content: `You are a classical music programming assistant specialized in female composers.Your task is to analyze a user query and a set of matched documents, then respond with a structured JSON object that includes both the relevant source material and a concise explanation of why each document was selected.
You must always return **up to five documents**. If none are strong matches, return the three **closest possible** based on stylistic, instrumental, or conceptual connections.

Your output must strictly follow the structure below:

{
"summary": "<brief explanation of how the documents relate to the query, even if not ideal matches>",
"matches": [
{
"document_name": "<exact filename of the input document, including .md extension>",
"file_id": "<exact file_id from the supplied information>",
"composer_name": "<name of the composer>",
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
  try {
    const response = await fetch('/api/chat/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    let res = await response.json();
    console.log('AI Raw Response:', res.content);

    // Robust JSON extraction that handles:
    // 1. Raw JSON
    // 2. Markdown code blocks
    // 3. Accidental text before/after
    const extractJSON = (str: string) => {
      // Handle code blocks
      const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (codeBlockMatch) return codeBlockMatch[1];

      // Handle potential wrapped JSON
      const jsonMatch = str.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0] : str;
    };

    const jsonString = extractJSON(res.content);
    console.log('Extracted JSON:', jsonString);

    // Parse with reviver to ensure strict compliance
    const parsed = JSON.parse(jsonString, (key, value) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      return value;
    });
    let worksArray: WorkCard[] = []

    if (Array.isArray(parsed.matches)) {
      parsed.matches.forEach(async (match: VectorMatch) => {
        if (!match.composer_name) {
          throw new Error('Match is missing a composer name');
        }
        console.log(match.composer_name);
        let composerData = await getComposerByName(match.composer_name);
        console.log("compD", composerData)
        let workCard: WorkCard = {
          insight: match.justification,
          work: {
            title: "demo title",
            composer: composerData
          }

        }
        worksArray.push(workCard)
      })
      // If we got bare array, wrap it
    } else if (parsed && parsed.works) {
      // If we got correct structure
      worksArray = parsed.works;
    } else if (parsed && parsed.work) {
      // If we got single work
      worksArray = [parsed];
    } else {
      throw new Error('Unexpected response structure');
    }
    console.log(worksArray)
    // Validate we got proper WorkCard objects
    const validatedCards = worksArray.map((item: any) => {
      if (!item.work || !item.work.title) {
        throw new Error('Missing required work fields');
      }
      return item as WorkCard;
    });

    return validatedCards;
  } catch (err) {
    console.error('Vector processing error:', err);
    // Consider adding retry logic here if appropriate
    return [];
  }
};

export { getVectorQuery, processVectors };
