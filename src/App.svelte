<script>
	import { onMount } from 'svelte'

	import * as d3 from 'd3'

	import { selection, select, selected_id, results } from './core/stores.js'

	import View from './core/View.svelte'
	import Layer from './core/Layer.svelte'
	import InfoBox from './core/InfoBox.svelte'
    import InfoBoxHeader from './core/InfoBoxHeader.svelte'
	import OmniBox from './core/OmniBox.svelte'
	import FloorLayersCtrl from './core/FloorLayersCtrl.svelte'
	import InlineSVG from './core/InlineSVG.svelte'
	import SVGLayers from './core/SVGLayers.svelte'
	import ResultsBox from './core/ResultsBox.svelte'

	// application-specific code
	import { rooms, room_positions, people, search, getQualifica, getImmagine } from './storesCNR.js'

	import RoomInfo from './RoomInfo.svelte'
	import PersonInfo from './PersonInfo.svelte'
	import RoomPeopleList from './RoomPeopleList.svelte'
	import CNRResults from './CNRResults.svelte'
	
	function postprocessLayers(layers) {
		let new_room_positions = new Map()
		layers.forEach((layer, layer_id) => {
			d3.select(layer).selectAll('.selectable').each(function () {
				let id = d3.select(this).attr('id')
				new_room_positions.set( id, {...centroid(this), layers: new Set([layer_id])} )
			})
			$room_positions = new_room_positions

			d3.select(layer).selectAll('.selectable').on('click', function () {
				let id = d3.select(this).attr('id')
				select(id)
			})
		})
	}

	// FIXME to be moved in utils
	function centroid(path) {
		// return the centroid of a given SVG path (considering vertexes only and ignoring curves)
		let points = []
		path.getPathData({normalize: true}).forEach(d => {
			if(d.type == 'Z')
				return

			// last two values are always a point in M, C and L commands
			points.push({x: d.values[d.values.length-2], y: d.values[d.values.length-1]})
		})
		
		// centroid of vertexes
		let sum_p = points.reduce(((a, p) => ({x: a.x+p.x, y: a.y+p.y})), {x: 0, y: 0})
		return {x: sum_p.x/points.length, y: sum_p.y/points.length}
	}

	function updateSelection(_) {
		if($rooms.has($selected_id))
			$selection = $rooms.get($selected_id)
		else if($people.has($selected_id))
			$selection = $people.get($selected_id)
		else
			$selection = null
	}

	selected_id.subscribe(updateSelection)
	rooms.subscribe(updateSelection)

	function handleSearch(e) {
		$results = search(e.detail.query)
	}
</script>

<style>
	/* FIXME? global deafults? */
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
	.wrapper {
		height: 100%;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		position: absolute;
	}

	:global(a), :global(a:hover), :global(a:visited) {
		text-decoration: none;
		color: var(--primary-bg-color);
	}
	:global(a:hover) {
		text-decoration: underline;
	}

	/* application-specific */
	
	/* define global CSS */
	:global(.infobox) {
		width: 350px;
	}
	:global(.omnibox) {
		width: 350px;
	}
	:global(.view) {
		background: #cedbb9;
	}

	:global(.selectable) {
		cursor: pointer;
	}

	:global(.room) {
		fill: #ffd993;
		stroke: #757575;
		stroke-width: 3.2;
	}
	:global(.room:hover) {
		fill: orange;
	}

	.logo {
		position: fixed;
		bottom: 20px;
		left: 20px;
		width: 50px;
	}

	:global(:root) {
		--infobox-header-height: 86px;
		--omnibox-margin: 10px;
	}
</style>

<div class="wrapper">

<View viewBox="1620 1400 5480 4770" placemark_icon={ $selection && $selection.type == 'person' ? 'person' : 'meeting_room'}>
	<SVGLayers
		path="data/cnr_flat.svg"
		names="T 1 2"
		mode="floor"
		postprocess={postprocessLayers}
	/>
</View>

<FloorLayersCtrl/>

<img src="assets/iit-logo.png" alt="IIT" class="logo"/>

<OmniBox on:search={handleSearch}>
	<ResultsBox>
		<CNRResults/>
	</ResultsBox>
</OmniBox>

<InfoBox>
	{#if $selection.type == 'room'}
		<InfoBoxHeader title="{$selection.stanza}" subtitle="Ufficio"/>
		<RoomInfo/>
		<hr/>
		<RoomPeopleList/>
	{:else if $selection.type == 'person'}
		<InfoBoxHeader title="{$selection.nome} {$selection.cognome}" subtitle="{getQualifica($selection)}" depiction={getImmagine($selection)} depictionSize="contain"/>
		<PersonInfo/>
		{#if $selection.stanza}
			<hr/>
			<RoomInfo/>
		{/if}
	{/if}
</InfoBox>

</div>
<!--
<View viewBox="0 0 800 800">
	<Layer name="T" type="floor">
		<InlineSVG path='data/floor0.svg'/>
	</Layer>
	<Layer name="1" type="floor">
		<InlineSVG path='data/floor1.svg'/>
	</Layer>
	<Layer name="2" type="floor">
		<InlineSVG path='data/floor2.svg'/>
	</Layer>
</View>
-->