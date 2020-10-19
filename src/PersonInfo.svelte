<script>
    import { selection } from './core/stores.js'

    import { Content } from '@smui/card'
</script>

<style>
    table {
        border-spacing: 0;
    }
    td:first-child {
        width: 80px;
        font-weight: bold;
    }
    tr:not(:last-child) > td {
        padding-bottom: 6px;
    }
</style>

<Content>
    <table>
        <tr><td>e-mail</td><td><a href="mailto: {$selection.email}">{$selection.email}</a></td></tr>
        {#if $selection.telefono}<tr><td>Telefono</td><td><a href="tel: {$selection.telefono}">{$selection.telefono}</a></td></tr>{/if}
        {#if $selection.cellulare}<tr><td>Cellulare</td><td><a href="tel: {$selection.cellulare}">{$selection.cellulare}</a></td></tr>{/if}
    </table>
</Content>