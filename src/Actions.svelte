<script>
    import Chip, { Set, LeadingIcon, Text } from '@smui/chips'

    $: chips = (navigator.share ? ['Share'] : []).concat(['Copy link','Share by email'])
</script>

<style>
:global(.action_chip) {
    background: transparent;
    outline: 1px solid lightgray;
    color: var(--primary-bg-color);
    font-weight: bold;
}
:global(.action_chip:hover) {
    /* background: transparent; */
    color: var(--primary-bg-color);
    outline: 1px solid var(--primary-bg-color);
}
:global(.action_chip .mdc-chip__icon) {
    color: var(--primary-bg-color);
}
</style>

<Set {chips} let:chip>
    <Chip
      {chip}
      shouldRemoveOnTrailingIconClick={false}
      class="action_chip"
      on:click={() => {
        if (chip == 'Share') {
          navigator.share({
            title: 'Share location',
            text: 'IIT map location',
            url: window.location
          })
        } else if (chip == 'Copy link') {
          navigator.clipboard.writeText(window.location)
        } else if (chip == 'Share by email') {
          window.location.href = 'mailto:?body=' + window.location
        }
      }}
    >
      <LeadingIcon class="material-icons">
        {#if chip == 'Share'}
          share
        {:else if chip == 'Copy link'}
          link
        {:else}
          mail
        {/if}
      </LeadingIcon>
      <Text tabindex={0}>{chip}</Text>
    </Chip>
</Set>