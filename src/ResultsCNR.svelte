<script>
    import { results, select, hover_enter, hover_leave } from 'anymapper'
    import { getQualifica } from './storesCNR.js'
    
    import {Item, Text, Graphic} from '@smui/list'
</script>

<style>
    :global(.cnr-result-item .mdc-deprecated-list-item__graphic) {
        margin-right: 16px;
    }
    .secondary {
        margin-left: 4px;
        color: var(--light-fg-color);
    }
</style>

{#each $results as r, i}
    {#if r.type == 'person'}
        <Item class="cnr-result-item" on:SMUI:action={() => select(r.email)}>
            <Graphic class="material-icons">person</Graphic>
            <Text>{r.nome} {r.cognome} <span class="secondary">{getQualifica(r)}</span></Text>
        </Item>
    {:else if r.type == 'office'}
        <Item class="cnr-result-item" on:SMUI:action={() => select(r.id)} on:mouseenter={() => hover_enter(r.id)} on:mouseleave={() => hover_leave(r.id)}>
            <Graphic class="material-icons">meeting_room</Graphic>
            <Text>{r.id} <span class="secondary">Ufficio - Edificio {r.edificio}, Piano {r.piano}</span></Text>
        </Item>
    {:else if r.type == 'room'}
        <Item class="cnr-result-item" on:SMUI:action={() => select(r.id)} on:mouseenter={() => hover_enter(r.id)} on:mouseleave={() => hover_leave(r.id)}>
            <Graphic class="material-icons">meeting_room</Graphic>
            <Text>{r.id} <span class="secondary">Stanza</span></Text>
        </Item>
    {:else if r.type == 'poi'}
        <Item class="cnr-result-item" on:SMUI:action={() => select(r.id)} on:mouseenter={() => hover_enter(r.id)} on:mouseleave={() => hover_leave(r.id)}>
            <Graphic class="material-icons">place</Graphic>
            <Text>{r.title}</Text>
        </Item>
    {/if}
{/each}