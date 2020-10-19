<script>
	import { selection } from './stores.js'
	export let data
</script>

<style>
	.selected {
		stroke: black;
		stroke-width: 2px;
		vector-effect: non-scaling-stroke;
	}
</style>

<g>
	{#each data as d}
		<circle cx="{d.x}" cy="{d.x}" r="{d.v}" fill="{d.color}" on:click="{() => $selection = d}" class:selected="{$selection == d}"/>
	{/each}
</g>