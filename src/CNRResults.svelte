<script>
    import { results } from './core/stores.js'
    import { getQualifica } from './storesCNR.js'
    
    import List, {Item, Text, PrimaryText, SecondaryText} from '@smui/list'
</script>

<style>
    a, a:hover, a:visited {
        color: inherit;
        text-decoration: none;
    }
</style>


<List singleSelection>
    {#each $results as r}
        {#if r.type == 'person'}
            <a href="#{r.email}">    
                <Item>
                    <Text>{r.nome} {r.cognome} <span style="color: var(--light-fg-color);">{getQualifica(r)}</span></Text>
                </Item>
            </a>
        {:else if r.type == 'room'}
            <a href="#{r.id}">    
                <Item>
                    <Text>{r.id} <span style="color: var(--light-fg-color);">Edificio {r.edificio} Piano {r.piano}</span></Text>
                </Item>
            </a>
        {/if}
    {/each}
</List>
