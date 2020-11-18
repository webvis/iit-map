<script>
    import { selection } from './core/stores.js'

    import { Content } from '@smui/card'

    let web = "www.iit.cnr.it/" + $selection.email.split('@', 1)
</script>

<Content>
    <table>
        <tr><td>web</td><td><a href="//{web}">{web}</a></td></tr>
        <tr><td>e-mail</td><td><a href="mailto: {$selection.email}">{$selection.email}</a></td></tr>
        {#if $selection.telefono}<tr><td>Telefono</td><td><a href="tel: {$selection.telefono}">{$selection.telefono}</a></td></tr>{/if}
        {#if $selection.cellulare}<tr><td>Cellulare</td><td><a href="tel: {$selection.cellulare}">{$selection.cellulare}</a></td></tr>{/if}
    </table>
</Content>