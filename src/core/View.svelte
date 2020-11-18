<script>
	import * as d3 from 'd3'

	import { layers, current_layer, selection } from './stores.js'
	import { onMount } from 'svelte'

	import Placemark from './Placemark.svelte'

	export let viewBox
	export let placemark_icon // FIXME expose Placemark component
	
	let svg
	let zoomable_group
	let zoom_behavior
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

			// overlays are visible by default
			if (type == 'overlay') {
				visible = true
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
		zoom_behavior = d3.zoom()
			.scaleExtent([0, Infinity])
			.on('zoom', handleZoom)

		d3.select(svg).call(zoom_behavior)

		function handleZoom() {
			current_zoom_transform = d3.event.transform
			refreshZoom()
		}

		// focus to enable keyboard interaction
		svg.focus()
	})

	function refreshZoom() {
		d3.select(zoomable_group)
			.attr('transform', current_zoom_transform)

		d3.selectAll(zoomable_group.querySelectorAll('.noZoom'))
			.attr('transform', `scale(${1/current_zoom_transform.k})`)
	}

	function scaleBy(k, duration) {
		duration = duration === undefined ? 300 : duration
		zoom_behavior.scaleBy(d3.select(svg).transition().duration(duration), k)
	}

	function scaleTo(k, duration) {
		duration = duration === undefined ? 300 : duration
		zoom_behavior.scaleTo(d3.select(svg).transition().duration(duration), k)
	}

	function translateBy(x, y, duration) {
		duration = duration === undefined ? 300 : duration
		zoom_behavior.translateBy(d3.select(svg).transition().duration(duration), x, y)
	}

	function translateTo(p, duration) {
		duration = duration === undefined ? 1200 : duration
		zoom_behavior.translateTo(d3.select(svg).transition().duration(duration), p.x, p.y)
	}

	// listen to selection changes
	selection.subscribe(handleNewSelection)

	function handleNewSelection(d) {
		if(d && d.position) {
			translateTo(d.position)
		}
	}

	function handlePlacemarkReady() {
		// this was used to scale the placemark to the current zoom,
		// but since we update the zoom whenever there's a change of
		// selection it is not needed anymore
	}

	function handleKeyUp(e) {
		const delta = 500 / current_zoom_transform.k

		// pan and zoom keyboard control
		switch(e.key) {
			case 'ArrowRight':
				translateBy(-delta,0)
				break
			case 'ArrowLeft':
				translateBy(delta,0)
				break
			case 'ArrowUp':
				translateBy(0,delta)
				break
			case 'ArrowDown':
				translateBy(0,-delta)
				break
			case '+':
				scaleBy(1.5)
				break
			case '-':
				scaleBy(0.66)
				break
		}
	}
</script>

<style>
	.view {
		width: 100%;
		height: 100%;
		position: fixed; /* needed to avoid jumping whenever the hash is changed */
	}
	.view:focus {
		outline: none;
	}
</style>

<svg class="view" bind:this={svg} {viewBox} tabindex="0" on:keyup={handleKeyUp}>
	<g bind:this={zoomable_group}>
		<slot></slot>
		{#if $selection && $selection.position}
			<Placemark on:ready={handlePlacemarkReady} icon={placemark_icon}/> <!-- the Placemark needs to be rescaled when placed -->
		{/if}
	</g>
</svg>