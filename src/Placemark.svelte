<script>
    import { selection, zoom } from 'anymapper'
    import { Marker } from 'anymapper'
    
    export let icon
</script>

<style>
</style>

{#if $selection && $selection.position}
<g transform="translate({$selection.position.x} {$selection.position.y}) scale({1/$zoom})">
    <Marker {icon} shape="pin" scale="1.25" fg_color="white" bg_color="brown" outline_color="#6c0808"/>
</g>
{/if}