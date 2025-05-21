<script lang="ts">
	import { onMount } from 'svelte';
	import SpotlightCard from './cards/SpotlightCard.svelte';
	import { Spotlight } from '$lib/zodDefinitions.js';
	const spotlights: Spotlight[] = [
		{
			subtitle: 'Jacquot & Midori',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/56a3d001-31dc-442a-d255-6a262f994400/public',
			title: `Vivian Fung,
Antonín Dvorák &
Amy Beach`,
			content: `Featuring Vivian Fung's Earworms, Dvořák's Violin Concerto in A minor, and Amy Beach's Gaelic Symphony.`,
			date: 'Sun, June 22, 2025',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/d2baa756-fda3-42b4-81d4-11e7b6246700/public',
			colour: 'xx-yellow',
			type: 'ORCHESTRA SPOTLIGHT',
			cta: {
				link: '#',
				label: 'more'
			}
		},
		{
			subtitle: `Die dunkle Seite 
			des Mondes`,
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/9179d099-a569-423a-ff16-1137ff724300/public',
			title: 'Unsuk Chin',
			content: `Exploring a dangerous Faustian alliance between quantum physics, psychoanalysis and diabolical forces.`,
			date: 'Sun, May 18, 2025',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/91541ff1-eae5-483e-b89a-bb07c4c84000/public',
			colour: 'xx-red',
			type: 'WORLD PREMIERE',
			cta: {
				link: 'https://www.boosey.com/licensing/news/Unsuk-Chin-_Dark-Side-of-the-Moon_-opera-premiere-in-Hamburg/102590',
				label: 'more'
			}
		},
		{
			subtitle: `Beyond All
			 Happiness and Joy`,
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/1238434d-b160-4200-a5a2-aaff37e65c00/public',
			title: `Victoria 
			Borisova-Ollas`,
			content: `A modern meditation on sorrow, memory, and transcendence`,
			date: '',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/ce0f1e53-991e-4483-8285-49f79138c300/public',
			colour: 'xx-red',
			type: 'Publisher spotlight',
			cta: {
				link: 'https://www.universaledition.com/en/Beyond-All-Happiness-and-Joy/P0314368',
				label: 'more'
			}
		},
		{
			subtitle: 'Sacred Vocal Works in 5 Volumes',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/d3a40f70-01aa-4e67-d444-32a54e972400/public',
			title: 'Mel Bonis',
			content: `A luminous collection of sacred choral music revealing Bonis’s lyrical gift and spiritual depth.`,
			date: '',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/fdb30c6e-37d9-4c90-5d99-d03d0a156800/public',
			colour: 'xx-peach',
			type: 'Publisher spotlight',
			cta: {
				link: 'https://furore-verlag.de/',
				label: 'more'
			}
		}
	];

	const state = $state({
		activeCard: -1
	});
	onMount(() => {
		state.activeCard = Math.round(Math.random() * 3);
		// state.activeCard = 3;
	});
</script>

{#each spotlights as spot, idx}
	{#if idx == state.activeCard}
		<SpotlightCard
			title={spot.title}
			image={spot.image}
			subtitle={spot.subtitle}
			colour={spot.colour}
			cta={spot.cta}
			date={spot.date}
			type={spot.type}
			logo={spot.logo}
			content={spot.content}
		></SpotlightCard>
	{/if}
{/each}
