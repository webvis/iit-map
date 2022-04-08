<script>
    import { zoom, current_layer, is_position_in_layer } from 'anymapper'
    import { select } from 'anymapper'
    import { Marker } from 'anymapper'

    export let data

    $: opaque = data.position && is_position_in_layer(data.position, $current_layer)
</script>

<style>
</style>

{#if data.position}
<g class="selectable" transform="translate({data.position.x},{data.position.y}) scale({1/$zoom})"
    opacity={opaque ? 1 : 0.5}
    on:click={() => select(data.type == 'person' ? data.email : data.id)}>
    <Marker
        icon={data.type == 'person' ? 'person' : null}
        fg_color="white"
        bg_color="brown"
        outline_color="#6c0808"
        shape="pin"
        scale="0.5"
    />
</g>
{/if}