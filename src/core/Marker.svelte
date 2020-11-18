<script>
    import { current_layer } from './stores.js'

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
<g transform="translate({position.x},{position.y})" on:click>
    <g class="noZoom selectable marker">
        <slot></slot>
    </g>
</g>
{/if}