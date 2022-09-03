<script>
    import { zoom, current_layer, is_position_in_layer, is_position_in_lod } from 'anymapper'
    import { select, hover_enter, hover_leave } from 'anymapper'
    import { Marker } from 'anymapper'

    export let data

    const category_colors = {
		'food_and_drinks': '#f57f17',
		'mobility': '#00b0ff',
		'emergency': '#db4437',
		'services': '#6b7de3',
		'commercial': '#5491f5',
		'entrance': '#f5f5f5',
		'cultural': '#6c461f'
	}

    $: visible = is_position_in_layer(data.position, $current_layer) && is_position_in_lod(data.position, $zoom)
</script>

<style>
</style>

{#if visible}
<g class="selectable" transform="translate({data.position.x},{data.position.y}) scale({1/$zoom})"
    on:click={() => select(data.id)}
    on:mouseenter={() => hover_enter(data.id)}
    on:mouseleave={() => hover_leave(data.id)}>
    <Marker
        icon={data.icon}
        icon_spacing={data.icon_spacing}
        text={data.text}
        fg_color={data.category == 'entrance' ? '#0d5784' : undefined}
        outline_color={data.category == 'entrance' ? '#0d5784' : undefined}
        bg_color={data.category ? category_colors[data.category] : undefined}
        shape={data.shape}
        shadow
    />
</g>
{/if}