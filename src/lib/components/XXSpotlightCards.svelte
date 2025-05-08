<script lang="ts">
	import { onMount } from 'svelte';
	import SpotlightCard from './cards/SpotlightCard.svelte';
	import { Spotlight } from '$lib/zodDefinitions.js';
	const spotlights: Spotlight[] = [
		{
			title: 'Jacquot & Midori',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/56a3d001-31dc-442a-d255-6a262f994400/public',
			subtitle: `Vivian Fung,
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
			title: 'Die dunkle Seite des Mondes',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/9179d099-a569-423a-ff16-1137ff724300/public',
			subtitle: 'Unsuk Chin',
			content: `Exploring a dangerous Faustian alliance between quantum physics, psychoanalysis and diabolical forces.`,
			date: 'Sun, May 18, 2025',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/91541ff1-eae5-483e-b89a-bb07c4c84000/public',
			colour: 'xx-red',
			type: 'WORLD Premiere',
			cta: {
				link: '#',
				label: 'more'
			}
		},
		{
			title: 'Beyond All Happiness and Joy',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/1238434d-b160-4200-a5a2-aaff37e65c00/public',
			subtitle: 'Victoria Borisova-Ollas',
			content: `A modern meditation on sorrow, memory, and transcendence`,
			date: '',
			logo: 'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/033078a8-c763-40f7-d52e-f71b4aeab200/public',
			colour: 'xx-red',
			type: 'Publisher spotlight',
			cta: {
				link: '#',
				label: 'more'
			}
		},
		{
			title: 'Sacred Vocal Works in 5 Volumes',
			image:
				'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/d3a40f70-01aa-4e67-d444-32a54e972400/public',
			subtitle: 'Unsuk Chin',
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
		>
			<div class="mb-4 flex flex-col items-center justify-center px-8 font-zwo text-sm font-light">
				<div class="mb-6 text-white">
					{spot.content}
				</div>
				<img src={spot.logo} alt="Staats opper hamburg" class="w-20" />
			</div>
		</SpotlightCard>
	{/if}
{/each}
