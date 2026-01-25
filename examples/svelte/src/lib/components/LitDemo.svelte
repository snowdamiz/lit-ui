<script lang="ts">
  import type { Dialog } from '@lit-ui/dialog';

  let count = $state(0);
  let dialogOpen = $state(false);
  let dialogRef: Dialog | undefined = $state();

  // Handle dialog open/close through the DOM element
  $effect(() => {
    const dialog = dialogRef;
    if (!dialog) return;

    if (dialogOpen) {
      dialog.show();
    } else {
      dialog.close();
    }
  });

  function handleDialogClose() {
    dialogOpen = false;
  }
</script>

<div class="demo" style="--lui-button-radius: 8px;">
  <div class="button-row">
    <lui-button variant="primary" onclick={() => count++}>
      Clicked {count} times
    </lui-button>

    <lui-button variant="secondary" onclick={() => (dialogOpen = true)}>
      Open Dialog
    </lui-button>
  </div>

  <lui-dialog bind:this={dialogRef} onclose={handleDialogClose}>
    <span slot="title">Hello from Lit UI</span>
    <p>This dialog is a Lit component rendered in Svelte.</p>
    <p>The showModal/close APIs work correctly with Svelte 5 runes.</p>
    <div slot="footer" class="dialog-footer">
      <lui-button variant="secondary" onclick={() => (dialogOpen = false)}>
        Close
      </lui-button>
      <lui-button variant="primary" onclick={() => (dialogOpen = false)}>
        Confirm
      </lui-button>
    </div>
  </lui-dialog>
</div>

<style>
  .button-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .dialog-footer {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
