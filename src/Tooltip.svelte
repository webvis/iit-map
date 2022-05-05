<script>
	import Card from '@smui/card'

    export let width = 300
    export let height = 200
</script>

<style>
g {
    /*pointer-events: none;*/
}
</style>


<g>
    <foreignObject x={-width/2} y="0" {width} {height}>
        <html style="background: white;">
            <slot/>
        </html>
    </foreignObject>
</g>