<script>
    import { selection } from 'anymapper'
    import { getQualifica, getImmagine } from './storesCNR.js'

    import List, {Item, Graphic, Text, PrimaryText, SecondaryText} from '@smui/list'
</script>

<style>
    a, a:hover, a:visited {
        color: inherit;
        text-decoration: none;
    }
</style>

<List twoLine avatarList singleSelection>
	{#each $selection.people as person}
        <a href="#{person.email}">    
            <Item>
                <Graphic style="background: url({getImmagine(person)}) rgb(221,221,221); background-position-x: center!important; background-size: cover!important; background-repeat: no-repeat!important;" />
                <Text>
                    <PrimaryText>{person.nome} {person.cognome}</PrimaryText>
                    <SecondaryText>{getQualifica(person)}</SecondaryText>
                </Text>
            </Item>
        </a>
    {/each}
</List>