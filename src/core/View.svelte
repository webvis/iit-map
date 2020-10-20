<script>
	import * as d3 from 'd3'

	import { layers, current_layer, selection } from './stores.js'
	import { onMount } from 'svelte'

	import Placemark from './Placemark.svelte'

	export let viewBox
	export let placemark_icon // FIXME expose Placemark component
	
	let svg
	let zoomable_group
	let current_zoom_transform = d3.zoomIdentity
	let current = false
	
	onMount(() => {
		// auto populate layers store from defined Layer components
		$layers = new Map()
		let first_done = false
		svg.querySelectorAll('.layer').forEach(layer => {
			let key = layer.getAttribute('data:name')
			let type = layer.getAttribute('data:type')
			let visible = false

			// first base or floor layer visible and current by default
			if (!first_done && (type == 'base' || type == 'floor')) {
				visible = true
				first_done = true
				current = true
			}

			let d = {
				name: key,
				type: type,
				visible: visible
			}
			
			$layers.set(key, d)

			if (current) {
				$current_layer = d
				current = false
			}
		})

		// enable d3 zoom
		d3.select(svg).call(d3.zoom()
			.scaleExtent([0, Infinity])
			.on('zoom', handleZoom))

		function handleZoom() {
			current_zoom_transform = d3.event.transform
			refreshZoom()
		}
	})

	function refreshZoom() {
		d3.select(zoomable_group)
			.attr('transform', current_zoom_transform)

		d3.selectAll(zoomable_group.querySelectorAll('.noZoom'))
			.attr('transform', `scale(${1/current_zoom_transform.k})`)
	}
</script>

<style>
	.view {
		width: 100%;
		height: 100%;
		position: fixed; /* needed to avoid jumping whenever the hash is changed */
	}
</style>

<svg class="view" bind:this={svg} {viewBox}>
	<g bind:this={zoomable_group}>
		<slot></slot>
		{#if $selection && $selection.position}
			<Placemark on:ready={refreshZoom} icon={placemark_icon}/> <!-- the Placemark needs to be rescaled when placed -->
		{/if}
	</g>
</svg>