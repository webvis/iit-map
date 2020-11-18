<script>
    import { select, current_layer } from './stores.js'

    export let data
</script>

<style>


@media only screen and (max-width: 600px) {
    .marker {
        transform: scale(1.5);
    }
}
</style>

{#if data.position.layers.has($current_layer.name)}
<g transform="translate({data.position.x},{data.position.y})">
    <g class="noZoom selectable marker" on:click={() => select(data.id) }>
        <circle r="62" fill="#777" stroke="#777" stroke-width="5" cy="5"/>
        <circle r="62" fill="#7b5b5b" stroke="white" stroke-width="7.5"/>
        <text class="material-icons" fill="white" transform="scale(3.5)" text-anchor="middle" dy=".5em">{data.icon}</text>
    </g>
</g>
{/if}