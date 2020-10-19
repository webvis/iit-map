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
    {#each $results as person}
        <a href="#{person.email}">    
            <Item>
                <Text>{person.nome} {person.cognome} <span style="color: var(--light-fg-color);">{getQualifica(person)}</span></Text>
            </Item>
        </a>
    {/each}
</List>
