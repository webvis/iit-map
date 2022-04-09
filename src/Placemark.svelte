<script>
    import { selection, zoom } from 'anymapper'
    import { Marker } from 'anymapper'

    let bg_color = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color')
    
    export let icon
</script>

<style>
</style>

{#if $selection && $selection.position}
<g transform="translate({$selection.position.x} {$selection.position.y}) scale({1/$zoom})">
    <Marker
        {icon}
        icon_spacing={$selection.icon_spacing}
        shape="pin"
        scale="1.25"
        fg_color="white"
        {bg_color}
        outline_color="#6c0808"
    />
</g>
{/if}