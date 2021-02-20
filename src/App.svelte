<script>
	import * as d3 from 'd3'

	import { selection, select, selected_id, results } from 'anymapper'
	import { View, Layer, InfoBox, InfoBoxHeader, OmniBox, FloorLayersCtrl, SVGLayers, ResultsBox, Marker, Mark } from 'anymapper'

	// application-specific code
	import { rooms, pois, room_positions, people, search, getQualifica, getImmagine } from './storesCNR.js'

	import RoomInfo from './RoomInfo.svelte'
	import PersonInfo from './PersonInfo.svelte'
	import RoomPeopleList from './RoomPeopleList.svelte'
	import CNRResults from './CNRResults.svelte'

	import { Content } from '@smui/card'
	
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
		else if($pois.has($selected_id))
			$selection = $pois.get($selected_id)
		else
			$selection = null
	}

	selected_id.subscribe(updateSelection)
	rooms.subscribe(updateSelection)

	function handleSearch(e) {
		$results = search(e.detail.query)
	}

	const category_colors = {
		'food_and_drinks': '#f57f17',
		'mobility': '#00b0ff',
		'emergency': '#db4437',
		'services': '#6b7de3',
		'commercial': '#5491f5',
		'entrance': '#f5f5f5'
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
		left: calc(50% - var(--logo-width)/2);
		width: var(--logo-width);
		pointer-events: none;
		--logo-width: 60px;
	}
	footer {
		position: fixed;
		right: 0;
		bottom: 0;
		font-size: 10px;
		background: rgba(255,255,255,0.6);
		padding: 2px;
	}

	:global(:root) {
		--infobox-header-height: 86px;
		--omnibox-margin: 10px;
	}
</style>

<div class="wrapper">

<View viewBox="1950 1400 5480 4770" placemark_icon={ $selection && $selection.icon ? $selection.icon : $selection && $selection.type == 'person' ? 'person' : 'sensor_door' }>
	<SVGLayers
		path="data/cnr_flat.svg"
		names="T 1 2 overlay"
		modes="floor floor floor overlay"
		postprocess={postprocessLayers}
	/>
	<Layer name="pois">
		{#each Array.from($pois.values()) as poi}
			<Marker position={poi.position} on:click={() => select(poi.id) }>
				<Mark
					icon={poi.icon}
					text={poi.text}
					fg={poi.category == 'entrance' ? '#0d5784' : undefined}
					bg={poi.category ? category_colors[poi.category] : undefined}
					shape={poi.shape}
				/>
			</Marker>
		{/each}
	</Layer>
</View>

<FloorLayersCtrl/>

<img src="assets/IIT+CNR-RGB-logos.svg" alt="IIT-CNR logo" class="logo"/>

<footer><a href="https://www.iit.cnr.it/privacy-policy/">Privacy Policy</a> - Made with <a href="https://github.com/webvis/iit-map">MapVis</a>, by Human Centered Technologies Lab @IIT-CNR</footer>

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
	
		{#if $selection.sede}
			<hr/>
			<Content>
				<table>
					<tr><td>Sede</td><td>{$selection.sede == "pi" ? "Area della Ricerca di Pisa" : $selection.sede == "cs" ? "UOS Cosenza" : ""}</td></tr>
				</table>
			</Content>
		{/if}
		
		{#if $selection.stanza}
			<hr/>
			<RoomInfo/>
		{/if}
	{:else if $selection.type == 'poi'}
		{#if $selection.category == 'entrance'}
			<InfoBoxHeader title="Ingresso {$selection.text}" subtitle="Ingresso"/>
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