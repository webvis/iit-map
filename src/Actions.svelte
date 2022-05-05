<script>
    import Chip, { Set, LeadingIcon, Text } from '@smui/chips'

    $: chips = (navigator.share ? ['Share'] : []).concat(['Share by email'])
</script>

<style>
</style>

<Set {chips} let:chip>
    <Chip
      {chip}
      shouldRemoveOnTrailingIconClick={false}
      on:click={() => {
        if (chip == 'Share') {
          navigator.share({
            title: 'Share',
            text: 'Share',
            url: window.location
          })
        } else if (chip == 'Share by email') {
          window.location.href = 'mailto:?body=' + window.location
        }
      }}
    >
      <LeadingIcon class="material-icons">
        {#if chip == 'Share'}
          share
        {:else}
          mail
        {/if}
      </LeadingIcon>
      <Text tabindex={0}>{chip}</Text>
    </Chip>
</Set>