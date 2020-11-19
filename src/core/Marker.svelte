<script>
    import { current_layer, semantic_zoom } from './stores.js'

    export let position
</script>

<style>


@media only screen and (max-width: 600px) {
    .marker {
        transform: scale(1.5);
    }
}
</style>

{#if position.layers.has($current_layer.name)}
<g class="selectable marker" transform="translate({position.x},{position.y}) scale({$semantic_zoom})" on:click>
    <slot></slot>
</g>
{/if}