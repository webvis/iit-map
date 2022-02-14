<script>
    import { results, select } from 'anymapper'
    import { getQualifica } from './storesCNR.js'
    
    import List, {Item, Text, Graphic} from '@smui/list'
</script>

<style>
    a, a:hover, a:visited {
        color: inherit;
        text-decoration: none;
    }
    :global(.cnr-results .mdc-list-item__graphic) {
        margin-right: 16px;
    }
    .secondary {
        margin-left: 4px;
        color: var(--light-fg-color);
    }
</style>


<List singleSelection class="cnr-results">
    {#each $results as r}
        {#if r.type == 'person'}
            <Item on:SMUI:action={() => select(r.email)}>
                <Graphic class="material-icons">person</Graphic>
                <Text>{r.nome} {r.cognome} <span class="secondary">{getQualifica(r)}</span></Text>
            </Item>
        {:else if r.type == 'office'}
            <Item on:SMUI:action={() => select(r.id)}>
                <Graphic class="material-icons">meeting_room</Graphic>
                <Text>{r.id} <span class="secondary">Ufficio - Edificio {r.edificio}, Piano {r.piano}</span></Text>
            </Item>
        {:else if r.type == 'room'}
            <Item on:SMUI:action={() => select(r.id)}>
                <Graphic class="material-icons">meeting_room</Graphic>
                <Text>{r.id} <span class="secondary">Stanza</span></Text>
            </Item>
        {/if}
    {/each}
</List>
