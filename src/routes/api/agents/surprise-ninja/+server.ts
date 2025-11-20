// This endpoint selects a random featured work and generates an interesting summary using DeepSeek

import { chat } from '$lib/server/openai';
import { AiMessage, AiRole } from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { WorkWithRelations } from '$lib/databaseTypes.js';

export interface SurpriseResponse {
	work: WorkWithRelations;
	summary: string;
}

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Get Supabase client from locals (server-side authenticated client)
		const supabase = locals.supabase;

		if (!supabase) {
			return new Response(JSON.stringify({ error: 'Database client not available' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Query for all featured works
		const { data: featuredWorks, error: worksError } = await supabase
			.from('works')
			.select('*')
			.eq('featured', true);

		if (worksError) {
			console.error('Supabase query error:', worksError);
			return new Response(
				JSON.stringify({
					error: 'Database query failed',
					details: worksError.message
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		if (!featuredWorks || featuredWorks.length === 0) {
			return new Response(JSON.stringify({ error: 'No featured works found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Select a random work from the featured works
		const randomWork = featuredWorks[Math.floor(Math.random() * featuredWorks.length)];

		// Fetch the composer details for the selected work
		if (!randomWork.composer) {
			return new Response(JSON.stringify({ error: 'Selected work has no composer' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const { data: composer, error: composerError } = await supabase
			.from('composers')
			.select('id, name, birth_date, death_date, nationality, composer_period, short_description')
			.eq('id', randomWork.composer)
			.single();

		if (composerError) {
			console.error('Composer query error:', composerError);
			return new Response(
				JSON.stringify({
					error: 'Failed to fetch composer',
					details: composerError.message
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Fetch genre and subgenre details if available
		let genreDetails = null;
		let subgenreDetails = null;

		if (randomWork.genre_id) {
			const { data: genre } = await supabase
				.from('genres')
				.select('id, name, slug')
				.eq('id', randomWork.genre_id)
				.single();
			genreDetails = genre;
		}

		if (randomWork.subgenre_id) {
			const { data: subgenre } = await supabase
				.from('subgenres')
				.select('id, name, slug')
				.eq('id', randomWork.subgenre_id)
				.single();
			subgenreDetails = subgenre;
		}

		// Build the work with relations object
		const workWithRelations: WorkWithRelations = {
			...randomWork,
			composer_details: composer,
			genre_details: genreDetails,
			subgenre_details: subgenreDetails
		};

		// Prepare data for AI prompt
		const workInfo = {
			name: randomWork.name,
			composer: composer.name,
			period: randomWork.period || composer.composer_period,
			genre: genreDetails?.name || randomWork.genre,
			subgenre: subgenreDetails?.name,
			instrumentation: randomWork.instrumentation,
			duration: randomWork.duration,
			publication_year: randomWork.publication_year,
			short_description: randomWork.short_description,
			composer_bio: composer.short_description
		};

		// Generate AI summary using DeepSeek via the chat function
		const prompt = `Provide a single engaging sentence that captures why this musical work and its composer are interesting. Focus on what makes them notable, unique, or culturally significant.

Work: ${workInfo.name}
Composer: ${workInfo.composer} (${workInfo.period || 'Unknown period'})
Genre: ${workInfo.genre || 'Unknown'}${workInfo.subgenre ? `, ${workInfo.subgenre}` : ''}
Instrumentation: ${workInfo.instrumentation || 'Unknown'}
${workInfo.short_description ? `Description: ${workInfo.short_description}` : ''}
${workInfo.composer_bio ? `About the composer: ${workInfo.composer_bio}` : ''}

Be concise, engaging, and informative. Avoid generic statements. Highlight specific achievements, innovations, or interesting historical context.`;

		const messages: AiMessage[] = [
			{
				role: AiRole.User,
				content: prompt
			}
		];

		const aiResponse = await chat(messages);

		// Handle error response from chat
		if (!aiResponse || 'error' in aiResponse) {
			return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Extract the summary text
		const summary = aiResponse.content || 'No summary available';

		// Return the response
		const response: SurpriseResponse = {
			work: workWithRelations,
			summary: summary
		};

		return json(response);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		console.error('Surprise endpoint error:', errorMessage);
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
