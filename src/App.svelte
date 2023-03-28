<script>
	import * as d3 from 'd3'

	import { selection, select, selected_id, results, hover_enter, hover_leave } from 'anymapper'
	import { View, Layer, InfoBox, InfoBoxHeader, OmniBox, FloorLayersCtrl, SVGLayers, ResultsBox, Depiction } from 'anymapper'

	// application-specific code
	import { rooms, pois, room_positions, people, search, getQualifica, getImmagine } from './storesCNR.js'

	import RoomInfo from './RoomInfo.svelte'
	import PersonInfo from './PersonInfo.svelte'
	import RoomPeopleList from './RoomPeopleList.svelte'
	import ResultsCNR from './ResultsCNR.svelte'
	import Actions from './Actions.svelte'

	import { Content } from '@smui/card'

	import POI from './POI.svelte'
	import Placemark from './Placemark.svelte'

	let omnibox
	let results_box
	
	function postprocessLayers(layers) {
		let new_room_positions = new Map()
		layers.forEach((layer, layer_id) => {
			d3.select(layer).selectAll('.selectable').each(function () {
				let id = d3.select(this).attr('id')
				let label = this.getAttributeNS('http://www.inkscape.org/namespaces/inkscape', 'label')
				new_room_positions.set( id, {...centroid(this), label: label, layers: new Set([layer_id])} )
			})
			$room_positions = new_room_positions

			d3.select(layer).selectAll('.selectable')
				.on('click', function () {
					let id = d3.select(this).attr('id')
					select(id)
				})
				.on('mouseenter', function () {
					let id = d3.select(this).attr('id')
					hover_enter(id)
				})
				.on('mouseleave', function () {
					let id = d3.select(this).attr('id')
					hover_leave(id)
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
	:global(.room.hovered) {
		fill: orange;
	}

	:global(.toilet) {
		fill: #bcd0ea;
		stroke: #757575;
		stroke-width: 3.2;
	}
	:global(.toilet.hovered) {
		fill: #9fbfe8;
	}

	:global(.building_label) {
		fill: #333;
		pointer-events: none;
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
		--infobox-header-height: 200px;
		--omnibox-margin: 10px;
	}
</style>

<div class="wrapper">

<View viewBox="1950 1400 5480 4770" scaleExtent="0.5 8" translateExtent="-1050 -1600 10430 9170">
	<SVGLayers
		path="data/cnr_flat.svg"
		names="T 1 2 overlay"
		modes="floor floor floor overlay"
		postprocess={postprocessLayers}
	/>
	<Layer name="pois">
		{#each Array.from($pois.values()) as poi}
			<POI data={poi}/>
		{/each}
	</Layer>
	<Placemark icon={$selection && $selection.icon ? $selection.icon : $selection && $selection.type == 'person' ? 'person' : 'meeting_room'}/>
</View>

<FloorLayersCtrl/>

<img src="assets/IIT+CNR-RGB-logos.svg" alt="CNR-IIT logo" class="logo"/>

<footer><a href="https://www.iit.cnr.it/privacy-policy/">Privacy</a> - <a href="credits">Credits</a> - Powered by <a href="https://github.com/webvis/anymapper">anymapper</a>, by <a href="//hct.iit.cnr.it/">HCT Lab</a> @<a href="//www.iit.cnr.it/">CNR-IIT</a></footer>

<OmniBox on:search={handleSearch} bind:this={omnibox} on:cursorexit={ () => results_box.focus() }>
	<ResultsBox bind:this={results_box} on:cursorexit={ () => omnibox.focus() }>
		<ResultsCNR/>
	</ResultsBox>
</OmniBox>

<InfoBox>
	{#if $selection.type == 'office'}
		<InfoBoxHeader title="{$selection.stanza}" subtitle="Ufficio"/>
		<Actions screen="narrow"/>
		<Depiction src="assets/room_photos/{$selection.id}.jpg" fallback="url(assets/room_photos/default_office.png)"/>
		<Actions screen="wide"/>
		<hr/>
		<RoomInfo/>
		<hr/>
		<RoomPeopleList/>
	{:else if $selection.type == 'room'}
		<InfoBoxHeader title="{$selection.label || $selection.id}" subtitle="Stanza"/>
		<Actions screen="narrow"/>
		<Depiction src="assets/room_photos/{$selection.id}.jpg" fallback="url(assets/room_photos/default_room.png)"/>
		<Actions screen="wide"/>
	{:else if $selection.type == 'person'}
		<InfoBoxHeader title="{$selection.nome} {$selection.cognome}" subtitle="{getQualifica($selection)}"/>
		<Actions screen="narrow"/>
		<Depiction src={getImmagine($selection)} size="contain" fallback="url(assets/default_person.png)"/>
		<Actions screen="wide"/>
		<hr/>
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
		<InfoBoxHeader title={$selection.title} subtitle={$selection.subtitle || ''}/>
		<Actions screen="narrow"/>
		<Depiction src="assets/room_photos/{$selection.id}.jpg" fallback="url(assets/default_poi.png)"/>
		<Actions screen="wide"/>
	{/if}
</InfoBox>

</div>