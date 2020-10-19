<script>
	import { selection } from './stores.js'
	import { onMount } from 'svelte';
	
	export let aspectRatio = 4/3
	let svg
	let width = 0
	$: height = width / aspectRatio
	
	onMount(() => {
		width = svg.getBoundingClientRect().width
	})
</script>

<style>
	svg {
		width: 100%;
		display: block;
	}
</style>

<svg bind:this={svg} {height}>
	<circle cx="{width/2}" cy="{height/2}" r="{Math.min(width,height)*0.3}" fill="{$selection.color}"/>
</svg>