<script>
    import { current_layer, semantic_zoom } from './stores.js'

    export let position
</script>

<style>


@media only screen and (max-width: 600px) {
    .marker_content {
        transform: scale(2);
    }
}
</style>

{#if position.layers.has($current_layer.name)}
<g class="selectable marker" transform="translate({position.x},{position.y}) scale({$semantic_zoom})" on:click>
    <g class="marker_content">
        <slot></slot>
    </g>
</g>
{/if}