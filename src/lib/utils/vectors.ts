import { AiMessage, AiOption, AiRole } from "$lib/types";

const vectorOptimiserPromt = `You are a search query optimizer for a vector database containing only classical music by female composers.
Your task is to rewrite user queries into dense, high-recall search term lists optimized for this domain.

You must:

Identify the core musical topic(s) and intent

Add synonyms, related forms, genres, eras, instrumentation, or styles

Remove filler words and irrelevant phrasing

Focus on musical concepts, not composer gender

Output a space-separated list of search terms

Important:

Do not include terms like “female,” “woman,” or “composer” — they are implied by the dataset

Focus instead on forms, instruments, styles, eras, techniques, and emotions

Example Input:
"Are there any romantic era violin works by women?"
Example Output:
"romantic era violin sonata concerto chamber romanticism 19th century strings"

Constraints:

Do not output punctuation, explanations, or duplicated terms

Do not add stylistic, emotional, or historical terms (e.g. “romanticism,” “baroque,” “impressionism”) unless they are clearly implied in the query.

Do not speculate about genre or mood if the user did not mention it.

Output only the optimized search terms as a flat space-separated string`;

const getVectorQuery = async (messages: AiMessage[]): Promise<string> => {

    const systemMessage: AiMessage = {
        role: AiRole.System,
        content: vectorOptimiserPromt
    }
    const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [systemMessage, ...messages] })
    });

    const chatResponse = await response.json();
    console.log("resssss", chatResponse);
    return "foo";
    // const response = await fetch('/api/chat', {
    // 	method: 'POST',
    // 	body: JSON.stringify({ query: query })
    // });
    // try {
    // 	const files = (await response.json()).result.data;

    // 	console.log('f', files);
    // 	if (Array.isArray(files)) {
    // 		files.forEach(async (file: any) => {
    // 			const trimmedStr = file.filename
    // 				.split('.')[0]
    // 				.replace(/_(?:born|died|sometime)\d*.*$/i, '')
    // 				.trim();
    // 			file.composerName = trimmedStr.replace(/_/g, ' ');
    // 		});
    // 	}
    // 	console.log(files);
    // 	return files;
    // } catch (err: any) {
    // 	console.log('an error occured', err);
    // 	return {};
    // }
};

export { getVectorQuery };
