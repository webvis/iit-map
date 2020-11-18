<script>
    import { selection } from './core/stores.js'

    import { Content } from '@smui/card'
</script>

<Content>
    <table>
        <tr><td>Stanza</td><td><a href="#{$selection.stanza}">{$selection.stanza}</a></td></tr>
        <tr><td>Edificio</td><td>{$selection.edificio}</td></tr>
        <tr><td>Piano</td><td>{$selection.piano}</td></tr>
        <tr><td>Ingresso</td><td>{$selection.ingresso}</td></tr>
    </table>
</Content>